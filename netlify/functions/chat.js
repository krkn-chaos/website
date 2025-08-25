const ChatService = require('../../api/services/ChatService');
const DocumentationIndex = require('../../api/services/DocumentationIndex');

// Initialize services
let chatService = null;
let documentationIndex = null;

// Simple daily usage tracking for serverless (using memory)
let dailyUsage = {
    date: new Date().toISOString().split('T')[0],
    count: 0
};

const DAILY_LIMIT = parseInt(process.env.DAILY_CHAT_LIMIT) || 100;

function checkDailyLimit() {
    const today = new Date().toISOString().split('T')[0];
    
    // Reset if new day
    if (dailyUsage.date !== today) {
        dailyUsage = { date: today, count: 0 };
    }
    
    return dailyUsage.count < DAILY_LIMIT;
}

function incrementUsage() {
    const today = new Date().toISOString().split('T')[0];
    
    // Reset if new day
    if (dailyUsage.date !== today) {
        dailyUsage = { date: today, count: 0 };
    }
    
    dailyUsage.count++;
    return dailyUsage.count;
}

const initializeServices = async () => {
    if (!documentationIndex) {
        documentationIndex = new DocumentationIndex({
            contentPath: './content/en/docs'
        });
        await documentationIndex.buildIndex();
    }
    
    if (!chatService) {
        chatService = new ChatService({
            documentationIndex,
            llmProvider: process.env.LLM_PROVIDER || 'gemini',
            apiKey: process.env.LLM_API_KEY,
            model: process.env.LLM_MODEL || 'gemini-2.5-flash',
            maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || 1000,
            temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7
        });
    }
};

exports.handler = async (event, context) => {
    // Handle CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Check daily limit first
        if (!checkDailyLimit()) {
            return {
                statusCode: 429,
                headers,
                body: JSON.stringify({
                    error: 'Daily limit exceeded',
                    message: `Daily chat limit of ${DAILY_LIMIT} requests has been reached. Please try again tomorrow.`,
                    dailyUsage: {
                        current: dailyUsage.count,
                        limit: DAILY_LIMIT,
                        remaining: 0
                    }
                })
            };
        }

        // Initialize services
        await initializeServices();

        // Parse request body
        const { message, conversationHistory = [] } = JSON.parse(event.body);

        if (!message || typeof message !== 'string') {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Process message
        const response = await chatService.processMessage(message, {
            conversationHistory
        });

        // Increment usage count
        const currentUsage = incrementUsage();

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                response,
                timestamp: new Date().toISOString(),
                dailyUsage: {
                    current: currentUsage,
                    limit: DAILY_LIMIT,
                    remaining: DAILY_LIMIT - currentUsage
                }
            })
        };

    } catch (error) {
        console.error('Chat function error:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                response: "I'm having trouble right now. Please try again later or check the documentation directly.",
                timestamp: new Date().toISOString()
            })
        };
    }
};
