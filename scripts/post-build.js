#!/usr/bin/env node

/**
 * Post-build script to automatically rebuild documentation index
 * Runs after Netlify build completes
 */

const https = require('https');
const http = require('http');

async function rebuildDocumentationIndex() {
    // Only run on Netlify production builds
    if (!process.env.NETLIFY || process.env.CONTEXT !== 'production') {
        console.log('Skipping index rebuild - not production Netlify build');
        return;
    }

    const siteUrl = process.env.URL || process.env.DEPLOY_PRIME_URL;
    if (!siteUrl) {
        console.log('No site URL found - skipping index rebuild');
        return;
    }

    const rebuildUrl = `${siteUrl}/api/admin/rebuild-index`;
    
    console.log('🔄 Triggering automatic documentation index rebuild...');
    console.log(`Calling: ${rebuildUrl}`);

    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({});
        
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 30000
        };

        // Use the appropriate protocol based on URL
        const isHttps = rebuildUrl.startsWith('https:');
        const requestModule = isHttps ? https : http;
        const req = requestModule.request(rebuildUrl, options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    const result = JSON.parse(data);
                    console.log('✅ Documentation index rebuilt successfully!');
                    console.log(`📊 Indexed ${result.documentCount} documents`);
                    
                    // Debug: Show full API response
                    console.log('🔍 Full API Response:', JSON.stringify(result, null, 2));
                    resolve(result);
                } else {
                    console.error('❌ Failed to rebuild index:', res.statusCode, data);
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (error) => {
            console.error('❌ Error rebuilding documentation index:', error.message);
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            console.error('❌ Rebuild request timed out');
            reject(new Error('Request timeout'));
        });

        req.write(postData);
        req.end();
    });
}

// Wait a moment after build completion before triggering
setTimeout(async () => {
    try {
        await rebuildDocumentationIndex();
        process.exit(0);
    } catch (error) {
        console.error('Post-build index rebuild failed:', error.message);
        // Don't fail the build for index issues
        process.exit(0);
    }
}, 3000); // 3 second delay to ensure site is fully deployed
