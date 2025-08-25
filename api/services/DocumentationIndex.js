const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const cheerio = require('cheerio');
const Fuse = require('fuse.js');
const natural = require('natural');
const logger = require('../utils/logger');

class DocumentationIndex {
    constructor(options = {}) {
        this.contentPath = options.contentPath || path.join(__dirname, '../../content/en/docs');
        this.indexData = [];
        this.fuseIndex = null;
        this.topics = new Map();
        
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
            threshold: 0.4,
            includeScore: true,
            includeMatches: true,
            minMatchCharLength: 3,
            ignoreLocation: true
        };
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
        
        await this.processDirectory(this.contentPath);
        
        // Process additional content directories if they exist
        const additionalPaths = [
            path.join(__dirname, '../../content/en/blog'),
            path.join(__dirname, '../../content/en/community')
        ];
        
        for (const additionalPath of additionalPaths) {
            try {
                await fs.access(additionalPath);
                await this.processDirectory(additionalPath);
            } catch (error) {
                // Directory doesn't exist, skip it
                logger.debug(`Skipping directory: ${additionalPath}`);
            }
        }
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
        const relativePath = path.relative(path.join(__dirname, '../../content/en'), filePath);
        let url = '/' + relativePath.replace(/\\/g, '/').replace(/\.md$/, '/').replace(/_index\/$/, '');
        
        // Clean up the URL
        url = url.replace(/\/+/g, '/');
        if (url !== '/' && url.endsWith('/')) {
            url = url.slice(0, -1);
        }
        
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
            threshold = 0.4,
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
            // For queries with technical terms, use shorter excerpts
            const hasTechnicalTerms = queryWords.some(word => 
                ['etcd', 'kubernetes', 'production', 'deployment', 'troubleshoot'].includes(word)
            );
            const result = matchingSentences.slice(0, 1).join('. ').trim();
            return result.substring(0, 80) + (result.length > 80 ? '...' : '');
        } else {
            return content.substring(0, 80) + (content.length > 80 ? '...' : '');
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
