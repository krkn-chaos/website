'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { finalizeRedirects, prepareHugoInputs } = require('../lib/operator-docs-hugo');
const { captureSnapshot } = require('../lib/operator-docs-snapshot');
const { readRegistry } = require('../lib/operator-docs');

const sourceRoot = path.resolve(__dirname, '../..');
const hugoBinary = process.env.HUGO_BIN || path.join(sourceRoot, 'node_modules/.bin/hugo');

function write(root, relativePath, contents) {
  const filePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents);
}

function git(root, args) {
  execFileSync('git', args, { cwd: root, stdio: 'ignore' });
}

function commit(root, message) {
  git(root, ['add', '.']);
  git(root, ['commit', '-q', '-m', message]);
  return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
}

function copyTree(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.cpSync(from, to, { recursive: true });
}

function releaseInputs(repoRoot, tag, releaseId, publishedAt, operatorCommit, websiteCommit, chartVersion) {
  return {
    tag,
    github_release_id: releaseId,
    published_at: publishedAt,
    operator_commit: operatorCommit,
    website_commit: websiteCommit,
    helm_chart_version: chartVersion,
    chart_reference: `oci://quay.io/krkn-chaos/charts/krkn-operator:${chartVersion}`,
  };
}

function createSiteFixture() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-site-'));
  git(repoRoot, ['init', '-q']);
  git(repoRoot, ['config', 'user.name', 'Operator Docs Site Tests']);
  git(repoRoot, ['config', 'user.email', 'operator-docs-site-test@example.invalid']);
  write(repoRoot, 'hugo.yaml', [
    'baseURL: https://preview.invalid/',
    'title: Krkn test site',
    'defaultContentLanguage: en',
    'contentDir: content/en',
    'outputFormats:',
    '  print:',
    '    mediaType: text/html',
    '    baseName: index.print',
    'outputs:',
    '  section: [HTML, print]',
    'markup:',
    '  goldmark:',
    '    renderer:',
    '      unsafe: true',
    '',
  ].join('\n'));
  write(repoRoot, 'data/operator_doc_versions.yaml', 'schema_version: 1\nreleases: []\n');
  write(repoRoot, 'data/roadmap.yaml', 'releases: []\n');
  write(repoRoot, 'static/_redirects', '/api/chat /.netlify/functions/chat 200\n');
  write(repoRoot, 'content/en/docs/_index.md', '---\ntitle: Documentation\n---\nAll docs.\n');
  write(repoRoot, 'content/en/docs/scenarios/current.md', '---\ntitle: Other product\n---\nOther product docs.\n');
  write(repoRoot, 'content/en/docs/krkn-operator/_index.md', '---\ntitle: Operator overview\n---\nAuthoring overview must stay private.\n');
  write(repoRoot, 'content/en/docs/krkn-operator/installation/_index.md', '---\ntitle: Installation\n---\nFirst release installation steps.\n');
  write(repoRoot, 'content/en/docs/krkn-operator/usage/_index.md', '---\ntitle: Usage\n---\nAuthoring section.\n');
  write(repoRoot, 'content/en/docs/krkn-operator/usage/jobs.md', '---\ntitle: Jobs\n---\nFirst release job text.\n');
  write(repoRoot, 'content/en/docs/krkn-operator/usage/old.md', '---\ntitle: Old feature\n---\nOnly available in old release.\n');
  copyTree(
    path.join(sourceRoot, 'content/en/community/operator-feedback.md'),
    path.join(repoRoot, 'content/en/community/operator-feedback.md')
  );
  write(repoRoot, 'content/en/community/_index.md', '---\ntitle: Community\n---\nCommunity landing.\n');
  copyTree(path.join(sourceRoot, 'layouts/community/list.html'), path.join(repoRoot, 'layouts/community/list.html'));
  copyTree(path.join(sourceRoot, 'layouts/community/baseof.html'), path.join(repoRoot, 'layouts/community/baseof.html'));
  write(repoRoot, 'layouts/community/single.html', '{{ define "main" }}{{ .Content }}{{ end }}');
  write(repoRoot, 'layouts/partials/head.html', '');
  write(repoRoot, 'layouts/partials/navbar.html', '');
  write(repoRoot, 'layouts/partials/footer.html', '');
  write(repoRoot, 'layouts/partials/scripts.html', '{{ partial "hooks/body-end.html" . }}');
  copyTree(path.join(sourceRoot, 'static/js/feedback-form.js'), path.join(repoRoot, 'static/js/feedback-form.js'));
  write(repoRoot, 'layouts/shortcodes/notice.html', '{{ .Inner }}');
  const firstCommit = commit(repoRoot, 'first operator documentation release');

  captureSnapshot({
    repoRoot,
    releaseInputs: releaseInputs(repoRoot, 'v1.0.0', 100, '2026-09-01T00:00:00Z', 'a'.repeat(40), firstCommit, '1.0.0'),
    now: () => '2026-09-02T00:00:00Z',
  });

  write(repoRoot, 'content/en/docs/krkn-operator/_index.md', '---\ntitle: Operator overview\n---\nSecond release overview.\n');
  write(repoRoot, 'content/en/docs/krkn-operator/installation/_index.md', '---\ntitle: Installation\n---\nSecond release installation steps.\n');
  write(repoRoot, 'content/en/docs/krkn-operator/usage/jobs.md', '---\ntitle: Jobs\n---\nSecond release job text.\n');
  fs.rmSync(path.join(repoRoot, 'content/en/docs/krkn-operator/usage/old.md'));
  const secondCommit = commit(repoRoot, 'second operator documentation release');
  captureSnapshot({
    repoRoot,
    releaseInputs: releaseInputs(repoRoot, 'v1.1.0', 110, '2026-10-01T00:00:00Z', 'b'.repeat(40), secondCommit, '1.1.0'),
    now: () => '2026-10-02T00:00:00Z',
  });

  const operatorPartials = path.join(sourceRoot, 'layouts/_partials/operator-docs');
  copyTree(operatorPartials, path.join(repoRoot, 'layouts/_partials/operator-docs'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/sidebar.html'), path.join(repoRoot, 'layouts/_partials/sidebar.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/print'), path.join(repoRoot, 'layouts/_partials/print'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/breadcrumb.html'), path.join(repoRoot, 'layouts/_partials/breadcrumb.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/page-meta-links.html'), path.join(repoRoot, 'layouts/_partials/page-meta-links.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/page-meta-lastmod.html'), path.join(repoRoot, 'layouts/_partials/page-meta-lastmod.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/default-breadcrumb.html'), path.join(repoRoot, 'layouts/_partials/default-breadcrumb.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/default-page-meta-links.html'), path.join(repoRoot, 'layouts/_partials/default-page-meta-links.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/default-page-meta-lastmod.html'), path.join(repoRoot, 'layouts/_partials/default-page-meta-lastmod.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/default-print'), path.join(repoRoot, 'layouts/_partials/default-print'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/hooks/body-end.html'), path.join(repoRoot, 'layouts/_partials/hooks/body-end.html'));
  copyTree(path.join(sourceRoot, 'layouts/_partials/chatbot.html'), path.join(repoRoot, 'layouts/_partials/chatbot.html'));
  copyTree(path.join(sourceRoot, 'layouts/operator-docs-redirect'), path.join(repoRoot, 'layouts/operator-docs-redirect'));
  copyTree(path.join(sourceRoot, 'assets/json/offline-search-index.json'), path.join(repoRoot, 'assets/json/offline-search-index.json'));
  write(repoRoot, 'layouts/_partials/search-input.html', '<input type="search" aria-label="Search">');
  write(repoRoot, 'layouts/_default/single.html', [
    '{{ $ctx := partial "operator-docs/context.html" . }}',
    '<!doctype html><html><body><main>',
    '{{ if $ctx.enabled }}{{ partial "sidebar.html" . }}{{ partial "operator-docs/banner.html" $ctx }}{{ end }}',
    '{{ partial "breadcrumb.html" . }}{{ partial "page-meta-links.html" . }}{{ partial "page-meta-lastmod.html" . }}',
    '<h1>{{ .Title }}</h1>{{ .Content }}',
    '{{ $search := resources.Get "json/offline-search-index.json" | resources.ExecuteAsTemplate "test-offline-search.json" . }}<link rel="test-search-index" href="{{ $search.RelPermalink }}">',
    '{{ partial "hooks/body-end.html" . }}',
    '</main></body></html>',
  ].join('\n'));
  write(repoRoot, 'layouts/_default/list.html', [
    '{{ $ctx := partial "operator-docs/context.html" . }}',
    '<!doctype html><html><body><main>',
    '{{ if $ctx.enabled }}{{ partial "sidebar.html" . }}{{ partial "operator-docs/banner.html" $ctx }}{{ end }}',
    '{{ partial "breadcrumb.html" . }}{{ partial "page-meta-links.html" . }}{{ partial "page-meta-lastmod.html" . }}',
    '<h1>{{ .Title }}</h1>{{ .Content }}{{ range .RegularPages }}<a href="{{ .RelPermalink }}">{{ .Title }}</a>{{ end }}',
    '{{ partial "hooks/body-end.html" . }}',
    '</main></body></html>',
  ].join('\n'));
  write(repoRoot, 'layouts/_default/list.print.html', '{{ partial "print/render.html" . }}');
  write(repoRoot, 'layouts/_partials/print/toc-li.html', '<li>{{ .sid }} {{ .Page.Title }}</li>');
  write(repoRoot, 'layouts/_partials/print/content.html', '<article><h1>{{ .Page.Title }}</h1>{{ .Page.Content }}</article>');

  return repoRoot;
}

function addSyntheticTestRelease(repoRoot) {
  write(repoRoot, 'content/en/docs/krkn-operator/_index.md', [
    '---',
    'title: Snapshot fixture overview',
    'description: Synthetic content used only by the generated-site test.',
    '---',
    '<div class="row"><div class="col-md-6"><h2>Changed layout</h2><p>A different page structure for the site fixture.</p></div><div class="col-md-6"><h2>Changed content</h2><p>This copy exists only in the test fixture release.</p></div></div>',
    '',
  ].join('\n'));
  write(repoRoot, 'content/en/docs/krkn-operator/installation/_index.md', [
    '---',
    'title: Installation',
    '---',
    '## Revised installation walkthrough',
    '',
    '<div class="krkn-video"><iframe src="https://www.youtube.com/embed/cgecXQEFqFQ" title="Test fixture installation walkthrough" frameborder="0" allowfullscreen></iframe></div>',
    '',
  ].join('\n'));
  write(repoRoot, 'content/en/docs/krkn-operator/new-page.md', [
    '---',
    'title: New fixture page',
    '---',
    'Added only to the synthetic test fixture release.',
    '',
  ].join('\n'));
  fs.rmSync(path.join(repoRoot, 'content/en/docs/krkn-operator/usage/jobs.md'));
  const websiteCommit = commit(repoRoot, 'test fixture with changed, added, and removed pages');
  const tag = 'v1.0.1';
  captureSnapshot({
    repoRoot,
    releaseInputs: releaseInputs(
      repoRoot,
      tag,
      105,
      '2026-09-15T00:00:00Z',
      'c'.repeat(40),
      websiteCommit,
      '1.0.1-test'
    ),
    now: () => '2026-10-03T00:00:00Z',
  });
  return tag;
}

function buildFixture(repoRoot) {
  const prepared = prepareHugoInputs(repoRoot, readRegistry(repoRoot));
  assert.equal(prepared.enabled, true);
  try {
    execFileSync(hugoBinary, [
      '--config', `hugo.yaml,${path.relative(repoRoot, prepared.hugoConfigPath)}`,
      '--destination', 'public',
      '--baseURL', 'https://preview.invalid/',
    ], { cwd: repoRoot, stdio: 'pipe' });
  } catch (error) {
    throw new Error(`Hugo fixture build failed: ${String(error.stdout || '')}${String(error.stderr || '')}`);
  }
  finalizeRedirects(repoRoot, readRegistry(repoRoot), path.join(repoRoot, 'public'));
}

test('generated site isolates snapshots, preserves selection, redirects old links, and searches only latest', (t) => {
  if (!fs.existsSync(hugoBinary)) return t.skip('pinned Hugo binary is unavailable');
  const repoRoot = createSiteFixture();
  buildFixture(repoRoot);

  const readPublic = (relativePath) => fs.readFileSync(path.join(repoRoot, 'public', relativePath), 'utf8');
  const latestJobs = readPublic('docs/krkn-operator/versions/v1.1.0/usage/jobs/index.html');
  const oldOnly = readPublic('docs/krkn-operator/versions/v1.0.0/usage/old/index.html');
  const printDocs = readPublic('docs/index.print.html');
  const printOldRelease = readPublic('docs/krkn-operator/versions/v1.0.0/index.print.html');
  const legacyOldOnly = readPublic('docs/krkn-operator/usage/old/index.html');
  const legacyJobs = readPublic('docs/krkn-operator/usage/jobs/index.html');
  const otherProduct = readPublic('docs/scenarios/current/index.html');
  const currentFeedback = readPublic('community/operator-feedback/index.html');
  const searchPath = latestJobs.match(/<link rel="test-search-index" href="([^"]+)"/)?.[1];
  const offlineSearch = searchPath && readPublic(searchPath.replace(/^\//, ''));

  assert.match(latestJobs, /Operator documentation version/);
  assert.match(latestJobs, /Back to all Krkn docs/);
  assert.match(latestJobs, /Browse all Krkn documentation/);
  assert.doesNotMatch(latestJobs, /krkn-operator-docs-version-picker__all/);
  assert.match(latestJobs, /v1\.1\.0 \(Latest\)/);
  assert.match(latestJobs, /Second release job text/);
  assert.doesNotMatch(latestJobs, /Authoring overview must stay private/);
  assert.match(latestJobs, /\/js\/chatbot\.js/);
  assert.match(latestJobs, /\/js\/operator-docs-selector\.js/);
  const latestSidebar = latestJobs.match(/<nav class="td-sidebar-nav[\s\S]*?<\/nav>/)?.[0] || '';
  assert.match(latestSidebar, /\/versions\/v1\.1\.0\//);
  assert.doesNotMatch(latestSidebar, /\/versions\/v1\.0\.0\//);
  assert.match(oldOnly, /Only available in old release/);
  assert.match(oldOnly, /Captured .* from website commit/);
  assert.doesNotMatch(oldOnly, /breadcrumb-item[^>]*>Operator documentation versions/);
  assert.doesNotMatch(oldOnly, /\/js\/chatbot\.js/);
  assert.match(oldOnly, /\/js\/operator-docs-selector\.js/);
  assert.match(oldOnly, /not available in the latest documentation|Open v1\.1\.0 documentation/i);
  assert.match(oldOnly, /value="\/docs\/krkn-operator\/versions\/v1\.1\.0\/"[^>]*>\s*v1\.1\.0 \(Latest\) \(overview\)/);
  assert.match(legacyOldOnly, /canonical" href="https:\/\/preview\.invalid\/docs\/krkn-operator\/versions\/v1\.1\.0\/"/);
  assert.match(legacyOldOnly, /window\.location\.replace/);
  assert.match(legacyOldOnly, /data-preserve-fragment="false"/);
  assert.match(legacyJobs, /data-preserve-fragment="true"/);
  assert.match(legacyJobs, /versions\/v1\.1\.0\/usage\/jobs\//);
  assert.match(otherProduct, /Other product docs/);
  assert.match(currentFeedback, /id="krkn-feedback-form"/);
  assert.match(currentFeedback, /\/js\/feedback-form\.js/);
  assert.match(printDocs, /v1\.1\.0/);
  assert.doesNotMatch(printDocs, /v1\.0\.0/);
  assert.match(printOldRelease, /v1\.0\.0/);
  assert.ok(offlineSearch);
  const searchDocuments = JSON.parse(offlineSearch);
  assert.ok(searchDocuments.some((document) => document.ref === '/docs/krkn-operator/versions/v1.1.0/'));
  assert.ok(!searchDocuments.some((document) => document.ref.includes('/versions/v1.0.0/')));
  assert.match(fs.readFileSync(path.join(repoRoot, 'public/_redirects'), 'utf8'), /\/api\/chat \/\.netlify\/functions\/chat 200/);
  assert.match(fs.readFileSync(path.join(repoRoot, 'public/_redirects'), 'utf8'), /^\/docs\/krkn-operator\/usage\/old \/docs\/krkn-operator\/versions\/v1\.1\.0\/ 302$/m);
});

test('registered test fixtures render changed, added, and removed pages as normal snapshots', (t) => {
  if (!fs.existsSync(hugoBinary)) return t.skip('pinned Hugo binary is unavailable');
  const repoRoot = createSiteFixture();
  const testReleaseTag = addSyntheticTestRelease(repoRoot);
  buildFixture(repoRoot);

  const readPublic = (relativePath) => fs.readFileSync(path.join(repoRoot, 'public', relativePath), 'utf8');
  const latestJobs = readPublic('docs/krkn-operator/versions/v1.1.0/usage/jobs/index.html');
  const testOverview = readPublic(`docs/krkn-operator/versions/${testReleaseTag}/index.html`);
  const testInstallation = readPublic(`docs/krkn-operator/versions/${testReleaseTag}/installation/index.html`);
  const testNewPage = readPublic(`docs/krkn-operator/versions/${testReleaseTag}/new-page/index.html`);
  const defaultRedirects = readPublic('_redirects');
  const searchPath = latestJobs.match(/<link rel="test-search-index" href="([^"]+)"/)?.[1];
  const offlineSearch = searchPath && readPublic(searchPath.replace(/^\//, ''));

  assert.match(testOverview, /Changed layout/);
  assert.match(testOverview, /Changed content/);
  assert.match(testInstallation, /Test fixture installation walkthrough/);
  assert.match(testInstallation, /youtube\.com\/embed\/cgecXQEFqFQ/);
  assert.match(testNewPage, /Added only to the synthetic test fixture release/);
  assert.equal(
    fs.existsSync(path.join(repoRoot, `public/docs/krkn-operator/versions/${testReleaseTag}/usage/jobs/index.html`)),
    false
  );
  assert.match(latestJobs, /v1\.1\.0 \(Latest\)/);
  assert.match(latestJobs, /v1\.0\.1 \(overview\)/);
  assert.match(
    latestJobs,
    /value="\/docs\/krkn-operator\/versions\/v1\.0\.1\/"[^>]*>\s*v1\.0\.1 \(overview\)/
  );
  assert.match(defaultRedirects, /^\/docs\/krkn-operator\/usage\/jobs \/docs\/krkn-operator\/versions\/v1\.1\.0\/usage\/jobs\/ 302$/m);
  assert.equal(defaultRedirects.includes(testReleaseTag), false);
  assert.match(testOverview, /Captured .* from website commit/);
  assert.doesNotMatch(testOverview, /Preview test snapshot|not a published release/);
  assert.ok(offlineSearch);
  assert.ok(JSON.parse(offlineSearch).some((document) => document.ref === '/docs/krkn-operator/versions/v1.1.0/'));
  assert.ok(!JSON.parse(offlineSearch).some((document) => document.ref.includes(`/versions/${testReleaseTag}/`)));
});
