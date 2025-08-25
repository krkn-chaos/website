// Krkn Chatbot API Configuration

module.exports = {
    // Server Configuration
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',
    
    // CORS Configuration
    allowedOrigins: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:1313', 'https://krkn-chaos.dev', 'http://127.0.0.1:1313'],
    
    // LLM Service Configuration
    llm: {
        provider: process.env.LLM_PROVIDER || 'gemini', // 'openai', 'anthropic', or 'gemini'
        apiKey: process.env.LLM_API_KEY, // REQUIRED: Set in .env file
        model: process.env.LLM_MODEL || 'gemini-2.5-flash', // supported models: gemini-1.5-flash, gemini-1.5-pro, gemini-2.5-flash
        maxTokens: parseInt(process.env.LLM_MAX_TOKENS) || 2000,
        temperature: parseFloat(process.env.LLM_TEMPERATURE) || 0.7
    },
    
    // Documentation Configuration
    documentation: {
        contentPath: process.env.DOCS_PATH || '../content/en/docs'
    },
    
    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info'
    },
    
    // Rate Limiting Configuration
    rateLimiting: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
        chatWindowMs: parseInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes
        chatMaxRequests: parseInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS) || 20,
        dailyLimit: parseInt(process.env.DAILY_CHAT_LIMIT) || 100 // Daily limit for chat requests
    }
};

// Validate LLM configuration
if (!process.env.LLM_API_KEY) {
    console.warn('WARNING: LLM_API_KEY environment variable not configured. Chatbot will use fallback responses.');
}
