'use strict';

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');
const {
  derivePageKey,
  readRegistry,
  selectDefaultRelease,
  sortReleasesNewest,
  validateRegistry,
} = require('./operator-docs');
const { parseFrontmatter, validateSnapshots } = require('./operator-docs-snapshot');

const OPERATOR_ROOT = 'content/en/docs/krkn-operator';
const PUBLIC_OPERATOR_ROOT = '/docs/krkn-operator';
const CACHE_ROOT = '.cache/operator-docs';
const REDIRECT_START = '# BEGIN OPERATOR DOC REDIRECTS';
const REDIRECT_END = '# END OPERATOR DOC REDIRECTS';

function lstatOrNull(filePath) {
  try {
    return fs.lstatSync(filePath);
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function removeGeneratedCache(repoRoot) {
  const cache = path.resolve(repoRoot, CACHE_ROOT);
  const repo = path.resolve(repoRoot);
  if (!cache.startsWith(`${repo}${path.sep}`)) {
    throw new Error('Operator documentation cache path escapes repository');
  }
  const stat = lstatOrNull(cache);
  if (stat?.isSymbolicLink()) {
    throw new Error('refusing to clear a symlink at .cache/operator-docs');
  }
  fs.rmSync(cache, { recursive: true, force: true });
}

function collectMarkdown(root, relativePrefix = '') {
  const pages = [];
  const stat = lstatOrNull(root);
  if (!stat) return pages;
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`invalid Operator content directory: ${root}`);
  }
  for (const entry of fs.readdirSync(root).sort()) {
    const absolute = path.join(root, entry);
    const childStat = fs.lstatSync(absolute);
    if (childStat.isSymbolicLink()) {
      throw new Error(`symlink in Operator documentation tree: ${absolute}`);
    }
    const relativePath = relativePrefix ? `${relativePrefix}/${entry}` : entry;
    if (childStat.isDirectory()) {
      if (relativePath === 'versions') continue;
      pages.push(...collectMarkdown(absolute, relativePath));
    } else if (childStat.isFile() && entry.endsWith('.md')) {
      const bytes = fs.readFileSync(absolute);
      const { frontmatter } = parseFrontmatter(bytes, absolute);
      const pageKey = derivePageKey(relativePath, frontmatter);
      pages.push({ relativePath, pageKey, frontmatter, absolute });
    }
  }
  return pages;
}

function collectReleasePages(repoRoot, releases) {
  const pagesByRelease = new Map();
  for (const release of releases) {
    const root = path.join(
      repoRoot,
      OPERATOR_ROOT,
      'versions',
      release.tag
    );
    const pages = collectMarkdown(root);
    const keys = new Set();
    for (const page of pages) {
      if (page.frontmatter.operator_docs_version !== release.tag) {
        throw new Error(`${page.absolute}: operator_docs_version does not match ${release.tag}`);
      }
      if (keys.has(page.pageKey)) {
        throw new Error(`${root}: duplicate page key ${page.pageKey}`);
      }
      keys.add(page.pageKey);
    }
    pagesByRelease.set(release.tag, pages);
  }
  return pagesByRelease;
}

function routeForPage(relativePath) {
  if (
    typeof relativePath !== 'string' ||
    relativePath.startsWith('/') ||
    relativePath.includes('\\') ||
    relativePath.split('/').some((segment) => !segment || segment === '.' || segment === '..')
  ) {
    throw new Error(`unsafe Operator page route: ${relativePath}`);
  }
  let suffix;
  if (relativePath.endsWith('/_index.md')) {
    suffix = relativePath.slice(0, -'/_index.md'.length);
  } else if (relativePath === '_index.md') {
    suffix = '';
  } else if (relativePath.endsWith('.md')) {
    suffix = relativePath.slice(0, -'.md'.length);
  } else {
    throw new Error(`Operator content is not a Markdown page: ${relativePath}`);
  }
  return suffix ? `${PUBLIC_OPERATOR_ROOT}/${suffix}/` : `${PUBLIC_OPERATOR_ROOT}/`;
}

function targetForPage(tag, page) {
  const route = routeForPage(page.relativePath);
  if (route === `${PUBLIC_OPERATOR_ROOT}/`) {
    return `${PUBLIC_OPERATOR_ROOT}/versions/${tag}/`;
  }
  return `${PUBLIC_OPERATOR_ROOT}/versions/${tag}${route.slice(PUBLIC_OPERATOR_ROOT.length)}`;
}

function redirectSourceRelative(route, relativePath) {
  if (route === `${PUBLIC_OPERATOR_ROOT}/`) return '_index.md';
  if (!relativePath.endsWith('.md')) throw new Error(`invalid redirect source page: ${relativePath}`);
  return relativePath;
}

function makeRedirectPage(target, fallback, title, printable, globalNavEntry, weight) {
  const metadata = {
    title: title || 'Krkn Operator documentation',
    type: 'operator-docs-redirect',
    layout: 'operator-docs-redirect',
    operator_docs_redirect: true,
    operator_docs_target: target,
    operator_docs_preserve_fragment: !fallback,
    operator_docs_fallback: fallback,
    exclude_search: true,
    toc_hide: !globalNavEntry,
    hide_summary: true,
    no_list: true,
    no_print: !printable,
  };
  if (globalNavEntry && typeof weight === 'number') metadata.weight = weight;
  return metadata;
}

function buildRedirects(repoRoot, defaultRelease, releasePages) {
  const sourcePages = collectMarkdown(path.join(repoRoot, OPERATOR_ROOT));
  const routeRows = new Map();
  const pageKeyConflicts = new Map();
  const register = (page, origin) => {
    const route = routeForPage(page.relativePath);
    const existing = routeRows.get(route);
    if (existing && existing.pageKey !== page.pageKey) {
      throw new Error(`Operator route ${route} has conflicting page identities (${existing.pageKey}, ${page.pageKey})`);
    }
    if (!existing) {
      routeRows.set(route, {
        route,
        relativePath: page.relativePath,
        pageKey: page.pageKey,
        title: page.frontmatter.title,
        weight: page.frontmatter.weight,
        origin,
      });
    }
    const priorRoute = pageKeyConflicts.get(`${origin}:${page.pageKey}`);
    if (priorRoute && priorRoute !== route) {
      // A stable page key may move after a rename. Keep both incoming URLs and
      // send both to the corresponding destination in the selected release.
      return;
    }
    pageKeyConflicts.set(`${origin}:${page.pageKey}`, route);
  };
  for (const page of sourcePages) register(page, 'authoring');
  for (const [tag, pages] of releasePages) {
    for (const page of pages) register(page, tag);
  }

  const defaultPages = releasePages.get(defaultRelease.tag) || [];
  const targetByKey = new Map();
  for (const page of defaultPages) {
    if (targetByKey.has(page.pageKey)) {
      throw new Error(`default release ${defaultRelease.tag} has duplicate page key ${page.pageKey}`);
    }
    targetByKey.set(page.pageKey, page);
  }
  const overview = targetByKey.get('');
  if (!overview) throw new Error(`default release ${defaultRelease.tag} has no overview page`);
  const overviewTarget = targetForPage(defaultRelease.tag, overview);

  const redirects = [];
  for (const row of [...routeRows.values()].sort((a, b) => a.route.localeCompare(b.route))) {
    const selected = targetByKey.get(row.pageKey);
    const fallback = !selected;
    redirects.push({
      route: row.route,
      relativePath: redirectSourceRelative(row.route, row.relativePath),
      target: selected ? targetForPage(defaultRelease.tag, selected) : overviewTarget,
      fallback,
      title: selected?.frontmatter.title || row.title || 'Krkn Operator documentation',
      printable: row.relativePath.endsWith('_index.md'),
      weight: row.weight,
    });
  }
  return redirects;
}

function writeRedirectPages(repoRoot, redirects) {
  const redirectRoot = path.join(repoRoot, CACHE_ROOT, 'redirects');
  fs.mkdirSync(redirectRoot, { recursive: true });
  for (const redirect of redirects) {
    const destination = path.join(redirectRoot, redirect.relativePath);
    const resolved = path.resolve(destination);
    if (!resolved.startsWith(`${path.resolve(redirectRoot)}${path.sep}`)) {
      throw new Error(`redirect page path escapes generated root: ${redirect.relativePath}`);
    }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    const metadata = makeRedirectPage(
      redirect.target,
      redirect.fallback,
      redirect.title,
      redirect.printable,
      redirect.route === `${PUBLIC_OPERATOR_ROOT}/`,
      redirect.weight
    );
    fs.writeFileSync(destination, `---\n${YAML.stringify(metadata).trimEnd()}\n---\n`);
  }
  const manifest = redirects.map(({ route, target, fallback, printable }) => ({
    route,
    target,
    fallback,
    printable,
  }));
  fs.writeFileSync(
    path.join(repoRoot, CACHE_ROOT, 'redirect-manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );
}

function writeHugoConfig(repoRoot, defaultTag, registry) {
  const configPath = path.join(repoRoot, CACHE_ROOT, 'hugo.yaml');
  const releaseRecords = sortReleasesNewest(registry);
  const releaseTags = releaseRecords.map((release) => release.tag);
  const mounts = [
    {
      source: 'content/en',
      target: 'content',
      excludeFiles: ['docs/krkn-operator/**'],
    },
    {
      source: 'content/en/docs/krkn-operator/versions',
      target: 'content/docs/krkn-operator/versions',
    },
    {
      source: `${CACHE_ROOT}/redirects`,
      target: 'content/docs/krkn-operator',
    },
  ];
  const config = {
    module: {
      mounts,
    },
    params: {
      operator_docs_default_tag: defaultTag,
      operator_docs_release_tags: releaseTags,
      operator_docs_release_records: releaseRecords,
    },
  };
  fs.writeFileSync(configPath, YAML.stringify(config));
  return configPath;
}

function prepareHugoInputs(repoRoot, registry = readRegistry(repoRoot)) {
  validateRegistry(registry);
  removeGeneratedCache(repoRoot);
  const enabled = registry.releases.length > 0;
  if (!enabled) {
    return {
      enabled: false,
      versionTag: null,
      defaultRelease: null,
      hugoConfigPath: null,
      redirects: [],
    };
  }

  validateSnapshots(repoRoot, registry);
  const defaultRelease = selectDefaultRelease(registry);
  const releasePages = collectReleasePages(repoRoot, registry.releases);
  const redirects = buildRedirects(repoRoot, defaultRelease, releasePages);
  fs.mkdirSync(path.join(repoRoot, CACHE_ROOT), { recursive: true });
  writeRedirectPages(repoRoot, redirects);
  const hugoConfigPath = writeHugoConfig(repoRoot, defaultRelease.tag, registry);
  return {
    enabled: true,
    versionTag: defaultRelease.tag,
    defaultRelease,
    hugoConfigPath,
    redirects,
  };
}

function exactNetlifyRules(redirects) {
  const rules = [];
  const seen = new Set();
  for (const redirect of redirects) {
    const sources = new Set([redirect.route, redirect.route.replace(/\/$/, '')]);
    for (const source of sources) {
      if (!source || seen.has(source)) continue;
      seen.add(source);
      rules.push(`${source} ${redirect.target} 302`);
    }
  }
  return rules;
}

function finalizeRedirects(repoRoot, registry = readRegistry(repoRoot), publicDir = path.join(repoRoot, 'public')) {
  validateRegistry(registry);
  if (registry.releases.length === 0) return { appended: 0 };
  const manifestPath = path.join(repoRoot, CACHE_ROOT, 'redirect-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('generated Operator redirect manifest is missing; prepare the Hugo build first');
  }
  const redirects = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(redirects)) throw new Error('generated Operator redirect manifest is invalid');
  const expectedDefault = selectDefaultRelease(registry);
  const prefix = `${PUBLIC_OPERATOR_ROOT}/versions/${expectedDefault.tag}/`;
  for (const redirect of redirects) {
    if (
      typeof redirect.route !== 'string' ||
      !redirect.route.startsWith(`${PUBLIC_OPERATOR_ROOT}/`) ||
      redirect.route.includes('*') ||
      typeof redirect.target !== 'string' ||
      !redirect.target.startsWith(prefix) ||
      redirect.target.includes('*')
    ) {
      throw new Error(`unsafe generated Operator redirect: ${JSON.stringify(redirect)}`);
    }
  }

  const redirectFile = path.join(publicDir, '_redirects');
  const staticRedirectFile = path.join(repoRoot, 'static/_redirects');
  if (!fs.existsSync(redirectFile) && fs.existsSync(staticRedirectFile)) {
    fs.mkdirSync(publicDir, { recursive: true });
    fs.copyFileSync(staticRedirectFile, redirectFile);
  }
  if (!fs.existsSync(redirectFile)) {
    throw new Error('public/_redirects is missing; existing Netlify rules cannot be preserved');
  }
  const current = fs.readFileSync(redirectFile, 'utf8');
  const start = current.indexOf(REDIRECT_START);
  const end = current.indexOf(REDIRECT_END);
  let preserved = current;
  if (start !== -1 || end !== -1) {
    if (start === -1 || end === -1 || end < start) {
      throw new Error('public/_redirects has an incomplete Operator redirect block');
    }
    const afterEnd = end + REDIRECT_END.length;
    preserved = `${current.slice(0, start)}${current.slice(afterEnd)}`.trimEnd();
  }
  const rules = exactNetlifyRules(redirects);
  const block = [REDIRECT_START, ...rules, REDIRECT_END].join('\n');
  const result = `${preserved.trimEnd()}${preserved.trimEnd() ? '\n' : ''}${block}\n`;
  fs.writeFileSync(redirectFile, result);
  return { appended: rules.length };
}

module.exports = {
  finalizeRedirects,
  prepareHugoInputs,
  routeForPage,
};
