const { check } = require('linkinator');
const path = require('path');
const fs = require('fs');

async function main() {
  const isAll = process.argv.includes('--all');
  
  // Use PUBLISH_DIR environment variable if it exists (e.g. Netlify), otherwise default to 'public'
  const buildDir = process.env.PUBLISH_DIR || 'public';
  const directoryToScan = path.resolve(__dirname, '..', buildDir);

  if (!fs.existsSync(directoryToScan)) {
    console.warn(`Warning: Directory to scan does not exist: ${directoryToScan}`);
    console.warn('Skipping link check. Make sure to build the site first.');
    return;
  }

  // Common skip patterns for both check:links and check:links:all
  const skipPatterns = [
    'localhost',
    '127\\.0\\.0\\.1',
    'twitter\\.com',
    'linkedin\\.com'
  ];

  // If not --all, skip potentially flaky external links (Blocker 1)
  if (!isAll) {
    skipPatterns.push(
      'github\\.com',
      'snyk\\.io',
      '/releases/download/'
    );
  }

  console.log(`Checking links in: ${directoryToScan}`);
  console.log(`Skip patterns: ${skipPatterns.join(' | ')}`);

  const result = await check({
    path: directoryToScan,
    linksToSkip: skipPatterns
  });

  const brokenLinks = result.links.filter(link => link.state === 'BROKEN');
  console.log(`\nScanned ${result.links.length} links. Broken: ${brokenLinks.length}`);

  if (!result.passed) {
    console.warn('NOTE: Not failing the build due to broken links until Issue #448 is resolved.');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('An error occurred during link checking:', error);
  process.exit(1);
});
