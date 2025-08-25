const path = require('path');
const DocumentationIndex = require('../services/DocumentationIndex');
const logger = require('../utils/logger');

async function buildIndex() {
    try {
        logger.info('Starting documentation index build...');
        
        const docsPath = path.join(__dirname, '../../content/en/docs');
        const documentationIndex = new DocumentationIndex({
            contentPath: docsPath
        });
        
        await documentationIndex.initialize();
        
        const stats = documentationIndex.getStats();
        
        logger.info('Documentation index build completed!');
        logger.info('Index Statistics:');
        logger.info(`- Total Documents: ${stats.totalDocuments}`);
        logger.info(`- Total Topics: ${stats.totalTopics}`);
        logger.info(`- Average Words per Document: ${stats.averageWordsPerDocument}`);
        
        // Get topics for preview
        const topics = await documentationIndex.getTopics();
        logger.info('\nTopics found:');
        topics.forEach(topic => {
            logger.info(`- ${topic.name}: ${topic.documentCount} documents`);
        });
        
        // Test search functionality
        logger.info('\nTesting search functionality...');
        const testQueries = [
            'installation',
            'chaos scenarios',
            'krknctl',
            'getting started'
        ];
        
        for (const query of testQueries) {
            const results = await documentationIndex.search(query, { limit: 3 });
            logger.info(`Search "${query}": ${results.length} results`);
            results.forEach((result, index) => {
                logger.info(`  ${index + 1}. ${result.title} (score: ${result.score.toFixed(2)})`);
            });
        }
        
        logger.info('\nIndex build and testing completed successfully!');
        
    } catch (error) {
        logger.error('Failed to build documentation index:', error);
        process.exit(1);
    }
}

// Run the build
if (require.main === module) {
    buildIndex();
}

module.exports = buildIndex;
