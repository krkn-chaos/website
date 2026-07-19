# Krkn Website Scripts

## Link Checker (`check-links.js`)

Validates internal and external links in the built Hugo site to prevent broken links from reaching production.

### Usage

```bash
# Check all links (internal + external)
npm run check:links

# Check only internal links (faster, good for CI)
npm run _check:links:internal

# Verbose output showing warnings
npm run _check:links:verbose
```

### Environment Variables

- `LINK_CHECK_EXTERNAL=false` - Disable external link checking
- `LINK_CHECK_TIMEOUT=10000` - Request timeout in milliseconds
- `LINK_CHECK_VERBOSE=true` - Show warnings and additional info
- `SITE_URL=https://krkn-chaos.dev` - Base URL for the site

### Configuration

Edit `.linkcheck.json` to customize:
- Excluded URL patterns
- Timeout settings
- Allowed/warning status codes

### CI Integration

The link checker is automatically run during:
- `npm test`
- `npm run build:production`
- `npm run build:preview`

For CI environments, consider using `LINK_CHECK_EXTERNAL=false` to avoid rate limiting and improve build times.

### Features

- ✅ **Internal link validation** - Checks all internal site links
- ✅ **External link validation** - Validates external URLs with retry logic  
- ✅ **Caching** - Avoids duplicate checks for the same URL
- ✅ **Smart exclusions** - Skips Hugo print pages and known problematic URLs
- ✅ **Configurable timeouts** - Adjustable request timeouts
- ✅ **Detailed reporting** - Clear breakdown of broken links with source files
- ✅ **CI-friendly** - Fast internal-only mode for continuous integration