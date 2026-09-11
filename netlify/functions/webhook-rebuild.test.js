const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const modulePath = require.resolve('./webhook-rebuild.js');
const servicePath = require.resolve('../../api/services/DocumentationIndex');
const originalWebhookSecret = process.env.WEBHOOK_SECRET;
const originalServiceModule = require.cache[servicePath];

afterEach(() => {
    if (originalWebhookSecret === undefined) {
        delete process.env.WEBHOOK_SECRET;
    } else {
        process.env.WEBHOOK_SECRET = originalWebhookSecret;
    }

    delete require.cache[modulePath];

    if (originalServiceModule) {
        require.cache[servicePath] = originalServiceModule;
    } else {
        delete require.cache[servicePath];
    }
});

function loadHandler() {
    delete require.cache[modulePath];
    delete require.cache[servicePath];

    require.cache[servicePath] = {
        id: servicePath,
        filename: servicePath,
        loaded: true,
        exports: class DocumentationIndex {
            async initialize() {}
            async rebuildIndex() {
                return {
                    success: true,
                    documentCount: 1,
                    version: 'test',
                    timestamp: '2026-05-17T00:00:00.000Z'
                };
            }
        }
    };

    return require('./webhook-rebuild.js').handler;
}

test('rejects unsigned webhook requests when WEBHOOK_SECRET is configured', async () => {
    process.env.WEBHOOK_SECRET = 'secret-value';

    const handler = loadHandler();
    const response = await handler({
        httpMethod: 'POST',
        headers: {},
        body: JSON.stringify({ test: true })
    });

    assert.equal(response.statusCode, 401);
    assert.deepEqual(JSON.parse(response.body), { error: 'Invalid webhook signature' });
});

test('rejects malformed webhook signatures when WEBHOOK_SECRET is configured', async () => {
    process.env.WEBHOOK_SECRET = 'secret-value';

    const handler = loadHandler();
    const response = await handler({
        httpMethod: 'POST',
        headers: {
            'x-hub-signature-256': 'sha256=not-hex'
        },
        body: JSON.stringify({ test: true })
    });

    assert.equal(response.statusCode, 401);
    assert.deepEqual(JSON.parse(response.body), { error: 'Invalid webhook signature' });
});

test('accepts correctly signed webhook requests when WEBHOOK_SECRET is configured', async () => {
    process.env.WEBHOOK_SECRET = 'secret-value';

    const body = JSON.stringify({ test: true });
    const signature = `sha256=${crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(body)
        .digest('hex')}`;

    const handler = loadHandler();
    const response = await handler({
        httpMethod: 'POST',
        headers: {
            'x-hub-signature-256': signature
        },
        body
    });

    assert.equal(response.statusCode, 200);
    assert.equal(JSON.parse(response.body).message, 'Documentation index rebuilt successfully via webhook');
});

test('rejects signed webhook requests with no body when WEBHOOK_SECRET is configured', async () => {
    process.env.WEBHOOK_SECRET = 'secret-value';

    const handler = loadHandler();
    const response = await handler({
        httpMethod: 'POST',
        headers: {
            'x-hub-signature-256': 'sha256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        }
    });

    assert.equal(response.statusCode, 401);
    assert.deepEqual(JSON.parse(response.body), { error: 'Invalid webhook signature' });
});
