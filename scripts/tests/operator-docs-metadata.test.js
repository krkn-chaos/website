'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const YAML = require('yaml');
const { identifySourceRelease, appendReleaseMetadata, prepareMetadataPr } = require('../operator-docs-metadata-pr');

const pull = {
  number: 681, merged: true, merge_commit_sha: 'a'.repeat(40),
  base: { ref: 'main', repo: { full_name: 'krkn-chaos/website' } },
  head: { ref: 'docs/operator-source/v1.1.0' },
};

test('merged source PR identifies the exact release, reviewed commit, and release branch', () => {
  assert.deepEqual(identifySourceRelease(pull), {
    tag: 'v1.1.0', websiteCommit: 'a'.repeat(40), chartVersion: '1.1.0', releaseBranch: 'release-1.1',
  });
  assert.throws(() => identifySourceRelease({ ...pull, merged: false }), /merged/);
  assert.throws(() => identifySourceRelease({ ...pull, head: { ref: 'docs/operator-source/v1.1.0-rc7' } }), /stable/);
  assert.throws(() => identifySourceRelease({ ...pull, base: { ...pull.base, ref: 'preview' } }), /main/);
});

test('metadata preserves previous mappings and refuses changed provenance for the same tag', () => {
  const source = 'schema_version: 1\nreleases:\n  - operator_tag: v1.0.0\n    website_commit: ' + 'b'.repeat(40) + '\n    helm_chart_version: "1.0.0"\n';
  const release = identifySourceRelease(pull);
  const content = appendReleaseMetadata(source, release);
  const registry = YAML.parse(content);
  assert.equal(registry.releases[0].operator_tag, 'v1.0.0');
  assert.deepEqual(registry.releases[1], { operator_tag: 'v1.1.0', website_commit: 'a'.repeat(40), helm_chart_version: '1.1.0' });
  assert.equal(appendReleaseMetadata(content, release), content);
  assert.throws(() => appendReleaseMetadata(content, { ...release, websiteCommit: 'c'.repeat(40) }), /different provenance/);
  assert.throws(() => appendReleaseMetadata('schema_version: 1\nwebsite_commit: ""\n', release), /releases list/);
});

function fixture({ published = false, changedPaths, existingPull = false, tagCreated = false, missingBranch = false, ancestry = 'ahead', metadataMerged = false } = {}) {
  const calls = [];
  const api = async (method, route, body) => {
    calls.push({ method, route, body });
    if (route === '/repos/krkn-chaos/website/pulls/681') return pull;
    if (route.includes('/pulls/681/files')) return (changedPaths || ['content/en/docs/krkn-operator/usage/jobs.md']).map(filename => ({ filename }));
    if (route.includes('/compare/')) return { status: ancestry, files: [{ filename: 'docs/website-release.yaml' }] };
    if (route.includes('/releases/tags/')) {
      if (published) return { draft: false, prerelease: false, tag_name: 'v1.1.0' };
      throw Object.assign(new Error('not found'), { status: 404 });
    }
    if (route.includes('/git/ref/tags/')) {
      if (tagCreated) return { object: { sha: 'f'.repeat(40) } };
      throw Object.assign(new Error('not found'), { status: 404 });
    }
    if (route.includes('/contents/')) {
      if ((existingPull && route.includes('ref=' + 'e'.repeat(40))) || (metadataMerged && route.includes('ref=' + 'b'.repeat(40)))) return {
        encoding: 'base64', content: Buffer.from(appendReleaseMetadata(null, identifySourceRelease(pull))).toString('base64'),
      };
      throw Object.assign(new Error('not found'), { status: 404 });
    }
    if (method === 'GET' && route.includes('/git/ref/heads/release-1.1')) {
      if (missingBranch) throw Object.assign(new Error('missing release branch'), { status: 404 });
      return { object: { sha: 'b'.repeat(40) } };
    }
    if (method === 'GET' && route.includes('/git/ref/heads/docs/')) {
      if (existingPull) return { object: { sha: 'e'.repeat(40) } };
      throw Object.assign(new Error('not found'), { status: 404 });
    }
    if (method === 'GET' && route.includes('/git/commits/')) return { tree: { sha: 'c'.repeat(40) } };
    if (route.includes('/git/trees')) return { sha: 'd'.repeat(40) };
    if (route.includes('/git/commits') && method === 'POST') return { sha: 'e'.repeat(40) };
    if (route.includes('/git/refs')) return {};
    if (method === 'GET' && route.includes('/pulls?')) return existingPull ? [{ number: 9, html_url: 'https://github.com/krkn-chaos/krkn-operator/pull/9' }] : [];
    if (method === 'POST' && route.endsWith('/pulls')) return { number: 10, html_url: 'https://github.com/krkn-chaos/krkn-operator/pull/10' };
    throw new Error('unexpected API call ' + method + ' ' + route);
  };
  return { api, calls };
}

test('unpublished release automatically opens one metadata PR against its existing release branch', async () => {
  const { api, calls } = fixture();
  const result = await prepareMetadataPr({ api, sourcePullNumber: 681 });
  assert.equal(result.mode, 'metadata');
  const create = calls.find(call => call.method === 'POST' && call.route.endsWith('/pulls'));
  assert.equal(create.body.base, 'release-1.1');
  assert.equal(create.body.head, 'docs/website-release/v1.1.0');
  assert.match(create.body.body, /681/);
  assert.equal(calls.filter(call => call.route.includes('/merges')).length, 0);
});

test('duplicate source notification reuses an open metadata PR', async () => {
  const { api, calls } = fixture({ existingPull: true });
  const result = await prepareMetadataPr({ api, sourcePullNumber: 681 });
  assert.equal(result.pull.number, 9);
  assert.equal(calls.filter(call => call.method === 'POST' && call.route.endsWith('/pulls')).length, 0);
  assert.equal(calls.filter(call => ['POST', 'PATCH', 'PUT'].includes(call.method)).length, 0);
});

test('already published initial release is bootstrapped without writing its Operator tag', async () => {
  const { api, calls } = fixture({ published: true });
  const result = await prepareMetadataPr({ api, sourcePullNumber: 681 });
  assert.equal(result.mode, 'bootstrap');
  assert.equal(result.websiteCommit, pull.merge_commit_sha);
  assert.equal(calls.filter(call => ['POST', 'PATCH', 'PUT'].includes(call.method)).length, 0);
});

test('source automation rejects snapshot-only PRs', async () => {
  const { api } = fixture({ changedPaths: ['content/en/docs/krkn-operator/versions/v1.1.0/_index.md'] });
  await assert.rejects(prepareMetadataPr({ api, sourcePullNumber: 681 }), /authoring/);
});

test('metadata preparation refuses an existing tag without a published release', async () => {
  const { api } = fixture({ tagCreated: true });
  await assert.rejects(prepareMetadataPr({ api, sourcePullNumber: 681 }), /tag already exists/);
});

test('metadata preparation requires reviewed main history and an existing release branch', async () => {
  await assert.rejects(prepareMetadataPr({ api: fixture({ ancestry: 'diverged' }).api, sourcePullNumber: 681 }), /main history/);
  await assert.rejects(prepareMetadataPr({ api: fixture({ missingBranch: true }).api, sourcePullNumber: 681 }), /missing release branch/);
});


test('retry after metadata merge but before tagging creates no new branch or PR', async () => {
  const { api, calls } = fixture({ metadataMerged: true });
  const result = await prepareMetadataPr({ api, sourcePullNumber: 681 });
  assert.equal(result.mode, 'metadata-merged');
  assert.equal(calls.filter(call => ['POST', 'PATCH', 'PUT'].includes(call.method)).length, 0);
});
