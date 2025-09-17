const fs = require('fs').promises;
const path = require('path');
const Fuse = require('fuse.js');
const logger = require('../utils/logger');


class DocumentationIndex {
    constructor(options = {}) {
        this.indexData = [];
        this.fuseIndex = null;
        this.topics = new Map();
        
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


    async loadPrebuiltIndex() {
        try {
            const indexPath = path.join(process.cwd(), 'search-index.json');
            const indexData = await fs.readFile(indexPath, 'utf-8');
            const parsedData = JSON.parse(indexData);
            
            // Load the documents into our index
            this.indexData = parsedData.documents;
            
            // Rebuild topics map
            this.topics.clear();
            for (const doc of this.indexData) {
                if (doc.topic) {
                    if (!this.topics.has(doc.topic)) {
                        this.topics.set(doc.topic, []);
                    }
                    this.topics.get(doc.topic).push(doc);
                }
            }
            
            this.createFuseIndex();
            return true;
        } catch (error) {
            logger.error(`Failed to load pre-built index: ${error.message}`);
            return false;
        }
    }

    async initialize() {
        try {
            const loaded = await this.loadPrebuiltIndex();
            if (!loaded) {
                throw new Error('Pre-built search index not found');
            }
            logger.info(`Loaded ${this.indexData.length} documents`);
        } catch (error) {
            logger.error('Failed to initialize documentation index:', error);
            throw error;
        }
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


    async rebuildIndex() {
        try {
            const loaded = await this.loadPrebuiltIndex();
            if (!loaded) {
                throw new Error('Pre-built search index not found');
            }
            
            return { 
                success: true, 
                documentCount: this.indexData.length,
                version: 'build-time-index',
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error('Failed to reload documentation index:', error);
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
