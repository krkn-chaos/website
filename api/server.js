const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// Load configuration
const config = require('./config.js');

const ChatService = require('./services/ChatService');
const DocumentationIndex = require('./services/DocumentationIndex');
const DailyUsageTracker = require('./utils/dailyUsageTracker');
const logger = require('./utils/logger');

const app = express();
const PORT = config.port;

// Security middleware
app.use(helmet());
app.use(cors({
    origin: config.allowedOrigins,
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: config.rateLimiting.windowMs,
    max: config.rateLimiting.maxRequests,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limiting for chat endpoint
const chatLimiter = rateLimit({
    windowMs: config.rateLimiting.chatWindowMs,
    max: config.rateLimiting.chatMaxRequests,
    message: 'Too many chat requests, please slow down.',
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize services
let chatService;
let documentationIndex;
let dailyUsageTracker;

async function initializeServices() {
    try {
        logger.info('Initializing services...');
        
        // Initialize daily usage tracker
        dailyUsageTracker = new DailyUsageTracker();
        await dailyUsageTracker.initialize();
        
        // Initialize documentation index
        documentationIndex = new DocumentationIndex();
        await documentationIndex.initialize();
        
        // Initialize chat service with documentation context
        chatService = new ChatService({
            documentationIndex,
            llmProvider: config.llm.provider,
            apiKey: config.llm.apiKey,
            model: config.llm.model,
            maxTokens: config.llm.maxTokens,
            temperature: config.llm.temperature,
            projectId: config.llm.projectId,
            location: config.llm.location
        });
        
        logger.info('Services initialized successfully');
    } catch (error) {
        logger.error('Failed to initialize services:', error);
        process.exit(1);
    }
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const currentUsage = dailyUsageTracker ? await dailyUsageTracker.getCurrentUsage() : 0;
        const remainingUsage = dailyUsageTracker ? await dailyUsageTracker.getRemainingUsage(config.rateLimiting.dailyLimit) : config.rateLimiting.dailyLimit;
        
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                chatService: !!chatService,
                documentationIndex: !!documentationIndex,
                dailyUsageTracker: !!dailyUsageTracker
            },
            dailyUsage: {
                current: currentUsage,
                limit: config.rateLimiting.dailyLimit,
                remaining: remainingUsage
            }
        });
    } catch (error) {
        logger.error('Health check error:', error);
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                chatService: !!chatService,
                documentationIndex: !!documentationIndex,
                dailyUsageTracker: !!dailyUsageTracker
            },
            dailyUsage: {
                current: 'unknown',
                limit: config.rateLimiting.dailyLimit,
                remaining: 'unknown'
            }
        });
    }
});

// Daily limit middleware for chat endpoint
const dailyLimitMiddleware = async (req, res, next) => {
    try {
        if (!dailyUsageTracker) {
            return next(); // Continue if tracker not available
        }

        // Check if daily limit exceeded
        if (await dailyUsageTracker.hasExceededLimit(config.rateLimiting.dailyLimit)) {
            const currentUsage = await dailyUsageTracker.getCurrentUsage();
            
            logger.warn('Daily chat limit exceeded', {
                currentUsage,
                limit: config.rateLimiting.dailyLimit,
                ip: req.ip
            });

            return res.status(429).json({
                error: 'Daily limit exceeded',
                message: `Daily chat limit of ${config.rateLimiting.dailyLimit} requests has been reached. Please try again tomorrow.`,
                dailyUsage: {
                    current: currentUsage,
                    limit: config.rateLimiting.dailyLimit,
                    remaining: 0
                }
            });
        }

        next();
    } catch (error) {
        logger.error('Daily limit middleware error:', error);
        next(); // Continue on error to avoid blocking service
    }
};

// Chat endpoint
app.post('/api/chat',
    chatLimiter,
    dailyLimitMiddleware,
    [
        body('message')
            .trim()
            .isLength({ min: 1, max: 1000 })
            .withMessage('Message must be between 1 and 1000 characters'),
        body('context')
            .optional()
            .isString()
            .withMessage('Context must be a string'),
        body('conversationHistory')
            .optional()
            .isArray()
            .withMessage('Conversation history must be an array')
    ],
    async (req, res) => {
        try {
            // Check for validation errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: errors.array()
                });
            }

            const { message, context, conversationHistory } = req.body;
            
            // Log the request (without sensitive data)
            logger.info('Chat request received', {
                messageLength: message.length,
                context: context || 'none',
                hasConversationHistory: !!conversationHistory && conversationHistory.length > 0,
                ip: req.ip
            });

            // Check if services are initialized
            if (!chatService || !documentationIndex) {
                return res.status(503).json({
                    error: 'Services not available',
                    message: 'Chat service is currently unavailable. Please try again later.'
                });
            }

            // Process the chat request
            const response = await chatService.processMessage(message, {
                context: context || 'krkn-documentation',
                conversationHistory: conversationHistory || [],
                userIP: req.ip
            });

            // Increment daily usage counter
            if (dailyUsageTracker) {
                try {
                    const newUsageCount = await dailyUsageTracker.incrementUsage();
                    const remaining = await dailyUsageTracker.getRemainingUsage(config.rateLimiting.dailyLimit);
                    
                    logger.info('Daily usage incremented', {
                        currentUsage: newUsageCount,
                        remaining: remaining,
                        limit: config.rateLimiting.dailyLimit
                    });
                } catch (error) {
                    logger.warn('Failed to increment daily usage:', error);
                }
            }

            // Log successful response
            logger.info('Chat response sent', {
                responseLength: response.length,
                processingTime: response.processingTime || 'unknown'
            });

            res.json({
                response: response,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('Chat endpoint error:', error);
            
            // Don't expose internal errors to clients
            const errorMessage = process.env.NODE_ENV === 'production' 
                ? 'I\'m having trouble processing your request right now. Please try again later.'
                : error.message;

            res.status(500).json({
                error: 'Internal server error',
                message: errorMessage
            });
        }
    }
);

// Documentation search endpoint
app.get('/api/search',
    [
        body('query')
            .trim()
            .isLength({ min: 1, max: 200 })
            .withMessage('Query must be between 1 and 200 characters')
    ],
    async (req, res) => {
        try {
            const { query, limit = 10 } = req.query;
            
            if (!query) {
                return res.status(400).json({
                    error: 'Query parameter is required'
                });
            }

            if (!documentationIndex) {
                return res.status(503).json({
                    error: 'Search service not available'
                });
            }

            const results = await documentationIndex.search(query, {
                limit: Math.min(parseInt(limit) || 10, 50)
            });

            res.json({
                results,
                query,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            logger.error('Search endpoint error:', error);
            res.status(500).json({
                error: 'Search failed',
                message: 'Unable to search documentation at this time.'
            });
        }
    }
);

// Documentation topics endpoint
app.get('/api/topics', async (req, res) => {
    try {
        if (!documentationIndex) {
            return res.status(503).json({
                error: 'Documentation service not available'
            });
        }

        const topics = await documentationIndex.getTopics();
        
        res.json({
            topics,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Topics endpoint error:', error);
        res.status(500).json({
            error: 'Failed to load topics'
        });
    }
});

// Manual documentation index rebuild endpoint
app.post('/api/admin/rebuild-index', async (req, res) => {
    try {
        if (!documentationIndex) {
            return res.status(503).json({
                error: 'Documentation service not available'
            });
        }

        const result = await documentationIndex.rebuildIndex();
        
        res.json({
            message: 'Documentation index rebuilt successfully',
            ...result,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Index rebuild endpoint error:', error);
        res.status(500).json({
            error: 'Failed to rebuild documentation index',
            message: error.message
        });
    }
});

// Webhook endpoint for external systems (local development)
app.all('/webhook/rebuild-docs', async (req, res) => {
    try {
        const startTime = Date.now();
        
        if (!documentationIndex) {
            return res.status(503).json({
                error: 'Documentation service not available'
            });
        }

        logger.info('Webhook triggered - rebuilding documentation index...');
        const result = await documentationIndex.rebuildIndex();
        const duration = Date.now() - startTime;

        const logData = {
            trigger: 'webhook',
            method: req.method,
            userAgent: req.get('User-Agent') || 'unknown',
            sourceIP: req.ip,
            duration: `${duration}ms`,
            documentCount: result.documentCount
        };

        logger.info('Webhook rebuild completed:', logData);

        res.json({
            message: 'Documentation index rebuilt successfully via webhook',
            ...result,
            webhook: {
                trigger: req.method,
                duration: logData.duration
            },
            timestamp: new Date().toISOString(),
            deployment: 'local-server'
        });

    } catch (error) {
        logger.error('Webhook rebuild error:', error);
        res.status(500).json({
            error: 'Failed to rebuild documentation index via webhook',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' 
            ? 'Something went wrong'
            : err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: 'The requested endpoint does not exist'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    
    // Close any open connections or cleanup
    if (chatService && typeof chatService.cleanup === 'function') {
        await chatService.cleanup();
    }
    
    
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    
    if (chatService && typeof chatService.cleanup === 'function') {
        await chatService.cleanup();
    }
    
    
    process.exit(0);
});

// Start server
async function startServer() {
    try {
        await initializeServices();
        
        app.listen(PORT, () => {
            logger.info(`Krkn Chatbot API server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
