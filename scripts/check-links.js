#!/usr/bin/env node

/**
 * Link checker for Krkn website
 * Checks both internal and external links in the built Hugo site
 */

const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');
const axios = require('axios');
const cheerio = require('cheerio');

class LinkChecker {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || 'https://krkn-chaos.dev';
    this.publicDir = options.publicDir || path.join(__dirname, '../public');
    this.timeout = options.timeout || 10000;
    this.maxRetries = options.maxRetries || 1;
    this.checkExternal = options.checkExternal !== false; // Default to true, but can be disabled
    this.maxConcurrent = options.maxConcurrent || 5;
    this.excludePatterns = options.excludePatterns || [
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
    
    this.pendingChecks = new Set();
    this.checkedUrls = new Map(); // Cache results
    
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

      // Check each unique link
      for (const link of links) {
        await this.checkLink(link, relativePath);
      }
    } catch (error) {
      console.warn(`⚠️  Failed to parse ${relativePath}: ${error.message}`);
      this.results.warnings.push({
        file: relativePath,
        error: error.message
      });
    }
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

    // Check cache first
    if (this.checkedUrls.has(link)) {
      const cached = this.checkedUrls.get(link);
      if (cached.broken) {
        this.results.broken.push({ ...cached, source: sourceFile });
      }
      return;
    }

    try {
      // Handle relative links
      if (link.startsWith('/')) {
        await this.checkInternalLink(link, sourceFile);
      } else if (link.startsWith('http')) {
        if (this.checkExternal) {
          await this.checkExternalLink(link, sourceFile);
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

  async checkInternalLink(link, sourceFile) {
    // Remove anchor fragments for file checking
    const linkWithoutAnchor = link.split('#')[0];
    
    // Convert to file path
    let filePath = linkWithoutAnchor === '/' ? '/index.html' : linkWithoutAnchor;
    if (!filePath.endsWith('.html') && !filePath.endsWith('/')) {
      filePath += '/index.html';
    } else if (filePath.endsWith('/')) {
      filePath += 'index.html';
    }

    const fullPath = path.join(this.publicDir, filePath.replace(/^\//, ''));
    
    try {
      await fs.access(fullPath);
      console.log(`✅ ${linkWithoutAnchor}`);
      this.checkedUrls.set(link, { broken: false });
    } catch (error) {
      console.log(`❌ ${linkWithoutAnchor} (internal)`);
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
    const sourceDir = path.dirname(sourceFile);
    const targetPath = path.resolve(this.publicDir, sourceDir, link);
    
    try {
      await fs.access(targetPath);
      console.log(`✅ ${link} (relative)`);
    } catch (error) {
      console.log(`❌ ${link} (relative)`);
      this.results.broken.push({
        url: link,
        type: 'relative',
        error: 'File not found',
        source: sourceFile
      });
    }
  }

  async checkExternalLink(link, sourceFile) {
    let retries = 0;
    
    while (retries <= this.maxRetries) {
      try {
        const response = await axios.head(link, {
          timeout: this.timeout,
          validateStatus: (status) => status < 400,
          headers: {
            'User-Agent': 'Krkn-Website-LinkChecker/1.0 (+https://krkn-chaos.dev)',
            'Accept': '*/*'
          }
        });
        
        console.log(`✅ ${link} (${response.status})`);
        return;
      } catch (error) {
        if (retries < this.maxRetries) {
          retries++;
          await this.sleep(1000 * retries); // Exponential backoff
          continue;
        }
        
        // Check if it's an expected error (auth required, etc.)
        if (error.response && [401, 403, 429].includes(error.response.status)) {
          console.log(`⚠️  ${link} (${error.response.status} - auth/rate limited)`);
          this.results.warnings.push({
            url: link,
            type: 'external',
            error: `HTTP ${error.response.status}`,
            source: sourceFile
          });
          return;
        }
        
        console.log(`❌ ${link} (external)`);
        this.results.broken.push({
          url: link,
          type: 'external',
          error: error.message || 'Request failed',
          source: sourceFile
        });
      }
    }
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
      timeout: parseInt(process.env.LINK_CHECK_TIMEOUT) || 10000,
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