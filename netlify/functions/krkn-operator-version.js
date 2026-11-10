const axios = require('axios');
const cheerio = require('cheerio');

const RELEASES_URL = 'https://github.com/krkn-chaos/krkn-operator/releases';
const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`;
const MAX_RELEASE_PAGES = 20;
const RELEASES_ORIGIN = 'https://github.com';
const RELEASES_PATH = '/krkn-chaos/krkn-operator/releases';

function isStableVersion(version) {
  return /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/.test(version);
}

function response(version) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ version })
  };
}

async function getLatestStableReleaseFromPage() {
  const visited = new Set();
  let nextUrl = RELEASES_URL;

  for (let page = 0; page < MAX_RELEASE_PAGES && nextUrl; page += 1) {
    const pageUrl = new URL(nextUrl, RELEASES_ORIGIN);
    if (pageUrl.origin !== RELEASES_ORIGIN || pageUrl.pathname !== RELEASES_PATH || visited.has(pageUrl.href)) break;
    visited.add(pageUrl.href);

    const releases = await axios.get(pageUrl.href, {
      headers: { 'User-Agent': 'krkn-website-release-checker' }
    });
    const $ = cheerio.load(releases.data);
    const releaseLinks = $('a[href*="/releases/tag/"]');
    for (const element of releaseLinks.toArray()) {
      const href = $(element).attr('href');
      if (!href) continue;
      const releaseUrl = new URL(href, RELEASES_ORIGIN);
      if (releaseUrl.origin !== RELEASES_ORIGIN) continue;
      const match = releaseUrl.pathname.match(/^\/krkn-chaos\/krkn-operator\/releases\/tag\/([^/]+)$/);
      if (!match) continue;
      const tag = decodeURIComponent(match[1]);
      const releaseContainer = $(element).closest('.Box');
      const isPrerelease = /pre-release/i.test(releaseContainer.text());
      if (!isPrerelease && isStableVersion(tag)) return tag;
    }

    const next = $('a.next_page[href], a[rel="next"][href]').first().attr('href');
    if (!next) break;
    const nextPageUrl = new URL(next, pageUrl);
    if (nextPageUrl.origin !== RELEASES_ORIGIN || nextPageUrl.pathname !== RELEASES_PATH) break;
    nextUrl = nextPageUrl.href;
  }

  return null;
}

exports.handler = async function() {
  try {
    // Try to get redirect without following it
    const latest = await axios.head(LATEST_RELEASE_URL, {
      maxRedirects: 0,
      validateStatus: (status) => status === 302 || status === 301 // Accept redirect responses
    });

    const location = latest.headers.location;

    if (location) {
      // Extract everything after /tag/
      const match = location.match(/\/tag\/(.+)$/);
      if (match) {
        const version = decodeURIComponent(match[1]);
        // /releases/latest already excludes GitHub prereleases. Check the tag
        // too: only plain vX.Y.Z versions are valid install versions.
        if (isStableVersion(version)) return response(version);
      }
    }

    // Fallback for repositories where a beta tag was published as a full
    // release: inspect the public releases page, without using api.github.com.
    const stableVersion = await getLatestStableReleaseFromPage();
    if (stableVersion) return response(stableVersion);

    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Version not found' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
