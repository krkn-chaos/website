'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const {
  resolveReleaseInputs,
  resolveReleaseInputsWithRetry,
} = require('../lib/operator-release-inputs');

const operatorCommit = 'a'.repeat(40);
const websiteCommit = 'b'.repeat(40);
const websiteHead = 'c'.repeat(40);
const chartReference =
  'oci://quay.io/krkn-chaos/charts/krkn-operator';

function clientWith(overrides = {}) {
  const calls = [];
  const client = {
    async getReleaseByTag(owner, repository, tag) {
      calls.push(['release', owner, repository, tag]);
      return {
        id: 120,
        tag_name: tag,
        draft: false,
        prerelease: false,
        published_at: '2026-10-01T00:00:00Z',
      };
    },
    async resolveTagCommit(owner, repository, tag) {
      calls.push(['tag', owner, repository, tag]);
      return operatorCommit;
    },
    async getCommit(owner, repository, commit) {
      calls.push(['commit', owner, repository, commit]);
      return { sha: commit };
    },
    async getDefaultBranchHead(owner, repository) {
      calls.push(['head', owner, repository]);
      return websiteHead;
    },
    async compareCommits(owner, repository, base, head) {
      calls.push(['compare', owner, repository, base, head]);
      return { status: 'ahead' };
    },
    async getPublishedChart(reference, version) {
      calls.push(['chart', reference, version]);
      return {
        name: 'krkn-operator',
        version,
        appVersion: 'v1.4.0',
      };
    },
  };
  return { client: { ...client, ...overrides }, calls };
}

test('pins docs to Website main automatically when resolving the stable Operator release', async () => {
  const { client, calls } = clientWith();
  const result = await resolveReleaseInputs({
    githubClient: client,
    operatorTag: 'v1.4.0',
  });

  assert.deepEqual(result, {
    tag: 'v1.4.0',
    github_release_id: 120,
    published_at: '2026-10-01T00:00:00Z',
    operator_commit: operatorCommit,
    website_commit: websiteHead,
    helm_chart_version: '1.4.0',
    chart_reference: chartReference,
  });
  assert.ok(calls.some((call) => call[0] === 'head' && call[1] === 'krkn-chaos' && call[2] === 'website'));
  assert.ok(calls.some((call) => call[0] === 'commit' && call[3] === websiteHead));
  assert.ok(calls.some((call) => call[0] === 'chart' && call[1] === chartReference && call[2] === '1.4.0'));
});

test('uses an existing registry pin on duplicate release notifications', async () => {
  const compares = [];
  const { client } = clientWith({
    getCommit: async (_owner, _repository, commit) => ({ sha: commit }),
    compareCommits: async (_owner, _repository, base, head) => {
      compares.push([base, head]);
      return { status: 'ahead' };
    },
  });
  const result = await resolveReleaseInputs({
    githubClient: client,
    operatorTag: 'v1.4.0',
    websiteCommit,
  });
  assert.equal(result.website_commit, websiteCommit);
  assert.deepEqual(compares, [[websiteCommit, websiteHead]]);
});

test('rejects an RC tag even when GitHub mislabels it as a stable release', async () => {
  const { client, calls } = clientWith();
  await assert.rejects(
    resolveReleaseInputs({ githubClient: client, operatorTag: 'v1.1.0-rc7' }),
    /stable Operator release tag/i
  );
  assert.equal(calls.some((call) => call[0] === 'release'), false);
});

test('rejects a stable-shaped tag when GitHub marks its release as prerelease', async () => {
  const { client } = clientWith({
    getReleaseByTag: async (_owner, _repository, tag) => ({
      id: 120,
      tag_name: tag,
      draft: false,
      prerelease: true,
      published_at: '2026-10-01T00:00:00Z',
    }),
  });
  await assert.rejects(
    resolveReleaseInputs({ githubClient: client, operatorTag: 'v1.4.0' }),
    /GitHub marks .* as a prerelease/i
  );
});

test('rejects a missing, draft, or mismatched release', async () => {
  const missing = clientWith({ getReleaseByTag: async () => null }).client;
  await assert.rejects(
    resolveReleaseInputs({ githubClient: missing, operatorTag: 'v1.4.0' }),
    /published release.*not found/i
  );

  const draft = clientWith({
    getReleaseByTag: async () => ({
      id: 120,
      tag_name: 'v1.4.0',
      draft: true,
      published_at: '2026-10-01T00:00:00Z',
    }),
  }).client;
  await assert.rejects(
    resolveReleaseInputs({ githubClient: draft, operatorTag: 'v1.4.0' }),
    /draft/i
  );

  const wrongTag = clientWith({
    getReleaseByTag: async () => ({
      id: 120,
      tag_name: 'v1.3.0',
      draft: false,
      prerelease: false,
      published_at: '2026-10-01T00:00:00Z',
    }),
  }).client;
  await assert.rejects(
    resolveReleaseInputs({ githubClient: wrongTag, operatorTag: 'v1.4.0' }),
    /tag does not match/i
  );
});

test('rejects a website source commit outside reviewed main history or a mismatched chart', async () => {
  const unrelated = clientWith({ compareCommits: async () => ({ status: 'diverged' }) }).client;
  await assert.rejects(
    resolveReleaseInputs({ githubClient: unrelated, operatorTag: 'v1.4.0' }),
    /default-branch history/i
  );

  const wrongChart = clientWith({
    getPublishedChart: async (_reference, version) => ({
      name: 'krkn-operator',
      version,
      appVersion: 'v1.3.0',
    }),
  }).client;
  await assert.rejects(
    resolveReleaseInputs({ githubClient: wrongChart, operatorTag: 'v1.4.0' }),
    /chart.*operator tag/i
  );
});

test('retries temporarily missing published releases within the configured window', async () => {
  let attempts = 0;
  const { client } = clientWith({
    async getReleaseByTag(_owner, _repository, tag) {
      attempts += 1;
      if (attempts === 1) return null;
      return {
        id: 120,
        tag_name: tag,
        draft: false,
        prerelease: false,
        published_at: '2026-10-01T00:00:00Z',
      };
    },
  });
  const result = await resolveReleaseInputsWithRetry({
    githubClient: client,
    operatorTag: 'v1.4.0',
    timeoutMs: 100,
    retryIntervalMs: 1,
    sleep: async () => {},
  });
  assert.equal(result.tag, 'v1.4.0');
  assert.equal(attempts, 2);
});

test('retries a chart that is not visible immediately after release publication', async () => {
  let chartAttempts = 0;
  const { client } = clientWith({
    async getPublishedChart(_reference, version) {
      chartAttempts += 1;
      if (chartAttempts === 1) return null;
      return { name: 'krkn-operator', version, appVersion: 'v1.4.0' };
    },
  });
  const result = await resolveReleaseInputsWithRetry({
    githubClient: client,
    operatorTag: 'v1.4.0',
    timeoutMs: 100,
    retryIntervalMs: 1,
    sleep: async () => {},
  });
  assert.equal(result.helm_chart_version, '1.4.0');
  assert.equal(chartAttempts, 2);
});

test('does not retry a published chart that maps to a different Operator tag', async () => {
  let chartAttempts = 0;
  const { client } = clientWith({
    async getPublishedChart(_reference, version) {
      chartAttempts += 1;
      return { name: 'krkn-operator', version, appVersion: 'v1.3.0' };
    },
  });
  await assert.rejects(
    resolveReleaseInputsWithRetry({
      githubClient: client,
      operatorTag: 'v1.4.0',
      timeoutMs: 100,
      retryIntervalMs: 1,
      sleep: async () => {},
    }),
    /chart.*operator tag/i
  );
  assert.equal(chartAttempts, 1);
});
