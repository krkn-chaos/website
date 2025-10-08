// Polyfill for Web APIs in Node.js environment
if (typeof globalThis.File === 'undefined') {
    globalThis.File = class File {
        constructor(bits, name, options = {}) {
            this.name = name;
            this.type = options.type || '';
            this.lastModified = options.lastModified || Date.now();
        }
    };
}

const DocumentationIndex = require('../../api/services/DocumentationIndex');

let documentationIndex;

const initializeServices = async () => {
    if (!documentationIndex) {
        documentationIndex = new DocumentationIndex();
        await documentationIndex.initialize();
    }
};

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Initialize services if needed
        await initializeServices();

        // Reload the documentation index
        const result = await documentationIndex.rebuildIndex();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Documentation index rebuilt successfully',
                ...result,
                timestamp: new Date().toISOString(),
                deployment: 'netlify-functions'
            })
        };

    } catch (error) {
        console.error('Rebuild index error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to rebuild documentation index',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
