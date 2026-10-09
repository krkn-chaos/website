'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const YAML = require('yaml');
const {
  assertBootstrapInputsAllowed,
  assertSameReleaseProvenance,
  buildPullRequestBody,
  isBeforeAdoptionBoundary,
  mergeMainWithBotIdentity,
  prepareReleaseBranch,
  assertTrustedReleaseBranch,
  stageSnapshotChanges,
  releaseBranchName,
  sameReleaseProvenance,
  selectExistingPullRequest,
  shouldIgnoreReleaseAtAdoptionBoundary,
} = require('../lib/operator-docs-automation');

const release = {
  tag: 'v1.0.10',
  github_release_id: 110,
  published_at: '2026-10-08T10:23:14Z',
  operator_commit: 'a'.repeat(40),
  website_commit: 'b'.repeat(40),
  helm_chart_version: '1.0.10',
  chart_reference: 'oci://quay.io/krkn-chaos/charts/krkn-operator',
  snapshot_record: 'operator-docs/snapshots/v1.0.10.json',
};

test('release preparation queues every release instead of replacing pending runs', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/operator-docs-release.yml');
  const workflow = YAML.parse(fs.readFileSync(workflowPath, 'utf8'));

  assert.equal(workflow.concurrency.group, 'operator-docs-release-preparation');
  assert.equal(workflow.concurrency.queue, 'max');
  assert.equal(workflow.concurrency['cancel-in-progress'], false);
});

test('manual bootstrap workflow accepts and forwards the pinned website commit and chart version', () => {
  const workflowPath = path.join(__dirname, '../../.github/workflows/operator-docs-release.yml');
  const workflow = YAML.parse(fs.readFileSync(workflowPath, 'utf8'));
  const inputs = workflow.on.workflow_dispatch.inputs;
  const prepare = workflow.jobs.prepare.steps.find((step) => step.name === 'Resolve release inputs, validate, and prepare PR');

  assert.ok(inputs.bootstrap_website_commit, 'manual workflow must expose the pinned Website commit');
  assert.ok(inputs.bootstrap_chart_version, 'manual workflow must expose the chart version');
  assert.equal(inputs.bootstrap_website_commit.required, false);
  assert.equal(inputs.bootstrap_chart_version.required, false);
  assert.match(prepare.env.BOOTSTRAP_WEBSITE_COMMIT, /inputs\.bootstrap_website_commit/);
  assert.match(prepare.env.BOOTSTRAP_CHART_VERSION, /inputs\.bootstrap_chart_version/);
  assert.match(prepare.run, /--bootstrap-website-commit/);
  assert.match(prepare.run, /--bootstrap-chart-version/);
});

test('duplicate notifications compare equal only when complete release provenance matches', () => {
  assert.equal(sameReleaseProvenance(release, { ...release }), true);
  assert.equal(sameReleaseProvenance(release, { ...release, website_commit: 'c'.repeat(40) }), false);
  assert.doesNotThrow(() => assertSameReleaseProvenance(release, { ...release }));
  assert.throws(
    () => assertSameReleaseProvenance(release, { ...release, operator_commit: 'd'.repeat(40) }),
    /different provenance/
  );
});

test('registry seeds the current 1.0.0 docs and records the inclusive stable adoption cutoff', () => {
  const registry = YAML.parse(fs.readFileSync(
    path.join(__dirname, '../../data/operator_doc_versions.yaml'),
    'utf8'
  ));
  assert.equal(registry.schema_version, 1);
  assert.equal(registry.adoption_boundary_published_at, '2026-09-26T13:03:34Z');
  assert.deepEqual(registry.releases.map((entry) => entry.tag), ['v1.0.0']);
  assert.equal(registry.releases[0].github_release_id, 371909258);
  assert.equal(registry.releases[0].published_at, '2026-08-17T19:37:57Z');
  assert.equal(registry.releases[0].website_commit, '7c35229ddbec37d65ef6a9c53945443b6fa8bf6e');
});

test('the adoption boundary skips releases published at or before the cutoff', () => {
  const boundary = '2026-10-08T10:23:14Z';
  assert.equal(isBeforeAdoptionBoundary({ ...release, published_at: '2026-10-08T10:23:13Z' }, boundary), true);
  assert.equal(isBeforeAdoptionBoundary(release, boundary), true);
  assert.equal(isBeforeAdoptionBoundary({ ...release, published_at: '2026-10-08T10:23:15Z' }, boundary), false);
  assert.throws(() => isBeforeAdoptionBoundary(release, ''), /boundary/);
});

test('an already registered baseline before the cutoff remains an idempotent capture', () => {
  const baseline = {
    ...release,
    tag: 'v1.0.0',
    github_release_id: 371909258,
    published_at: '2026-08-17T19:37:57Z',
    operator_commit: 'de12bfea87fcb5927ce6945e5fbe6e4772c31a5e',
    website_commit: '7c35229ddbec37d65ef6a9c53945443b6fa8bf6e',
    helm_chart_version: '1.0.0',
  };
  const registry = {
    adoption_boundary_published_at: '2026-09-26T13:03:34Z',
    releases: [baseline],
  };
  assert.equal(shouldIgnoreReleaseAtAdoptionBoundary(registry, baseline), false);
  assert.throws(
    () => shouldIgnoreReleaseAtAdoptionBoundary(registry, {
      ...baseline,
      website_commit: 'c'.repeat(40),
    }),
    /different provenance/
  );
});

test('bootstrap inputs stop after adoption except for an identical retry of the registered bootstrap', () => {
  const bootstrapInputs = {
    website_commit: release.website_commit,
    helm_chart_version: release.helm_chart_version,
  };
  assert.doesNotThrow(() => assertBootstrapInputsAllowed({ releases: [] }, release.tag, bootstrapInputs));

  const adoptedRegistry = {
    adoption_boundary_published_at: release.published_at,
    releases: [{ ...release }],
  };
  assert.doesNotThrow(() => assertBootstrapInputsAllowed(adoptedRegistry, release.tag, bootstrapInputs));
  assert.throws(
    () => assertBootstrapInputsAllowed(adoptedRegistry, 'v1.2.0', bootstrapInputs),
    /bootstrap inputs are only accepted before the adoption boundary/i
  );
  assert.throws(
    () => assertBootstrapInputsAllowed(adoptedRegistry, release.tag, {
      ...bootstrapInputs,
      website_commit: 'c'.repeat(40),
    }),
    /do not match the registered bootstrap/i
  );
});

test('bootstrap can register the first release after the adoption cutoff but cannot introduce another release', () => {
  const registry = {
    adoption_boundary_published_at: release.published_at,
    releases: [{
      ...release,
      tag: 'v1.0.0',
      github_release_id: 100,
      published_at: '2026-08-17T19:37:57Z',
    }],
  };
  const laterRelease = {
    ...release,
    tag: 'v1.1.0',
    published_at: '2026-10-09T17:19:38Z',
  };

  assert.equal(shouldIgnoreReleaseAtAdoptionBoundary(registry, laterRelease, {
    website_commit: 'c'.repeat(40),
    helm_chart_version: '1.1.0',
  }), false);

  const registeredBootstrap = {
    ...laterRelease,
    website_commit: 'c'.repeat(40),
    helm_chart_version: '1.1.0',
  };
  assert.throws(
    () => shouldIgnoreReleaseAtAdoptionBoundary({
      ...registry,
      releases: [...registry.releases, registeredBootstrap],
    }, {
      ...laterRelease,
      tag: 'v1.2.0',
      published_at: '2026-11-09T00:00:00Z',
    }, {
      website_commit: 'c'.repeat(40),
      helm_chart_version: '1.2.0',
    }),
    /bootstrap inputs are only accepted before the adoption boundary/i
  );
});

test('merging a refreshed main branch has bot identity configured before a merge commit is created', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-merge-'));
  const git = (args) => execFileSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  const write = (name, contents) => fs.writeFileSync(path.join(repoRoot, name), contents);

  try {
    git(['init', '-q', '--initial-branch=main']);
    git(['config', 'user.name', 'Fixture author']);
    git(['config', 'user.email', 'fixture@example.invalid']);
    write('base.txt', 'base\n');
    git(['add', '.']);
    git(['commit', '-q', '-m', 'base']);
    git(['checkout', '-q', '-b', 'release']);
    write('release.txt', 'release\n');
    git(['add', '.']);
    git(['commit', '-q', '-m', 'release change']);
    git(['update-ref', 'refs/remotes/origin/release', 'release']);
    git(['checkout', '-q', 'main']);
    write('main.txt', 'main\n');
    git(['add', '.']);
    git(['commit', '-q', '-m', 'main change']);
    git(['update-ref', 'refs/remotes/origin/main', 'main']);
    git(['checkout', '-q', 'release']);
    git(['config', '--unset', 'user.name']);
    git(['config', '--unset', 'user.email']);

    const runGit = (root, args) => {
      if (args[0] === 'fetch') return '';
      return execFileSync('git', args, {
        cwd: root,
        encoding: 'utf8',
        env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
      }).trim();
    };
    prepareReleaseBranch(repoRoot, 'release', runGit, () => true);

    const parents = git(['rev-list', '--parents', '-n', '1', 'HEAD']).split(' ');
    assert.equal(parents.length, 3, 'refresh should create a two-parent merge commit');
    assert.equal(git(['show', '-s', '--format=%an <%ae>', 'HEAD']), 'github-actions[bot] <41898282+github-actions[bot]@users.noreply.github.com>');
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});


test('release branch validation blocks unreviewed executable changes before checks run', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-trust-'));
  const git = (args) => execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  const write = (name, value) => { const target = path.join(repoRoot, name); fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, value); };
  const runGit = (root, args) => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  try {
    git(['init', '-q', '--initial-branch=main']); git(['config','user.name','Test']); git(['config','user.email','test@example.invalid']);
    write('README.md','base\n'); git(['add','.']); git(['commit','-qm','base']); git(['update-ref','refs/remotes/origin/main','HEAD']);
    git(['checkout','-qb','release']); write('content/en/docs/krkn-operator/versions/v1.2.0/_index.md','safe\n'); git(['add','.']); git(['commit','-qm','snapshot']);
    assert.equal(assertTrustedReleaseBranch(repoRoot,'v1.2.0',runGit),true);
    write('scripts/steal-token.js','process.env.GITHUB_TOKEN\n'); git(['add','.']); git(['commit','-qm','untrusted code']);
    assert.throws(()=>assertTrustedReleaseBranch(repoRoot,'v1.2.0',runGit),/untrusted changes.*scripts\/steal-token.js/);
    git(['checkout','-q','HEAD~1']); git(['checkout','-qb','symlink-check']);
    fs.rmSync(path.join(repoRoot,'content/en/docs/krkn-operator/versions/v1.2.0/_index.md'));
    fs.symlinkSync('../../../../../../.git/config',path.join(repoRoot,'content/en/docs/krkn-operator/versions/v1.2.0/_index.md'));
    git(['add','-A']); git(['commit','-qm','unsafe symlink']);
    assert.throws(()=>assertTrustedReleaseBranch(repoRoot,'v1.2.0',runGit),/untrusted symlinks/);
  } finally { fs.rmSync(repoRoot,{recursive:true,force:true}); }
});

test('snapshot staging ignores generated search-index edits and stages only release-owned files', () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'operator-docs-stage-'));
  const runGit = (root, args) => execFileSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  const write = (relativePath, contents) => {
    const destination = path.join(repoRoot, relativePath);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, contents);
  };

  try {
    runGit(repoRoot, ['init', '-q', '--initial-branch=main']);
    runGit(repoRoot, ['config', 'user.name', 'Fixture author']);
    runGit(repoRoot, ['config', 'user.email', 'fixture@example.invalid']);
    write('static/search-index.json', '{"base":true}\n');
    runGit(repoRoot, ['add', '.']);
    runGit(repoRoot, ['commit', '-q', '-m', 'base']);

    write('static/search-index.json', '{"generated":true}\n');
    assert.equal(stageSnapshotChanges(repoRoot, 'v1.2.0', runGit), false);

    const releasePage = 'content/en/docs/krkn-operator/versions/v1.2.0/_index.md';
    write(releasePage, '---\ntitle: Operator\n---\n');
    assert.equal(stageSnapshotChanges(repoRoot, 'v1.2.0', runGit), true);
    assert.deepEqual(runGit(repoRoot, ['diff', '--cached', '--name-only']).split('\n'), [releasePage]);
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true });
  }
});

test('release branch names are deterministic and reject unsafe tags', () => {
  assert.equal(releaseBranchName(release.tag), 'docs/operator-release/v1.0.10');
  assert.throws(() => releaseBranchName('../main'), /unsafe/);
  assert.throws(() => releaseBranchName('v1.1.0-rc7'), /unsafe/);
});

test('duplicate PR lookup reuses the existing open PR for the deterministic branch', () => {
  const closed = { number: 1, state: 'closed', head: { ref: 'docs/operator-release/v1.0.10' }, updated_at: '2026-10-08T12:00:00Z' };
  const open = { number: 2, state: 'open', head: { ref: 'docs/operator-release/v1.0.10' }, updated_at: '2026-10-08T11:00:00Z' };
  assert.equal(selectExistingPullRequest([closed, open], releaseBranchName(release.tag)), open);
  assert.equal(selectExistingPullRequest([], releaseBranchName(release.tag)), null);
  assert.throws(() => selectExistingPullRequest([open, { ...open, number: 3 }], releaseBranchName(release.tag)), /multiple open/);
});

test('PR description carries pinned provenance, transformations, inventory, and preview expectations', () => {
  const body = buildPullRequestBody(release, {
    external_video_dependencies: ['https://youtu.be/example'],
    expected_output_inventory: [
      'content/en/docs/krkn-operator/versions/v1.0.10/_index.md',
      'content/en/docs/krkn-operator/versions/v1.0.10/usage/jobs.md',
      'static/operator-docs/v1.0.10/images/krkn-operator/example.png',
    ],
  });
  assert.match(body, /\[v1\.0\.10\]/);
  assert.match(body, /website documentation commit/);
  assert.match(body, /usage\/jobs\.md/);
  assert.match(body, /pinned release tree/);
  assert.match(body, /https:\/\/youtu\.be\/example/);
  assert.match(body, /auto-merge is disabled/);
});
