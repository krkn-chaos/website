'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const YAML = require('yaml');

const {
  captureSnapshot,
  planSnapshot,
  readSnapshotSource,
  rewriteOperatorMarkdown,
  sha256,
  validateSnapshotRecord,
} = require('../lib/operator-docs-snapshot');
const { readRegistry } = require('../lib/operator-docs');
const { shouldCaptureRelease } = require('../snapshot-operator-docs');

const releaseInputs = {
  tag: 'v1.2.0',
  github_release_id: 120,
  published_at: '2026-10-01T00:00:00Z',
  operator_commit: 'a'.repeat(40),
  website_commit: 'b'.repeat(40),
  helm_chart_version: '1.2.1',
  chart_reference:
    'oci://quay.io/krkn-chaos/charts/krkn-operator:1.2.1',
};

function page(relativePath, content) {
  return { relativePath, bytes: Buffer.from(content) };
}

function fixtureSource() {
  return {
    pages: [
      page(
        '_index.md',
        `---\ntitle: Operator\n---\n# Overview\n<a id="permission-run"></a>\n[Run permission](/docs/krkn-operator/#permission-run)\n`
      ),
      page(
        'installation/_index.md',
        `---\ntitle: Installation\ncustom_js:\n  - /js/krkn-operator-version.js\n---\n**Latest Version:** <code id="krkn-operator-version">loading...</code>\n\n\`\`\`sh\nhelm install krkn-operator chart --version <VERSION>\n\`\`\`\n\n<iframe src="https://www.youtube.com/embed/example" title="Install"></iframe>\n`
      ),
      page(
        'usage/jobs.md',
        `---\ntitle: Jobs\n---\n[This page](/docs/krkn-operator/usage/jobs/?view=all#cancel)\n![Screenshot](/images/krkn-operator/select-target.png)\n\nInline code \`/docs/krkn-operator/\` stays unchanged.\n\n\`\`\`text\n/docs/krkn-operator/ should stay in this code block\n\`\`\`\n`
      ),
      page(
        'feedback/_index.md',
        `---\ntitle: Feedback\ncustom_js: [/js/feedback-form.js]\n---\n<form>mutable form</form>\n`
      ),
      page(
        'releases/_index.md',
        `---\ntitle: Releases\n---\n{{< roadmap >}}\n`
      ),
    ],
    imageFiles: [
      { relativePath: 'select-target.png', bytes: Buffer.from('image bytes') },
    ],
    videoFiles: [
      { relativePath: 'workflow.mp4', bytes: Buffer.from('video bytes') },
    ],
    roadmapBytes: Buffer.from('releases:\n  - version: 1.2.0\n'),
  };
}

function fileText(plan, suffix) {
  const item = plan.files.find((file) => file.path.endsWith(suffix));
  assert.ok(item, `missing planned file ending with ${suffix}`);
  return item.bytes.toString('utf8');
}

function makeGitRepo() {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-git-'));
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
  write('content/en/docs/krkn-operator/_index.md', '---\ntitle: Operator\n---\n# Pinned overview\n');
  write('content/en/docs/krkn-operator/usage/jobs.md', '---\ntitle: Jobs\n---\nPinned jobs content.\n');
  write('static/images/krkn-operator/screen.png', 'pinned image');
  write('static/videos/walkthrough.mp4', 'pinned video');
  write('data/roadmap.yaml', 'releases: []\n');
  write('content/en/docs/krkn-operator/versions/v0.9.0/_index.md', 'Nested old snapshot.\n');
  git(['add', '.']);
  git(['commit', '-q', '-m', 'pinned source']);
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: repoRoot,
    encoding: 'utf8',
  }).trim();
  write('content/en/docs/krkn-operator/_index.md', '---\ntitle: Operator\n---\nDirty working-tree content.\n');
  return { repoRoot, commit };
}

function gitReleaseInputs(websiteCommit) {
  return {
    tag: 'v1.0.0',
    github_release_id: 100,
    published_at: '2026-09-01T00:00:00Z',
    operator_commit: 'a'.repeat(40),
    website_commit: websiteCommit,
    helm_chart_version: '1.0.1',
    chart_reference: 'oci://quay.io/krkn-chaos/charts/krkn-operator:1.0.1',
  };
}

test('snapshot planning rejects prerelease tags even when GitHub might mislabel them', () => {
  assert.throws(
    () => planSnapshot({
      releaseInputs: { ...releaseInputs, tag: 'v1.2.0-rc.1' },
      source: fixtureSource(),
      capturedAt: '2026-10-01T00:00:00Z',
    }),
    /stable Operator release tag/i
  );
});

test('rewrites Operator links and media while preserving code and external URLs', () => {
  const input = [
    '[Overview](/docs/krkn-operator/#permission-run)',
    '[Jobs](/docs/krkn-operator/usage/jobs/?view=all#cancel)',
    '![Screen](/images/krkn-operator/select-target.png)',
    '<a href="/docs/krkn-operator/#permission-run">Run</a>',
    '<source src="/videos/workflow.mp4">',
    '[Other](/docs/krknctl/)',
    '[External](https://example.test/docs/krkn-operator/)',
    'Inline `/docs/krkn-operator/` stays unchanged.',
    '```text',
    '/docs/krkn-operator/ stays inside code',
    '```',
  ].join('\n');
  const result = rewriteOperatorMarkdown(input, 'v1.2.0').body;
  assert.match(
    result,
    /\/docs\/krkn-operator\/versions\/v1\.2\.0\/#permission-run/
  );
  assert.match(
    result,
    /\/docs\/krkn-operator\/versions\/v1\.2\.0\/usage\/jobs\/\?view=all#cancel/
  );
  assert.match(
    result,
    /\/operator-docs\/v1\.2\.0\/images\/krkn-operator\/select-target\.png/
  );
  assert.match(
    result,
    /\/operator-docs\/v1\.2\.0\/videos\/workflow\.mp4/
  );
  assert.match(result, /href="\/docs\/krkn-operator\/versions\/v1\.2\.0\/#permission-run"/);
  assert.match(result, /\/docs\/krknctl\//);
  assert.match(result, /https:\/\/example\.test\/docs\/krkn-operator\//);
  assert.match(result, /Inline `\/docs\/krkn-operator\/` stays unchanged/);
  assert.match(result, /\/docs\/krkn-operator\/ stays inside code/);
});

test('captured Markdown has one final newline after trailing blank lines are normalized', () => {
  const source = fixtureSource();
  source.pages = source.pages.map((item) =>
    item.relativePath === 'releases/_index.md'
      ? page('releases/_index.md', '---\ntitle: Releases\n---\n{{< roadmap >}}\n\n\n')
      : item
  );
  const plan = planSnapshot({ releaseInputs, source, capturedAt: '2026-10-01T00:00:00Z' });
  const archivedPage = fileText(plan, '/releases/_index.md');

  assert.match(archivedPage, /\n$/);
  assert.doesNotMatch(archivedPage, /\n{2,}$/);
});

test('captured roadmap trims trailing blank lines while preserving the source hash', () => {
  const source = fixtureSource();
  const rawRoadmap = Buffer.from('releases:\n  - version: 1.2.0\n\n\n');
  source.roadmapBytes = rawRoadmap;
  const plan = planSnapshot({ releaseInputs, source, capturedAt: '2026-10-01T00:00:00Z' });
  const outputPath = 'data/operator_docs/releases/v1.2.0/roadmap.yaml';
  const archivedRoadmap = plan.files.find((file) => file.path === outputPath).bytes;

  assert.equal(archivedRoadmap.toString('utf8'), 'releases:\n  - version: 1.2.0\n');
  assert.equal(plan.integrity.source_hashes['data/roadmap.yaml'], sha256(rawRoadmap));
  assert.equal(plan.integrity.output_hashes[outputPath], sha256(archivedRoadmap));
});

test('pins installation docs to the captured chart and removes mutable script', () => {
  const plan = planSnapshot({
    repoRoot: '/unused-for-in-memory-plan',
    releaseInputs,
    source: fixtureSource(),
    capturedAt: '2026-10-08T12:00:00Z',
  });
  const markdown = fileText(plan, '/installation/_index.md');
  assert.match(markdown, /Helm chart version for this release/);
  assert.match(markdown, /<code[^>]*>1\.2\.1<\/code>/);
  assert.match(markdown, /--version 1\.2\.1/);
  assert.doesNotMatch(markdown, /<VERSION>|loading\.\.\./);
  assert.doesNotMatch(markdown, /krkn-operator-version\.js/);
  assert.match(markdown, /may show an earlier interface/);
});

test('rejects uncaptured installation scripts after removing the known live version script', () => {
  const source = fixtureSource();
  source.pages[1] = page(
    'installation/_index.md',
    `---\ntitle: Installation\ncustom_js:\n  - /js/krkn-operator-version.js\n  - /js/live-installation.js\n---\nInstall instructions.\n`
  );

  assert.throws(
    () => planSnapshot({
      repoRoot: '/unused-for-in-memory-plan',
      releaseInputs,
      source,
      capturedAt: '2026-10-08T12:00:00Z',
    }),
    /unsupported mutable custom_js dependency/i
  );
});

test('standalone snapshot capture rejects bootstrap overrides for a new tag after adoption', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-adoption-'));
  const adoptionBoundary = '2026-10-08T10:23:14Z';
  const registeredBootstrap = {
    ...releaseInputs,
    tag: 'v1.1.0',
    github_release_id: 110,
    published_at: adoptionBoundary,
    helm_chart_version: '1.1.0-rc7',
    chart_reference: 'oci://quay.io/krkn-chaos/charts/krkn-operator:1.1.0-rc7',
    captured_at: '2026-10-08T12:00:00Z',
    snapshot_record: 'operator-docs/snapshots/v1.1.0.json',
  };
  const registry = {
    schema_version: 1,
    adoption_boundary_published_at: adoptionBoundary,
    releases: [registeredBootstrap],
  };
  fs.mkdirSync(path.join(repoRoot, 'data'), { recursive: true });
  fs.writeFileSync(
    path.join(repoRoot, 'data/operator_doc_versions.yaml'),
    YAML.stringify(registry)
  );

  try {
    assert.throws(
      () => shouldCaptureRelease(repoRoot, {
        ...releaseInputs,
        tag: 'v1.2.1',
        published_at: '2026-10-09T00:00:00Z',
        helm_chart_version: '1.2.1',
      }, {
        website_commit: 'c'.repeat(40),
        helm_chart_version: '1.2.1',
      }),
      /bootstrap inputs are only accepted before the adoption boundary/i
    );
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('validates links to generated Markdown heading anchors in the captured overview', () => {
  const source = fixtureSource();
  source.pages[0] = page(
    '_index.md',
    `---\ntitle: Operator\n---\n# Overview\n\n## Permission Model\n`
  );
  source.pages.push(
    page(
      'administration/_index.md',
      `---\ntitle: Administration\n---\n# Administration <a href="/docs/krkn-operator/#permission-model">Admin</a>\n`
    )
  );

  const plan = planSnapshot({
    repoRoot: '/unused-for-in-memory-plan',
    releaseInputs,
    source,
    capturedAt: '2026-10-08T12:00:00Z',
  });
  assert.match(
    fileText(plan, '/administration/_index.md'),
    /href="\/docs\/krkn-operator\/versions\/v1\.2\.0\/#permission-model"/
  );

  source.pages[0] = page('_index.md', '---\ntitle: Operator\n---\n# Overview\n');
  assert.throws(
    () => planSnapshot({
      repoRoot: '/unused-for-in-memory-plan',
      releaseInputs,
      source,
      capturedAt: '2026-10-08T12:00:00Z',
    }),
    /fragment #permission-model is missing from the captured overview/
  );
});

test('assigns stable page keys without excluding the current snapshot from search', () => {
  const plan = planSnapshot({
    repoRoot: '/unused-for-in-memory-plan',
    releaseInputs,
    source: fixtureSource(),
    capturedAt: '2026-10-08T12:00:00Z',
  });
  const overview = fileText(plan, '/versions/v1.2.0/_index.md');
  const jobs = fileText(plan, '/versions/v1.2.0/usage/jobs.md');
  assert.match(overview, /operator_docs_page_key: ""/);
  assert.match(jobs, /operator_docs_page_key: usage\/jobs/);
  assert.doesNotMatch(jobs, /exclude_search:/);
});

test('replaces archived feedback with links to current help paths', () => {
  const plan = planSnapshot({
    repoRoot: '/unused-for-in-memory-plan',
    releaseInputs,
    source: fixtureSource(),
    capturedAt: '2026-10-08T12:00:00Z',
  });
  const feedback = fileText(plan, '/feedback/_index.md');
  assert.doesNotMatch(feedback, /mutable form|feedback-form\.js/);
  assert.match(feedback, /\/community\/operator-feedback\//);
  assert.match(feedback, /github\.com\/krkn-chaos\/krkn-operator\/issues/);
});

test('captures mutable roadmap and asset dependencies with hashes and inventory', () => {
  const plan = planSnapshot({
    repoRoot: '/unused-for-in-memory-plan',
    releaseInputs,
    source: fixtureSource(),
    capturedAt: '2026-10-08T12:00:00Z',
  });
  assert.equal(
    fileText(plan, '/operator-docs/v1.2.0/images/krkn-operator/select-target.png'),
    'image bytes'
  );
  assert.equal(
    fileText(plan, '/operator-docs/v1.2.0/videos/workflow.mp4'),
    'video bytes'
  );
  assert.match(fileText(plan, 'data/operator_docs/releases/v1.2.0/roadmap.yaml'), /version: 1\.2\.0/);
  assert.ok(plan.integrity.source_hashes['content/en/docs/krkn-operator/_index.md']);
  assert.ok(plan.integrity.output_hashes['content/en/docs/krkn-operator/versions/v1.2.0/_index.md']);
  assert.ok(plan.integrity.expected_output_inventory.includes('static/operator-docs/v1.2.0/videos/workflow.mp4'));
});

test('rejects unknown shortcodes and unsupported URL overrides', () => {
  const source = fixtureSource();
  source.pages[2] = page('usage/jobs.md', '---\ntitle: Jobs\n---\n{{< custom-data >}}\n');
  assert.throws(
    () =>
      planSnapshot({
        repoRoot: '/unused-for-in-memory-plan',
        releaseInputs,
        source,
        capturedAt: '2026-10-08T12:00:00Z',
      }),
    /unknown.*shortcode.*custom-data/i
  );

  const withOverride = fixtureSource();
  withOverride.pages[2] = page('usage/jobs.md', '---\ntitle: Jobs\nurl: /custom/\n---\n');
  assert.throws(
    () =>
      planSnapshot({
        repoRoot: '/unused-for-in-memory-plan',
        releaseInputs,
        source: withOverride,
        capturedAt: '2026-10-08T12:00:00Z',
      }),
    /url override/i
  );
});

test('rejects duplicate page identities and missing mutable dependencies', () => {
  const duplicate = fixtureSource();
  duplicate.pages[2] = page(
    'usage/jobs.md',
    '---\ntitle: Jobs\noperator_docs_page_key: installation\n---\n'
  );
  assert.throws(
    () =>
      planSnapshot({
        repoRoot: '/unused-for-in-memory-plan',
        releaseInputs,
        source: duplicate,
        capturedAt: '2026-10-08T12:00:00Z',
      }),
    /duplicate.*page key/i
  );

  const missingRoadmap = fixtureSource();
  missingRoadmap.roadmapBytes = null;
  assert.throws(
    () =>
      planSnapshot({
        repoRoot: '/unused-for-in-memory-plan',
        releaseInputs,
        source: missingRoadmap,
        capturedAt: '2026-10-08T12:00:00Z',
      }),
    /roadmap.*missing/i
  );
});

test('reads snapshot Markdown and assets from the pinned Git commit, not dirty files', () => {
  const { repoRoot, commit } = makeGitRepo();
  const source = readSnapshotSource(repoRoot, commit);
  const overview = source.pages.find((item) => item.relativePath === '_index.md');
  assert.match(overview.bytes.toString('utf8'), /Pinned overview/);
  assert.doesNotMatch(overview.bytes.toString('utf8'), /Dirty working-tree/);
  assert.equal(source.pages.some((item) => item.relativePath.startsWith('versions/')), false);
  assert.deepEqual(source.imageFiles.map((item) => item.relativePath), ['screen.png']);
  assert.deepEqual(source.videoFiles.map((item) => item.relativePath), ['walkthrough.mp4']);
  assert.equal(source.roadmapBytes.toString('utf8'), 'releases: []\n');
});

test('captures an immutable release once and treats an identical retry as a no-op', () => {
  const { repoRoot, commit } = makeGitRepo();
  const inputs = gitReleaseInputs(commit);
  const now = () => '2026-10-08T12:00:00Z';
  const first = captureSnapshot({
    repoRoot,
    releaseInputs: inputs,
    adoptionBoundary: inputs.published_at,
    now,
  });
  assert.equal(first.status, 'captured');
  assert.equal(readRegistry(repoRoot).releases.length, 1);
  assert.equal(readRegistry(repoRoot).adoption_boundary_published_at, inputs.published_at);
  const second = captureSnapshot({
    repoRoot,
    releaseInputs: {
      ...inputs,
      chart_reference: 'oci://quay.io/krkn-chaos/charts/krkn-operator',
    },
    now,
  });
  assert.equal(second.status, 'unchanged');
  assert.equal(readRegistry(repoRoot).releases.length, 1);
  assert.throws(
    () => captureSnapshot({ repoRoot, releaseInputs: { ...inputs, website_commit: 'c'.repeat(40) }, now }),
    /different provenance/i
  );
});

test('detects changed snapshot output bytes using the recorded hash', () => {
  const { repoRoot, commit } = makeGitRepo();
  const result = captureSnapshot({
    repoRoot,
    releaseInputs: gitReleaseInputs(commit),
    now: () => '2026-10-08T12:00:00Z',
  });
  const outputPath = path.join(repoRoot, 'content/en/docs/krkn-operator/versions/v1.0.0/usage/jobs.md');
  fs.appendFileSync(outputPath, 'changed');
  assert.throws(() => validateSnapshotRecord(repoRoot, result.release), /hash mismatch/i);
});

test('requires a non-empty source hash inventory', () => {
  const { repoRoot, commit } = makeGitRepo();
  const result = captureSnapshot({
    repoRoot,
    releaseInputs: gitReleaseInputs(commit),
    now: () => '2026-10-08T12:00:00Z',
  });
  const recordPath = path.join(repoRoot, result.release.snapshot_record);
  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));

  delete record.source_hashes;
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  assert.throws(() => validateSnapshotRecord(repoRoot, result.release), /source hash inventory/i);

  record.source_hashes = {};
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  assert.throws(() => validateSnapshotRecord(repoRoot, result.release), /source hash inventory/i);
});

test('accepts reviewed corrections only with a timestamp, reason, and inventoried paths', () => {
  const { repoRoot, commit } = makeGitRepo();
  const result = captureSnapshot({
    repoRoot,
    releaseInputs: gitReleaseInputs(commit),
    now: () => '2026-10-08T12:00:00Z',
  });
  const recordPath = path.join(repoRoot, result.release.snapshot_record);
  const record = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  const affectedPath = 'content/en/docs/krkn-operator/versions/v1.0.0/usage/jobs.md';
  record.corrections = [{
    corrected_at: '2026-10-08T12:30:00Z',
    affected_paths: [affectedPath],
    reason: 'Clarified the release-specific command after chart verification.',
  }];
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  assert.equal(validateSnapshotRecord(repoRoot, result.release).corrections.length, 1);

  record.corrections[0].affected_paths = ['content/en/docs/krkn-operator/versions/v1.0.0/missing.md'];
  fs.writeFileSync(recordPath, JSON.stringify(record, null, 2));
  assert.throws(() => validateSnapshotRecord(repoRoot, result.release), /correction path is not in snapshot inventory/i);
});

test('detects unregistered files inside a release-owned snapshot tree', () => {
  const { repoRoot, commit } = makeGitRepo();
  const result = captureSnapshot({
    repoRoot,
    releaseInputs: gitReleaseInputs(commit),
    now: () => '2026-10-08T12:00:00Z',
  });
  fs.writeFileSync(
    path.join(repoRoot, 'content/en/docs/krkn-operator/versions/v1.0.0/unexpected.md'),
    'unregistered output'
  );
  assert.throws(() => validateSnapshotRecord(repoRoot, result.release), /unexpected snapshot output/i);
});
