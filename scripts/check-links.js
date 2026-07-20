#!/usr/bin/env node

/**
 * Link checker for Krkn website
 * Checks both internal and external links in the built Hugo site
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');

class LinkChecker {
  constructor(options = {}) {
    // Load config file if it exists
    const configPath = path.join(__dirname, '../.linkcheck.json');
    let config = {};
    try {
      const configFile = require('fs').readFileSync(configPath, 'utf-8');
      config = JSON.parse(configFile);
    } catch (error) {
      // Config file doesn't exist or is invalid, use defaults
    }

    this.baseUrl = options.baseUrl || config.baseUrl || 'https://krkn-chaos.dev';
    this.publicDir = options.publicDir || path.join(__dirname, '../public');
    this.timeout = options.timeout || config.timeout || 30000; // Changed default to match config
    this.maxRetries = options.maxRetries || config.maxRetries || 2; // Changed default to match config
    this.checkExternal = options.checkExternal !== false; // Default to true, but can be disabled
    this.maxConcurrent = options.maxConcurrent || config.maxConcurrent || 5;
    this.allowedStatusCodes = options.allowedStatusCodes || config.allowedStatusCodes || [200, 201, 202, 204, 301, 302, 307, 308];
    this.warningStatusCodes = options.warningStatusCodes || config.warningStatusCodes || [401, 403, 429];
    // Build exclude patterns from config and options
    const configExcludePatterns = (config.excludePatterns || []).map(pattern => new RegExp(pattern));
    const defaultExcludePatterns = [
      // Skip localhost and development URLs
      /^https?:\/\/localhost/,
      /^https?:\/\/127\.0\.0\.1/,
      /^https?:\/\/0\.0\.0\.0/,
      // Skip example domains
      /^https?:\/\/example\.(com|org|net)/,
      // Skip placeholder URLs
      /^https?:\/\/.*\.example$/,
      /^https?:\/\/your-.*$/,
      // Skip authentication required URLs that are expected to return 401/403
      /kubernetes\.slack\.com/,
      // Skip URLs that require special headers or are behind auth
      /github\.com.*\/settings/,
      // Skip common problematic external links for CI
      /github\.com.*\/stargazers/,
      /github\.com.*\/network\/members/,
    ];

    this.excludePatterns = options.excludePatterns || [...configExcludePatterns, ...defaultExcludePatterns];

    // In-flight external checks, keyed by URL, so that when the same link is
    // referenced from multiple pages we fire exactly one network request for
    // it instead of one per occurrence (see getExternalStatus()).
    this.pendingChecks = new Map();
    this.checkedUrls = new Map(); // Cache of resolved results, keyed by URL

    // Links discovered while scanning are queued here and processed together
    // in runLinkChecks() with bounded concurrency (this.maxConcurrent).
    this.linkTasks = [];

    this.results = {
      total: 0,
      broken: [],
      warnings: [],
      skipped: []
    };
  }

  async checkLinks() {
    console.log('🔍 Starting link check...');

    // Check if public directory exists
    try {
      await fs.access(this.publicDir);
    } catch (error) {
      throw new Error(`Public directory not found: ${this.publicDir}. Run 'npm run build' first.`);
    }

    await this.scanDirectory(this.publicDir);
    await this.runLinkChecks();
    return this.generateReport();
  }

  async scanDirectory(dirPath, relativePath = '') {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const currentRelativePath = path.join(relativePath, entry.name);

      // Skip Hugo print pages and other generated directories
      if (entry.isDirectory() && this.shouldSkipDirectory(entry.name)) {
        continue;
      }

      if (entry.isDirectory()) {
        await this.scanDirectory(fullPath, currentRelativePath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        await this.checkHtmlFile(fullPath, currentRelativePath);
      }
    }
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = [
      '_print',      // Hugo print pages
      'print',       // Alternative print directory
      '.git',        // Git directory
      'node_modules', // Dependencies
      '.netlify'     // Netlify build artifacts
    ];
    return skipDirs.includes(dirName);
  }

  async checkHtmlFile(filePath, relativePath) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const $ = cheerio.load(content);
      const links = new Set();

      // Extract all links
      $('a[href]').each((_, element) => {
        const href = $(element).attr('href');
        if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:')) {
          links.add(href);
        }
      });

      // Queue each unique link for checking once scanning is complete
      for (const link of links) {
        this.linkTasks.push({ link, sourceFile: relativePath });
      }
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${relativePath}: ${error.message}`);
      this.results.warnings.push({
        file: relativePath,
        error: error.message
      });
    }
  }

  /**
   * Processes every queued (link, sourceFile) pair with a bounded number of
   * concurrent workers (this.maxConcurrent / .linkcheck.json's
   * "maxConcurrent"). Internal/relative links resolve almost instantly (a
   * single fs.access call), so this mainly matters for external links,
   * where it caps how many outbound HTTP requests are in flight at once.
   */
  async runLinkChecks() {
    if (this.linkTasks.length === 0) {
      return;
    }

    let cursor = 0;
    const next = () => this.linkTasks[cursor++];

    const worker = async () => {
      let task = next();
      while (task) {
        await this.checkLink(task.link, task.sourceFile);
        task = next();
      }
    };

    const workerCount = Math.max(1, Math.min(this.maxConcurrent, this.linkTasks.length));
    await Promise.all(Array.from({ length: workerCount }, worker));
  }

  async checkLink(link, sourceFile) {
    this.results.total++;

    // Skip excluded patterns
    if (this.excludePatterns.some(pattern => pattern.test(link))) {
      this.results.skipped.push({
        url: link,
        reason: 'Excluded by pattern',
        source: sourceFile
      });
      return;
    }

    // Serve from cache when we already know the outcome for this URL
    if (this.checkedUrls.has(link)) {
      this.recordCachedResult(link, sourceFile, this.checkedUrls.get(link));
      return;
    }

    try {
      // Handle relative links
      if (link.startsWith('/')) {
        await this.checkInternalLink(link, sourceFile);
      } else if (link.startsWith('http')) {
        if (this.checkExternal) {
          const status = await this.getExternalStatus(link);
          this.recordCachedResult(link, sourceFile, status);
        } else {
          this.results.skipped.push({
            url: link,
            reason: 'External link checking disabled',
            source: sourceFile
          });
        }
      } else {
        // Relative path
        await this.checkRelativeLink(link, sourceFile);
      }
    } catch (error) {
      console.error(`❌ Error checking ${link}: ${error.message}`);
    }
  }

  // Attributes a cached (or just-resolved) result to the page that
  // referenced it, so broken/warning links are reported once per source
  // file even though the underlying check only ever runs once per URL.
  recordCachedResult(link, sourceFile, cached) {
    if (cached.broken) {
      this.results.broken.push({ ...cached, source: sourceFile });
    } else if (cached.warning) {
      this.results.warnings.push({
        url: cached.url || link,
        type: cached.type,
        error: cached.error,
        source: sourceFile
      });
    }
  }

  async checkInternalLink(link, sourceFile) {
    // Strip anchor fragments and query strings — neither corresponds to a
    // separate file on disk, and leaving them in previously produced
    // false "broken" reports for otherwise-valid links such as
    // "/search/?q=chaos".
    const linkPath = link.split('#')[0].split('?')[0];

    // Convert to file path
    let filePath = linkPath === '/' ? '/index.html' : linkPath;
    if (!filePath.endsWith('.html') && !filePath.endsWith('/')) {
      filePath += '/index.html';
    } else if (filePath.endsWith('/')) {
      filePath += 'index.html';
    }

    const fullPath = path.join(this.publicDir, filePath.replace(/^\//, ''));

    try {
      await fs.access(fullPath);
      console.log(`✅ ${linkPath}`);
      this.checkedUrls.set(link, { broken: false });
    } catch (error) {
      console.log(`❌ ${linkPath} (internal)`);
      const brokenLink = {
        url: link,
        type: 'internal',
        error: 'File not found',
        source: sourceFile
      };
      this.results.broken.push(brokenLink);
      this.checkedUrls.set(link, { broken: true, ...brokenLink });
    }
  }

  async checkRelativeLink(link, sourceFile) {
    // Same reasoning as checkInternalLink: anchors/query strings don't map
    // to files on disk and would otherwise cause false positives.
    const linkPath = link.split('#')[0].split('?')[0];
    const sourceDir = path.dirname(sourceFile);
    const targetPath = path.resolve(this.publicDir, sourceDir, linkPath);

    try {
      await fs.access(targetPath);
      console.log(`✅ ${linkPath} (relative)`);
      this.checkedUrls.set(link, { broken: false });
    } catch (error) {
      console.log(`❌ ${linkPath} (relative)`);
      const brokenLink = {
        url: link,
        type: 'relative',
        error: 'File not found',
        source: sourceFile
      };
      this.results.broken.push(brokenLink);
      this.checkedUrls.set(link, { broken: true, ...brokenLink });
    }
  }

  // Resolves (and caches) the status of an external URL exactly once, even
  // when multiple concurrent workers ask for it at the same time — later
  // callers await the same in-flight promise instead of firing a duplicate
  // request.
  async getExternalStatus(link) {
    if (this.checkedUrls.has(link)) {
      return this.checkedUrls.get(link);
    }

    if (this.pendingChecks.has(link)) {
      return this.pendingChecks.get(link);
    }

    const promise = this.resolveExternalLink(link).finally(() => {
      this.pendingChecks.delete(link);
    });
    this.pendingChecks.set(link, promise);

    const status = await promise;
    this.checkedUrls.set(link, status);
    return status;
  }

  // Performs the actual HEAD/GET request(s) for a single external URL and
  // returns a plain status object. This is intentionally source-agnostic
  // (no sourceFile, no pushing into this.results) so the result can be
  // shared across every page that links to the same URL.
  async resolveExternalLink(link) {
    let retries = 0;

    while (retries <= this.maxRetries) {
      try {
        const response = await axios.head(link, {
          timeout: this.timeout,
          validateStatus: (status) => this.allowedStatusCodes.includes(status),
          headers: {
            'User-Agent': 'Krkn-Website-LinkChecker/1.0 (+https://krkn-chaos.dev)',
            'Accept': '*/*'
          }
        });

        console.log(`✅ ${link} (${response.status})`);
        return { broken: false };
      } catch (error) {
        // HEAD request failed, try GET as fallback for 405/501 Method Not Allowed
        if (retries === 0 && error.response && [405, 501].includes(error.response.status)) {
          try {
            const response = await axios.get(link, {
              timeout: this.timeout,
              validateStatus: (status) => this.allowedStatusCodes.includes(status),
              headers: {
                'User-Agent': 'Krkn-Website-LinkChecker/1.0 (+https://krkn-chaos.dev)',
                'Accept': '*/*',
                'Range': 'bytes=0-0' // Only request first byte to avoid downloading full content
              },
              maxRedirects: 5,
              maxContentLength: 1024 // Limit response body to 1KB
            });

            console.log(`✅ ${link} (${response.status} via GET)`);
            return { broken: false };
          } catch (getFallbackError) {
            // GET also failed, continue with normal retry logic
            error = getFallbackError;
          }
        }

        if (retries < this.maxRetries) {
          retries++;
          await this.sleep(1000 * retries); // Exponential backoff
          continue;
        }

        // Check if it's an expected error (auth required, etc.)
        if (error.response && this.warningStatusCodes.includes(error.response.status)) {
          console.log(`⚠️  ${link} (${error.response.status} - auth/rate limited)`);
          return {
            broken: false,
            warning: true,
            url: link,
            type: 'external',
            error: `HTTP ${error.response.status}`
          };
        }

        console.log(`❌ ${link} (external)`);
        return {
          broken: true,
          url: link,
          type: 'external',
          error: error.message || 'Request failed'
        };
      }
    }

    // Unreachable in practice (the loop above always returns), but guards
    // against silently resolving as "not broken" if that ever changes.
    return { broken: true, url: link, type: 'external', error: 'Retries exhausted' };
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  generateReport() {
    console.log('\n📊 Link Check Results');
    console.log('========================');
    console.log(`Total links checked: ${this.results.total}`);
    console.log(`Broken links: ${this.results.broken.length}`);
    console.log(`Warnings: ${this.results.warnings.length}`);
    console.log(`Skipped: ${this.results.skipped.length}`);

    if (this.results.broken.length > 0) {
      console.log('\n💥 Broken Links:');
      this.results.broken.forEach(link => {
        console.log(`  ❌ ${link.url} (${link.type})`);
        console.log(`     Source: ${link.source}`);
        console.log(`     Error: ${link.error}\n`);
      });
    }

    if (this.results.warnings.length > 0 && process.env.LINK_CHECK_VERBOSE) {
      console.log('\n⚠️  Warnings:');
      this.results.warnings.forEach(warning => {
        console.log(`  ⚠️  ${warning.url || warning.file}`);
        console.log(`     Error: ${warning.error}\n`);
      });
    }

    console.log(`\n${this.results.broken.length === 0 ? '✅' : '❌'} Link check ${this.results.broken.length === 0 ? 'passed' : 'failed'}`);

    return {
      success: this.results.broken.length === 0,
      ...this.results
    };
  }
}

async function main() {
  try {
    const checker = new LinkChecker({
      baseUrl: process.env.SITE_URL || 'https://krkn-chaos.dev',
      publicDir: path.join(__dirname, '../public'),
      timeout: parseInt(process.env.LINK_CHECK_TIMEOUT) || undefined, // Let config file take precedence if env not set
      maxConcurrent: parseInt(process.env.LINK_CHECK_MAX_CONCURRENT) || undefined, // Let config file take precedence if env not set
      checkExternal: process.env.LINK_CHECK_EXTERNAL !== 'false'
    });

    const result = await checker.checkLinks();
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error(`💥 Link checker failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { LinkChecker };
