#!/usr/bin/env node
'use strict';

const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {
  captureSnapshot,
  readRegistry,
  resolveReleaseInputsWithRetry,
  validateSnapshots,
} = require('./lib/operator-docs');
const { createGithubClient } = require('./lib/operator-github-client');
const {
  assertSameReleaseProvenance,
  assertTrustedReleaseBranch,
  buildPullRequestBody,
  prepareReleaseBranch,
  releaseBranchName,
  selectExistingPullRequest,
  stageSnapshotChanges,
  shouldIgnoreReleaseAtAdoptionBoundary,
} = require('./lib/operator-docs-automation');

const OWNER = 'krkn-chaos';
const REPOSITORY = 'website';
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPOSITORY}`;

function parseArgs(argv) {
  const options = { repoRoot: path.resolve(__dirname, '..') };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--tag') options.tag = argv[++index];
    else if (argument === '--repo-root') options.repoRoot = path.resolve(argv[++index]);
    else if (argument === '--bootstrap-website-commit') options.websiteCommit = argv[++index];
    else if (argument === '--bootstrap-chart-version') options.chartVersion = argv[++index];
    else throw new Error(`unknown argument: ${argument}`);
  }
  if (!options.tag) throw new Error('usage: operator-docs-release-pr.js --tag <published-tag>');
  if (Boolean(options.websiteCommit) !== Boolean(options.chartVersion)) {
    throw new Error('bootstrap requires both --bootstrap-website-commit and --bootstrap-chart-version');
  }
  return options;
}

function git(repoRoot, args, options = {}) {
  try {
    return execFileSync('git', args, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: options.inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
    }).trim();
  } catch (error) {
    if (options.allowFailure) return null;
    const detail = error.stderr?.toString().trim() || error.message;
    throw new Error(`git ${args[0]} failed: ${detail}`);
  }
}

function remoteBranchExists(repoRoot, branch) {
  try {
    const output = execFileSync('git', ['ls-remote', '--exit-code', 'origin', `refs/heads/${branch}`], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return Boolean(output.trim());
  } catch (error) {
    if (error.status === 2) return false;
    throw new Error(`unable to inspect remote release branch ${branch}: ${error.stderr?.toString().trim() || error.message}`);
  }
}

async function githubRequest(token, method, endpoint, body) {
  const response = await fetch(`${API_ROOT}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      'User-Agent': 'krkn-operator-docs-versioning',
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (response.status === 204) return null;
  const text = await response.text();
  let payload;
  try { payload = text ? JSON.parse(text) : null; } catch (_) { payload = text; }
  if (!response.ok) {
    throw new Error(`GitHub API ${response.status} for ${endpoint}: ${typeof payload === 'string' ? payload : JSON.stringify(payload)}`);
  }
  return payload;
}

async function listPullRequests(token, branch) {
  const head = encodeURIComponent(`${OWNER}:${branch}`);
  return githubRequest(token, 'GET', `/pulls?state=all&head=${head}&per_page=100`);
}

function runChecks(repoRoot) {
  const commands = [
    ['npm', ['run', 'check:operator-docs']],
    ['npm', ['run', 'test:operator-docs']],
    ['npm', ['run', 'test:operator-docs:site']],
    ['npm', ['run', 'build:production']],
    ['npm', ['run', 'check:links']],
  ];
  for (const [program, args] of commands) {
    execFileSync(program, args, {
      cwd: repoRoot,
      stdio: 'inherit',
      env: { ...process.env, ...(args[1] === 'check:links' ? { NETLIFY: 'false', LINK_CHECK_SOFT_FAIL: '0' } : {}) },
    });
  }
}

async function openOrUpdatePullRequest({ token, branch, release, integrity }) {
  const pulls = await listPullRequests(token, branch);
  const existing = selectExistingPullRequest(pulls, branch);
  const title = `docs: archive Krkn Operator ${release.tag}`;
  const body = buildPullRequestBody(release, integrity);
  if (existing) {
    return githubRequest(token, 'PATCH', `/pulls/${existing.number}`, {
      title,
      body,
      state: 'open',
    });
  }
  return githubRequest(token, 'POST', '/pulls', {
    title,
    head: branch,
    base: 'main',
    body,
    draft: false,
  });
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const repoRoot = options.repoRoot;
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN is required for release input verification and PR creation');
  if (!fs.existsSync(path.join(repoRoot, '.git'))) throw new Error(`not a Git checkout: ${repoRoot}`);

  const bootstrapInputs = options.websiteCommit
    ? { website_commit: options.websiteCommit, helm_chart_version: options.chartVersion }
    : undefined;
  const githubClient = createGithubClient({ token });
  const releaseInputs = await resolveReleaseInputsWithRetry({
    githubClient,
    operatorTag: options.tag,
    bootstrapInputs,
  });
  const initialRegistry = readRegistry(repoRoot);
  if (shouldIgnoreReleaseAtAdoptionBoundary(initialRegistry, releaseInputs, bootstrapInputs)) {
    console.log(`Ignoring ${releaseInputs.tag}; it predates the documentation adoption boundary.`);
    return;
  }

  const branch = releaseBranchName(releaseInputs.tag);
  const pullRequests = await listPullRequests(token, branch);
  const existingPull = selectExistingPullRequest(pullRequests, branch);
  const registeredOnBase = initialRegistry.releases.find((entry) => entry.tag === releaseInputs.tag);
  if (existingPull?.merged_at && !registeredOnBase) {
    throw new Error(`PR ${existingPull.number} is merged but its release registry entry is not on main yet`);
  }
  if (registeredOnBase) {
    assertSameReleaseProvenance(registeredOnBase, releaseInputs);
    validateSnapshots(repoRoot, initialRegistry);
    if (!existingPull || existingPull.merged_at) {
      console.log(`Release ${releaseInputs.tag} is already captured on main with matching provenance.`);
      return;
    }
  }

  const hasRemoteBranch = prepareReleaseBranch(repoRoot, branch, git, remoteBranchExists);

  assertTrustedReleaseBranch(repoRoot, releaseInputs.tag, git);
  const branchRegistry = readRegistry(repoRoot);
  const adoptionBoundary = branchRegistry.adoption_boundary_published_at;
  if (shouldIgnoreReleaseAtAdoptionBoundary(branchRegistry, releaseInputs, bootstrapInputs)) {
    console.log(`Ignoring ${releaseInputs.tag}; it predates the documentation adoption boundary.`);
    return;
  }

  const capture = captureSnapshot({
    repoRoot,
    releaseInputs,
    ...(adoptionBoundary ? {} : { adoptionBoundary: releaseInputs.published_at }),
  });
  const registry = readRegistry(repoRoot);
  validateSnapshots(repoRoot, registry);
  console.log(`Snapshot ${capture.status}: ${releaseInputs.tag}`);
  runChecks(repoRoot);

  const recordPath = path.join(repoRoot, 'operator-docs/snapshots', `${releaseInputs.tag}.json`);
  const integrity = JSON.parse(fs.readFileSync(recordPath, 'utf8'));
  const changed = stageSnapshotChanges(repoRoot, releaseInputs.tag, git);
  if (changed) {
    git(repoRoot, ['config', 'user.name', 'github-actions[bot]']);
    git(repoRoot, ['config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com']);
    git(repoRoot, ['commit', '-m', `docs: archive Krkn Operator ${releaseInputs.tag}`]);
  }
  const localHead = git(repoRoot, ['rev-parse', 'HEAD']);
  const remoteHead = hasRemoteBranch ? git(repoRoot, ['rev-parse', `origin/${branch}`]) : null;
  if (!hasRemoteBranch || localHead !== remoteHead) {
    git(repoRoot, ['push', 'origin', `HEAD:refs/heads/${branch}`]);
  }

  const pull = await openOrUpdatePullRequest({
    token,
    branch,
    release: { ...releaseInputs, snapshot_record: `operator-docs/snapshots/${releaseInputs.tag}.json` },
    integrity,
  });
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Prepared [${pull.title}](${pull.html_url}) for ${releaseInputs.tag}.\n`);
  }
  console.log(`${existingPull ? 'Updated' : 'Opened'} documentation PR ${pull.html_url}`);
}

main().catch((error) => {
  console.error(error.message);
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `Operator documentation preparation failed: ${error.message}\n`);
  }
  process.exitCode = 1;
});
