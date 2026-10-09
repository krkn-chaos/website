'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { BuildTimeIndexer } = require('../build-search-index');

function write(root, relativePath, contents) {
  const file = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, contents);
}

function registryRelease(tag, releaseId, publishedAt) {
  return {
    tag,
    github_release_id: releaseId,
    published_at: publishedAt,
    operator_commit: 'a'.repeat(40),
    website_commit: 'b'.repeat(40),
    helm_chart_version: '1.0.0',
    chart_reference: 'oci://quay.io/krkn-chaos/charts/krkn-operator:1.0.0',
    captured_at: '2026-10-08T00:00:00Z',
    snapshot_record: `operator-docs/snapshots/${tag}.json`,
  };
}

function releaseYaml(entry) {
  return [
    `  - tag: ${entry.tag}`,
    `    github_release_id: ${entry.github_release_id}`,
    `    published_at: ${entry.published_at}`,
    `    operator_commit: ${entry.operator_commit}`,
    `    website_commit: ${entry.website_commit}`,
    `    helm_chart_version: ${entry.helm_chart_version}`,
    `    chart_reference: ${entry.chart_reference}`,
    `    captured_at: ${entry.captured_at}`,
    `    snapshot_record: ${entry.snapshot_record}`,
  ].join('\n');
}

test('chatbot index includes the default snapshot and excludes authoring and older releases', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-search-index-'));
  const content = path.join(root, 'content/en');
  const oldRelease = registryRelease('v1.0.0', 100, '2026-09-01T00:00:00Z');
  const defaultRelease = registryRelease('v1.1.0', 110, '2026-10-01T00:00:00Z');
  write(root, 'data/operator_doc_versions.yaml', [
    'schema_version: 1',
    'releases:',
    releaseYaml(oldRelease),
    releaseYaml(defaultRelease),
    '',
  ].join('\n'));

  write(content, 'docs/scenarios/current.md', '---\ntitle: Other docs\n---\nOther documentation.\n');
  write(content, 'docs/krkn-operator/_index.md', '---\ntitle: Authoring\n---\nUnreleased authoring content.\n');
  write(content, 'docs/krkn-operator/versions/v1.0.0/_index.md', '---\ntitle: Old Operator\noperator_docs_version: v1.0.0\noperator_docs_page_key: ""\n---\nOlder release text.\n');
  write(content, 'docs/krkn-operator/versions/v1.1.0/_index.md', '---\ntitle: Current Operator\noperator_docs_version: v1.1.0\noperator_docs_page_key: ""\n---\nCurrent release text.\n');

  const indexer = new BuildTimeIndexer(content);
  await indexer.buildIndex();
  const urls = indexer.indexData.map((document) => document.url);
  const contents = indexer.indexData.map((document) => document.content).join(' ');
  assert.ok(urls.includes('/docs/krkn-operator/versions/v1.1.0/'));
  assert.ok(urls.includes('/docs/scenarios/current/'));
  assert.ok(!urls.some((url) => url.includes('/versions/v1.0.0/')));
  assert.ok(!contents.includes('Unreleased authoring content'));
  assert.ok(!contents.includes('Older release text'));
});
