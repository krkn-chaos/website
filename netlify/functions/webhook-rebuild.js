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

const crypto = require('crypto');
const DocumentationIndex = require('../../api/services/DocumentationIndex');

let documentationIndex;

const initializeServices = async () => {
    if (!documentationIndex) {
        documentationIndex = new DocumentationIndex();
        await documentationIndex.initialize();
    }
};

// Verify webhook signature for security
function verifyWebhookSignature(payload, signature, secret) {
    if (!secret || !signature) return true; // Allow unsigned webhooks if no secret configured
    
    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
    
    const providedSignature = signature.startsWith('sha256=') 
        ? signature.slice(7) 
        : signature;
    
    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
    );
}

exports.handler = async (event, context) => {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-Hub-Signature-256, X-Webhook-Signature',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Support both GET and POST
    if (!['GET', 'POST'].includes(event.httpMethod)) {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const startTime = Date.now();

        // Parse webhook payload
        let webhookData = {};
        if (event.httpMethod === 'POST' && event.body) {
            try {
                webhookData = JSON.parse(event.body);
            } catch (error) {
                webhookData = { payload: event.body };
            }
        }

        // Verify webhook signature if configured
        const webhookSecret = process.env.WEBHOOK_SECRET;
        const signature = event.headers['x-hub-signature-256'] || event.headers['x-webhook-signature'];
        
        if (webhookSecret && event.httpMethod === 'POST') {
            const isValid = verifyWebhookSignature(event.body, signature, webhookSecret);
            if (!isValid) {
                console.error('Invalid webhook signature');
                return {
                    statusCode: 401,
                    headers,
                    body: JSON.stringify({ error: 'Invalid webhook signature' })
                };
            }
        }

        // Initialize services
        console.log('Webhook triggered - rebuilding documentation index...');
        await initializeServices();

        // Rebuild the documentation index
        const result = await documentationIndex.rebuildIndex();
        const duration = Date.now() - startTime;

        // Log webhook details
        const logData = {
            trigger: 'webhook',
            method: event.httpMethod,
            userAgent: event.headers['user-agent'] || 'unknown',
            sourceIP: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown',
            webhookSource: webhookData.repository?.name || webhookData.source || 'unknown',
            duration: `${duration}ms`,
            documentCount: result.documentCount,
            timestamp: new Date().toISOString()
        };

        console.log('Webhook rebuild completed:', JSON.stringify(logData));

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                message: 'Documentation index rebuilt successfully via webhook',
                ...result,
                webhook: {
                    source: logData.webhookSource,
                    trigger: event.httpMethod,
                    duration: logData.duration
                },
                timestamp: logData.timestamp,
                deployment: 'netlify-functions'
            })
        };

    } catch (error) {
        console.error('Webhook rebuild error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to rebuild documentation index via webhook',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        };
    }
};
