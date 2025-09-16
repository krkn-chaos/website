const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const cheerio = require('cheerio');
const Fuse = require('fuse.js');
const natural = require('natural');
const logger = require('../utils/logger');

// Only import chokidar in non-serverless environments
let chokidar;
const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
if (!isServerless) {
    try {
        chokidar = require('chokidar');
    } catch (error) {
        logger.warn('chokidar not available - file watching disabled');
    }
}

class DocumentationIndex {
    constructor(options = {}) {
        this.contentPath = options.contentPath || this.resolveContentPath();
        this.indexData = [];
        this.fuseIndex = null;
        this.topics = new Map();
        this.watcher = null;
        this.rebuildTimeout = null;
        
        // Configure marked for parsing markdown
        marked.setOptions({
            gfm: true,
            breaks: false,
            smartLists: true
        });
        
        // Configure Fuse.js options for fuzzy search
        this.fuseOptions = {
            keys: [
                { name: 'title', weight: 0.4 },
                { name: 'content', weight: 0.3 },
                { name: 'tags', weight: 0.2 },
                { name: 'description', weight: 0.1 }
            ],
            threshold: 0.6,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 3,
            ignoreLocation: true
        };
    }

    resolveContentPath() {
        // Two main scenarios to handle:
        const possiblePaths = [
            // 1. Local development: running from api/services/ directory
            path.join(__dirname, '../../content/en'),
            // 2. Serverless/production: working directory is project root
            path.join(process.cwd(), 'content/en')
        ];

        // Try each path and use the first one that exists
        for (const contentPath of possiblePaths) {
            try {
                const fs = require('fs');
                if (fs.existsSync(contentPath)) {
                    logger.info(`Content path resolved to: ${contentPath}`);
                    return contentPath;
                }
                logger.debug(`Path not found: ${contentPath}`);
            } catch (error) {
                logger.debug(`Path ${contentPath} not accessible: ${error.message}`);
            }
        }

        // If neither works, log diagnostic info and use serverless path as fallback
        const fallbackPath = path.join(process.cwd(), 'content/en');
        logger.error(`Content path resolution failed!`);
        logger.error(`Working directory: ${process.cwd()}`);
        logger.error(`__dirname: ${__dirname}`);
        logger.error(`Using fallback: ${fallbackPath}`);
        return fallbackPath;
    }

    async initialize() {
        try {
            logger.info('Initializing documentation index...');
            await this.buildIndex();
            this.createFuseIndex();
            logger.info(`Documentation index built with ${this.indexData.length} documents`);
        } catch (error) {
            logger.error('Failed to initialize documentation index:', error);
            throw error;
        }
    }

    async buildIndex() {
        this.indexData = [];
        this.topics.clear();
        
        logger.info(`Starting to build index from content path: ${this.contentPath}`);
        
        // Check if content path exists
        try {
            await fs.access(this.contentPath);
            logger.info(`Content path is accessible: ${this.contentPath}`);
        } catch (error) {
            logger.error(`Content path is not accessible: ${this.contentPath}`, error);
            return; // Exit early if path doesn't exist
        }
        
        await this.processDirectory(this.contentPath);
    }

    async processDirectory(dirPath) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    await this.processDirectory(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.md')) {
                    await this.processMarkdownFile(fullPath);
                }
            }
        } catch (error) {
            logger.error(`Error processing directory ${dirPath}:`, error);
        }
    }

    async processMarkdownFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = this.parseMarkdown(content);
            
            if (parsed && parsed.title) {
                // Generate URL from file path
                const url = this.generateUrl(filePath);
                
                // Extract topic from path
                const topic = this.extractTopic(filePath);
                
                const document = {
                    id: filePath,
                    title: parsed.title,
                    description: parsed.description || '',
                    content: parsed.content,
                    tags: parsed.tags || [],
                    topic: topic,
                    url: url,
                    lastModified: (await fs.stat(filePath)).mtime,
                    wordCount: this.countWords(parsed.content)
                };
                
                this.indexData.push(document);
                
                // Add to topics map
                if (topic) {
                    if (!this.topics.has(topic)) {
                        this.topics.set(topic, []);
                    }
                    this.topics.get(topic).push(document);
                }
                
                logger.debug(`Indexed: ${document.title} (${document.wordCount} words)`);
            }
        } catch (error) {
            logger.error(`Error processing file ${filePath}:`, error);
        }
    }

    parseMarkdown(content) {
        try {
            // Extract frontmatter
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            let frontmatter = {};
            let markdownContent = content;
            
            if (frontmatterMatch) {
                markdownContent = content.substring(frontmatterMatch[0].length);
                try {
                    // Simple YAML parsing for common frontmatter fields
                    const yamlLines = frontmatterMatch[1].split('\n');
                    for (const line of yamlLines) {
                        const colonIndex = line.indexOf(':');
                        if (colonIndex > 0) {
                            const key = line.substring(0, colonIndex).trim();
                            const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                            frontmatter[key] = value;
                        }
                    }
                } catch (yamlError) {
                    logger.warn('Failed to parse frontmatter YAML:', yamlError);
                }
            }
            
            // Convert markdown to HTML
            const html = marked(markdownContent);
            
            // Extract text content using cheerio
            const $ = cheerio.load(html);
            const textContent = $.text().replace(/\s+/g, ' ').trim();
            
            // Extract title (from frontmatter or first heading)
            let title = frontmatter.title;
            if (!title) {
                const firstHeading = $('h1, h2').first().text().trim();
                title = firstHeading || 'Untitled';
            }
            
            // Extract description
            let description = frontmatter.description;
            if (!description) {
                // Use first paragraph as description
                const firstParagraph = $('p').first().text().trim();
                description = firstParagraph.substring(0, 200) + (firstParagraph.length > 200 ? '...' : '');
            }
            
            // Extract tags
            let tags = [];
            if (frontmatter.tags) {
                tags = frontmatter.tags.split(',').map(tag => tag.trim());
            }
            
            return {
                title,
                description,
                content: textContent,
                tags,
                linkTitle: frontmatter.linkTitle || title,
                weight: parseInt(frontmatter.weight) || 0
            };
            
        } catch (error) {
            logger.error('Error parsing markdown:', error);
            return null;
        }
    }

    generateUrl(filePath) {
        // Convert file path to Hugo URL structure
        // contentPath is now 'content/en', so get relative path from there
        const relativePath = path.relative(this.contentPath, filePath);
        let url = '/' + relativePath.replace(/\\/g, '/').replace(/\.md$/, '/').replace(/_index\/$/, '');
        
        url = url.replace(/\/+/g, '/');
        
        return url || '/';
    }

    extractTopic(filePath) {
        const relativePath = path.relative(this.contentPath, filePath);
        const pathParts = relativePath.split(path.sep);
        
        if (pathParts.length > 0) {
            return pathParts[0];
        }
        
        return 'general';
    }

    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }

    createFuseIndex() {
        if (this.indexData.length > 0) {
            this.fuseIndex = new Fuse(this.indexData, this.fuseOptions);
            logger.info('Fuse search index created');
        }
    }

    async search(query, options = {}) {
        if (!this.fuseIndex) {
            logger.warn('Search attempted but index not available');
            return [];
        }
        
        const {
            limit = 10,
            threshold = 0.6,
            topic = null
        } = options;
        
        try {
            // Use Fuse.js for fuzzy search
            let results = this.fuseIndex.search(query, { limit: limit * 2 }); // Get more results for filtering
            
            // Filter by topic if specified
            if (topic) {
                results = results.filter(result => result.item.topic === topic);
            }
            
            // Convert Fuse results to our format
            const searchResults = results.slice(0, limit).map(result => ({
                id: result.item.id,
                title: result.item.title,
                description: result.item.description,
                content: this.extractRelevantContent(result.item.content, query),
                topic: result.item.topic,
                url: result.item.url,
                score: 1 - result.score, // Invert score (higher is better)
                matches: result.matches
            }));
            
            logger.debug(`Search for "${query}" returned ${searchResults.length} results`);
            return searchResults;
            
        } catch (error) {
            logger.error('Search error:', error);
            return [];
        }
    }

    extractRelevantContent(content, query) {
        // Simple content extraction with query matching
        const queryWords = query.toLowerCase().split(/\s+/);
        const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Find sentences containing query words
        const matchingSentences = sentences.filter(sentence => {
            const sentenceLower = sentence.toLowerCase();
            return queryWords.some(word => sentenceLower.includes(word));
        });
        
        if (matchingSentences.length > 0) {
            // Use the most relevant matching sentence as excerpt
            const result = matchingSentences.slice(0, 1).join('. ').trim();
            return result.substring(0, 200) + (result.length > 200 ? '...' : '');
        } else {
            // Fallback to beginning of content
            return content.substring(0, 200) + (content.length > 200 ? '...' : '');
        }
    }

    async getTopics() {
        const topicsArray = Array.from(this.topics.entries()).map(([topic, documents]) => ({
            name: topic,
            documentCount: documents.length,
            description: this.generateTopicDescription(topic)
        }));
        
        return topicsArray.sort((a, b) => b.documentCount - a.documentCount);
    }

    generateTopicDescription(topic) {
        return `Documentation related to ${topic}`;
    }

    // Enable file watching for automatic index rebuilding
    startFileWatching() {
        if (!chokidar || isServerless) {
            logger.info('File watching not available in serverless environment');
            return;
        }

        if (this.watcher) {
            logger.warn('File watcher already running');
            return;
        }

        try {
            this.watcher = chokidar.watch(this.contentPath, {
                ignored: /(^|[\/\\])\../, // ignore dotfiles
                persistent: true,
                ignoreInitial: true, // don't trigger on initial scan
                depth: 10 // watch subdirectories
            });

            this.watcher
                .on('add', (path) => {
                    logger.info(`Documentation file added: ${path}`);
                    this.scheduleRebuild();
                })
                .on('change', (path) => {
                    logger.info(`Documentation file changed: ${path}`);
                    this.scheduleRebuild();
                })
                .on('unlink', (path) => {
                    logger.info(`Documentation file removed: ${path}`);
                    this.scheduleRebuild();
                })
                .on('error', (error) => {
                    logger.error('File watcher error:', error);
                });

            logger.info(`Started file watching for documentation changes: ${this.contentPath}`);
        } catch (error) {
            logger.error('Failed to start file watcher:', error);
        }
    }

    // Stop file watching
    stopFileWatching() {
        if (this.watcher) {
            this.watcher.close();
            this.watcher = null;
            logger.info('Stopped file watching');
        }
    }

    // Debounced rebuild to avoid too frequent rebuilds
    scheduleRebuild() {
        if (this.rebuildTimeout) {
            clearTimeout(this.rebuildTimeout);
        }

        this.rebuildTimeout = setTimeout(async () => {
            try {
                logger.info('Rebuilding documentation index due to file changes...');
                await this.buildIndex();
                this.createFuseIndex();
                logger.info(`Documentation index rebuilt with ${this.indexData.length} documents`);
            } catch (error) {
                logger.error('Failed to rebuild documentation index:', error);
            }
        }, 2000); // Wait 2 seconds after last change
    }

    // Manual rebuild method for API endpoint
    async rebuildIndex() {
        try {
            logger.info('Manual documentation index rebuild triggered');
            await this.buildIndex();
            this.createFuseIndex();
            logger.info(`Documentation index rebuilt with ${this.indexData.length} documents`);
            return { success: true, documentCount: this.indexData.length };
        } catch (error) {
            logger.error('Failed to rebuild documentation index:', error);
            throw error;
        }
    }

    getStats() {
        return {
            totalDocuments: this.indexData.length,
            totalTopics: this.topics.size,
            averageWordsPerDocument: this.indexData.length > 0 
                ? Math.round(this.indexData.reduce((sum, doc) => sum + doc.wordCount, 0) / this.indexData.length)
                : 0,
            lastIndexed: new Date().toISOString()
        };
    }
}

module.exports = DocumentationIndex;
