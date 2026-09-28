const axios = require('axios');
const cheerio = require('cheerio');

const RELEASES_URL = 'https://github.com/krkn-chaos/krkn-operator/releases';
const LATEST_RELEASE_URL = `${RELEASES_URL}/latest`;

function isStableVersion(version) {
  return /^v\d+\.\d+\.\d+$/.test(version);
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
  const releases = await axios.get(RELEASES_URL, {
    headers: { 'User-Agent': 'krkn-website-release-checker' }
  });
  const $ = cheerio.load(releases.data);

  const releaseLinks = $('a[href*="/releases/tag/"]');
  for (const element of releaseLinks.toArray()) {
    const href = $(element).attr('href');
    if (!href) continue;

    const tag = decodeURIComponent(href.split('/releases/tag/')[1]);
    const releaseContainer = $(element).closest('.Box');
    const isPrerelease = /pre-release/i.test(releaseContainer.text());

    if (!isPrerelease && isStableVersion(tag)) {
      return tag;
    }
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
