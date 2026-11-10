'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const {
  derivePageKey,
  readRegistry,
  selectDefaultRelease,
  sortReleasesNewest,
  validateRegistry,
  validateSnapshots,
} = require('../lib/operator-docs');

function release(tag, githubReleaseId, publishedAt, overrides = {}) {
  return {
    tag,
    github_release_id: githubReleaseId,
    published_at: publishedAt,
    operator_commit: 'a'.repeat(40),
    website_commit: 'b'.repeat(40),
    helm_chart_version: '1.0.0',
    chart_reference:
      'oci://quay.io/krkn-chaos/charts/krkn-operator:1.0.0',
    captured_at: '2026-10-08T12:00:00Z',
    snapshot_record: `operator-docs/snapshots/${tag}.json`,
    ...overrides,
  };
}

function temporaryRepo(registryText) {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-'));
  fs.mkdirSync(path.join(repoRoot, 'data'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'data/operator_doc_versions.yaml'),
    registryText
  );
  return repoRoot;
}

test('derives stable keys for overview, section indexes, and articles', () => {
  assert.equal(derivePageKey('_index.md', {}), '');
  assert.equal(derivePageKey('installation/_index.md', {}), 'installation');
  assert.equal(derivePageKey('usage/jobs.md', {}), 'usage/jobs');
});

test('an explicit page key preserves identity after an article rename', () => {
  assert.equal(
    derivePageKey('usage/renamed-jobs.md', {
      operator_docs_page_key: 'usage/jobs',
    }),
    'usage/jobs'
  );
});

test('rejects paths and explicit keys that escape the release tree', () => {
  assert.throws(() => derivePageKey('../jobs.md', {}), /unsafe|invalid/i);
  assert.throws(
    () => derivePageKey('usage/jobs.md', { operator_docs_page_key: '../jobs' }),
    /unsafe|invalid/i
  );
  assert.throws(() => derivePageKey('/jobs.md', {}), /unsafe|invalid/i);
});

test('reads a valid empty registry', () => {
  const repoRoot = temporaryRepo('schema_version: 1\nreleases: []\n');
  assert.deepEqual(readRegistry(repoRoot), { schema_version: 1, releases: [] });
});

test('published registry and snapshot inventory include only stable Operator releases', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const registry = readRegistry(repoRoot);
  assert.ok(registry.releases.every((release) => /^v\d+\.\d+\.\d+$/.test(release.tag)));
  assert.doesNotThrow(() => validateSnapshots(repoRoot, registry));
});

test('rejects duplicate tags and duplicate GitHub release IDs', () => {
  const first = release('v1.2.0', 120, '2026-10-01T00:00:00Z');
  assert.throws(
    () => validateRegistry({ schema_version: 1, releases: [first, first] }),
    /duplicate.*tag/i
  );
  assert.throws(
    () =>
      validateRegistry({
        schema_version: 1,
        releases: [
          first,
          release('v1.2.1', 120, '2026-10-02T00:00:00Z'),
        ],
      }),
    /duplicate.*release/i
  );
});

test('rejects unsafe tags, malformed dates, hashes, and snapshot paths', () => {
  const valid = release('v1.2.0', 120, '2026-10-01T00:00:00Z');
  for (const invalid of [
    { ...valid, tag: '../v1.2.0' },
    { ...valid, tag: 'v1.2.0-rc1' },
    { ...valid, published_at: 'yesterday' },
    { ...valid, operator_commit: 'abc' },
    { ...valid, website_commit: 'z'.repeat(40) },
    { ...valid, snapshot_record: 'operator-docs/snapshots/other.json' },
  ]) {
    assert.throws(
      () => validateRegistry({ schema_version: 1, releases: [invalid] }),
      /invalid|unsafe|snapshot|commit|timestamp|published/i
    );
  }
});

test('allows equal publication timestamps when distinct release IDs disambiguate them', () => {
  assert.doesNotThrow(() => validateRegistry({
    schema_version: 1,
    releases: [
      release('v1.2.0', 120, '2026-10-01T00:00:00Z'),
      release('v1.2.1', 121, '2026-10-01T00:00:00Z'),
    ],
  }));
});

test('chooses the newest stable publication by time then release ID', () => {
  const old = release('v1.1.0', 99, '2026-09-30T00:00:00Z');
  const newest = release('v1.2.0', 120, '2026-10-01T00:00:00Z');
  const sameTimeLaterId = release('v1.2.1', 121, '2026-10-01T00:00:00Z');
  const registry = {
    schema_version: 1,
    releases: [newest, old, sameTimeLaterId],
  };
  assert.equal(selectDefaultRelease(registry), sameTimeLaterId);
  assert.deepEqual(sortReleasesNewest(registry), [sameTimeLaterId, newest, old]);
  assert.equal(selectDefaultRelease({ schema_version: 1, releases: [] }), null);
});

test('does not mutate registry order while selecting a default', () => {
  const first = release('v1.1.0', 99, '2026-09-30T00:00:00Z');
  const second = release('v1.2.0', 120, '2026-10-01T00:00:00Z');
  const registry = { schema_version: 1, releases: [first, second] };
  assert.equal(selectDefaultRelease(registry), second);
  assert.deepEqual(registry.releases, [first, second]);
});

test('reports malformed registry YAML', () => {
  const repoRoot = temporaryRepo('schema_version: [\nreleases: nope\n');
  assert.throws(() => readRegistry(repoRoot), /yaml|parse|registry/i);
});
