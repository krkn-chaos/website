'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const YAML = require('yaml');

const { captureSnapshot } = require('../lib/operator-docs-snapshot');
const { readRegistry } = require('../lib/operator-docs');
const {
  finalizeRedirects,
  prepareHugoInputs,
} = require('../lib/operator-docs-hugo');

function setupRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-hugo-'));
  const write = (relativePath, contents) => {
    const absolute = path.join(repoRoot, relativePath);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, contents);
  };
  const git = (args) => execFileSync('git', args, { cwd: repoRoot, stdio: 'ignore' });
  git(['init', '-q']);
  git(['config', 'user.name', 'Operator Docs Tests']);
  git(['config', 'user.email', 'operator-docs-test@example.invalid']);
  write('data/operator_doc_versions.yaml', 'schema_version: 1\nreleases: []\n');
  write('hugo.yaml', 'module:\n  imports:\n    - path: github.com/google/docsy\n');
  write('static/_redirects', '/api/chat /.netlify/functions/chat 200\n');
  write('content/en/docs/krkn-operator/_index.md', '---\ntitle: Operator\nweight: 8\n---\nOverview one.\n');
  write('content/en/docs/krkn-operator/usage/_index.md', '---\ntitle: Usage\n---\nUsage section.\n');
  write('content/en/docs/krkn-operator/usage/jobs.md', '---\ntitle: Jobs\n---\nJobs body one.\n');
  write('content/en/docs/krkn-operator/usage/old.md', '---\ntitle: Old page\n---\nOnly in release one.\n');
  write('data/roadmap.yaml', 'releases: []\n');
  git(['add', '.']);
  git(['commit', '-q', '-m', 'release one docs']);
  const firstCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();

  const first = {
    tag: 'v1.0.0',
    github_release_id: 100,
    published_at: '2026-09-01T00:00:00Z',
    operator_commit: 'a'.repeat(40),
    website_commit: firstCommit,
    helm_chart_version: '1.0.0',
    chart_reference: 'oci://quay.io/krkn-chaos/charts/krkn-operator',
  };
  captureSnapshot({
    repoRoot,
    releaseInputs: first,
    now: () => '2026-09-02T00:00:00Z',
  });

  write('content/en/docs/krkn-operator/_index.md', '---\ntitle: Operator\nweight: 8\n---\nOverview two.\n');
  write('content/en/docs/krkn-operator/usage/jobs.md', '---\ntitle: Jobs\n---\nJobs body two.\n');
  fs.unlinkSync(path.join(repoRoot, 'content/en/docs/krkn-operator/usage/old.md'));
  write('content/en/docs/krkn-operator/usage/events.md', '---\ntitle: Events\n---\nEvents body.\n');
  git(['add', 'content/en/docs/krkn-operator']);
  git(['commit', '-q', '-m', 'release two docs']);
  const secondCommit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
  const second = {
    ...first,
    tag: 'v1.1.0',
    github_release_id: 110,
    published_at: '2026-10-01T00:00:00Z',
    operator_commit: 'b'.repeat(40),
    website_commit: secondCommit,
    helm_chart_version: '1.1.1',
  };
  captureSnapshot({
    repoRoot,
    releaseInputs: second,
    now: () => '2026-10-02T00:00:00Z',
  });
  return { repoRoot };
}

test('empty registry leaves Hugo mounts untouched and clears only generated cache', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-empty-'));
  fs.mkdirSync(path.join(repoRoot, 'data'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, 'data/operator_doc_versions.yaml'), 'schema_version: 1\nreleases: []\n');
  fs.mkdirSync(path.join(repoRoot, '.cache/operator-docs'), { recursive: true });
  fs.mkdirSync(path.join(repoRoot, '.cache/other'), { recursive: true });
  fs.writeFileSync(path.join(repoRoot, '.cache/operator-docs/old.txt'), 'remove');
  fs.writeFileSync(path.join(repoRoot, '.cache/other/keep.txt'), 'keep');

  const result = prepareHugoInputs(repoRoot, readRegistry(repoRoot));
  assert.equal(result.enabled, false);
  assert.equal(result.hugoConfigPath, null);
  assert.equal(fs.existsSync(path.join(repoRoot, '.cache/operator-docs/old.txt')), false);
  assert.equal(fs.existsSync(path.join(repoRoot, '.cache/other/keep.txt')), true);
});

test('prepared mounts publish snapshots and compatibility redirects use stable page identity', () => {
  const { repoRoot } = setupRepo();
  const registry = readRegistry(repoRoot);
  const result = prepareHugoInputs(repoRoot, registry);
  assert.equal(result.enabled, true);
  assert.equal(result.versionTag, 'v1.1.0');
  assert.ok(fs.existsSync(result.hugoConfigPath));

  const config = fs.readFileSync(result.hugoConfigPath, 'utf8');
  assert.match(config, /source: content\/en/);
  assert.match(config, /excludeFiles:/);
  assert.match(config, /content\/en\/docs\/krkn-operator\/versions/);
  assert.match(config, /\.cache\/operator-docs\/redirects/);
  const jobsRedirect = fs.readFileSync(
    path.join(repoRoot, '.cache/operator-docs/redirects/usage/jobs.md'),
    'utf8'
  );
  assert.match(jobsRedirect, /operator_docs_target: \/docs\/krkn-operator\/versions\/v1\.1\.0\/usage\/jobs\//);
  assert.match(jobsRedirect, /operator_docs_preserve_fragment: true/);

  const rootRedirect = fs.readFileSync(
    path.join(repoRoot, '.cache/operator-docs/redirects/_index.md'),
    'utf8'
  );
  assert.match(rootRedirect, /toc_hide: false/);
  assert.match(rootRedirect, /no_list: true/);
  assert.match(rootRedirect, /weight: 8/);
  assert.match(jobsRedirect, /toc_hide: true/);

  const missingPageRedirect = fs.readFileSync(
    path.join(repoRoot, '.cache/operator-docs/redirects/usage/old.md'),
    'utf8'
  );
  assert.match(missingPageRedirect, /operator_docs_target: \/docs\/krkn-operator\/versions\/v1\.1\.0\//);
  assert.match(missingPageRedirect, /operator_docs_fallback: true/);
  assert.match(missingPageRedirect, /operator_docs_preserve_fragment: false/);
});

test('prepared builds only mount releases in the registry', () => {
  const { repoRoot } = setupRepo();
  const registry = readRegistry(repoRoot);
  const result = prepareHugoInputs(repoRoot, registry, {
    includePreviewTestSnapshot: true,
  });
  const config = YAML.parse(fs.readFileSync(result.hugoConfigPath, 'utf8'));

  assert.deepEqual(config.params.operator_docs_release_tags, ['v1.1.0', 'v1.0.0']);
  assert.equal(Object.hasOwn(result, 'previewTestRelease'), false);
  assert.ok(
    !config.module.mounts.some((mount) => mount.target.includes('/preview-test'))
  );
  assert.equal(fs.existsSync(path.join(repoRoot, '.cache/operator-docs/preview-test-snapshot')), false);
});

test('final redirects append exact temporary rules and preserve existing API rules', () => {
  const { repoRoot } = setupRepo();
  prepareHugoInputs(repoRoot, readRegistry(repoRoot));
  const publicDir = path.join(repoRoot, 'public');
  fs.mkdirSync(publicDir, { recursive: true });
  fs.copyFileSync(path.join(repoRoot, 'static/_redirects'), path.join(publicDir, '_redirects'));

  finalizeRedirects(repoRoot, readRegistry(repoRoot), publicDir);
  const redirectsFile = path.join(publicDir, '_redirects');
  const redirects = fs.readFileSync(redirectsFile, 'utf8');
  assert.match(redirects, /\/api\/chat \/\.netlify\/functions\/chat 200/);
  assert.match(redirects, /^\/docs\/krkn-operator\/usage\/jobs \/docs\/krkn-operator\/versions\/v1\.1\.0\/usage\/jobs\/ 302$/m);
  assert.match(redirects, /^\/docs\/krkn-operator\/usage\/jobs\/ \/docs\/krkn-operator\/versions\/v1\.1\.0\/usage\/jobs\/ 302$/m);
  assert.doesNotMatch(redirects, /\/docs\/krkn-operator\/versions\/\*/);

  finalizeRedirects(repoRoot, readRegistry(repoRoot), publicDir);
  const twice = fs.readFileSync(redirectsFile, 'utf8');
  assert.equal(twice.match(/BEGIN OPERATOR DOC REDIRECTS/g)?.length, 1);
  assert.equal(twice.match(/\/api\/chat/g)?.length, 1);
});
