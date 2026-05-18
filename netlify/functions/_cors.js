// Set ALLOWED_ORIGINS env var as comma-separated list:
// e.g. ALLOWED_ORIGINS=https://krkn-chaos.dev,https://krkn-chaos.netlify.app

const DEFAULT_ORIGINS = ['https://krkn-chaos.dev', 'https://krkn-chaos.netlify.app'];

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
    : DEFAULT_ORIGINS;

function isOriginAllowed(event) {
    const origin = event?.headers?.origin || event?.headers?.Origin || '';
    return origin ? ALLOWED_ORIGINS.includes(origin) : false;
}

function getCorsHeaders(event) {
    const origin = event?.headers?.origin || event?.headers?.Origin || '';
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) return {};
    return {
        'Access-Control-Allow-Origin': origin,
        'Vary': 'Origin'
    };
}

module.exports = { ALLOWED_ORIGINS, isOriginAllowed, getCorsHeaders };
