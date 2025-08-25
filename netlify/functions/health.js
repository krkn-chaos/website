// Health check endpoint for Netlify Functions

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow GET
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                chatFunction: true,
                documentationIndex: true
            },
            deployment: 'netlify-functions',
            dailyUsage: {
                note: 'Daily usage tracking available in chat responses',
                limit: parseInt(process.env.DAILY_CHAT_LIMIT) || 100
            }
        })
    };
};