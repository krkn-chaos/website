#!/usr/bin/env node

/**
 * Build-time script to create search index from markdown files
 * This runs during Hugo build when content files are available
 */

const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const cheerio = require('cheerio');
const Fuse = require('fuse.js');

// Build-time version that reads markdown files directly
class BuildTimeIndexer {
    constructor(contentPath) {
        this.contentPath = contentPath;
        this.indexData = [];
        this.topics = new Map();
        
        // Configure marked for parsing markdown
        marked.setOptions({
            gfm: true,
            breaks: false,
            smartLists: true
        });
    }

    async buildIndex() {
        await this.processDirectory(this.contentPath);
    }

    async processDirectory(dirPath) {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                await this.processDirectory(fullPath);
            } else if (entry.isFile() && entry.name.endsWith('.md')) {
                await this.processMarkdownFile(fullPath);
            }
        }
    }

    async processMarkdownFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf-8');
            const parsed = this.parseMarkdown(content);
            
            if (parsed && parsed.title) {
                const url = this.generateUrl(filePath);
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
            }
        } catch (error) {
            // Skip files that can't be processed
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
                const yamlLines = frontmatterMatch[1].split('\n');
                for (const line of yamlLines) {
                    const colonIndex = line.indexOf(':');
                    if (colonIndex > 0) {
                        const key = line.substring(0, colonIndex).trim();
                        const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                        frontmatter[key] = value;
                    }
                }
            }
            
            // Convert markdown to HTML then extract text
            const html = marked(markdownContent);
            const $ = cheerio.load(html);
            const textContent = $.text().replace(/\s+/g, ' ').trim();
            
            // Extract title
            let title = frontmatter.title;
            if (!title) {
                const firstHeading = $('h1, h2').first().text().trim();
                title = firstHeading || 'Untitled';
            }
            
            // Extract description  
            let description = frontmatter.description;
            if (!description) {
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
                tags
            };
        } catch (error) {
            return null;
        }
    }

    generateUrl(filePath) {
        const relativePath = path.relative(this.contentPath, filePath);
        let url = '/' + relativePath.replace(/\\/g, '/').replace(/\.md$/, '/').replace(/_index\/$/, '');
        return url.replace(/\/+/g, '/') || '/';
    }

    extractTopic(filePath) {
        const relativePath = path.relative(this.contentPath, filePath);
        const pathParts = relativePath.split(path.sep);
        return pathParts.length > 0 ? pathParts[0] : 'general';
    }

    countWords(text) {
        return text.split(/\s+/).filter(word => word.length > 0).length;
    }
}

async function buildSearchIndex() {
    console.log('Building search index...');
    
    try {
        const contentPath = path.join(__dirname, '../content/en');
        const indexer = new BuildTimeIndexer(contentPath);
        await indexer.buildIndex();
        
        const indexData = {
            documents: indexer.indexData,
            topics: Array.from(indexer.topics.entries()).map(([name, docs]) => ({
                name,
                documentCount: docs.length
            })),
            buildTime: new Date().toISOString()
        };
        
        const outputPath = path.join(__dirname, '../static/search-index.json');
        await fs.writeFile(outputPath, JSON.stringify(indexData, null, 2));
        
        console.log(`✅ Indexed ${indexData.documents.length} documents`);
        
    } catch (error) {
        console.error('Failed to build search index:', error);
        process.exit(1);
    }
}

buildSearchIndex();
