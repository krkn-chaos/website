#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  captureSnapshot,
  planSnapshot,
  readRegistry,
  readSnapshotSource,
  resolveReleaseInputsWithRetry,
} = require('./lib/operator-docs');
const { createGithubClient } = require('./lib/operator-github-client');
const { shouldIgnoreReleaseAtAdoptionBoundary } = require('./lib/operator-docs-automation');

function parseArgs(argv) {
  const options = { dryRun: false, repoRoot: path.resolve(__dirname, '..') };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--dry-run') options.dryRun = true;
    else if (argument === '--tag') options.tag = argv[++index];
    else if (argument === '--repo-root') options.repoRoot = path.resolve(argv[++index]);
    else throw new Error(`unknown argument: ${argument}`);
  }
  if (!options.tag) throw new Error('usage: snapshot-operator-docs.js --tag <published-tag> [--dry-run]');
  return options;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const githubClient = createGithubClient({ token: process.env.GITHUB_TOKEN });
  const releaseInputs = await resolveReleaseInputsWithRetry({
    githubClient,
    operatorTag: options.tag,
  });
  if (!shouldCaptureRelease(options.repoRoot, releaseInputs)) {
    console.log(`Ignoring ${releaseInputs.tag}; it predates the documentation adoption boundary.`);
    return;
  }
  const source = readSnapshotSource(options.repoRoot, releaseInputs.website_commit);
  const plan = planSnapshot({
    releaseInputs,
    source,
    capturedAt: new Date().toISOString(),
  });
  const pageCount = plan.files.filter((file) => file.path.endsWith('.md')).length;
  const report = {
    tag: releaseInputs.tag,
    github_release_id: releaseInputs.github_release_id,
    published_at: releaseInputs.published_at,
    operator_commit: releaseInputs.operator_commit,
    website_commit: releaseInputs.website_commit,
    helm_chart_version: releaseInputs.helm_chart_version,
    chart_reference: releaseInputs.chart_reference,
    pages: pageCount,
    outputs: plan.integrity.expected_output_inventory.length,
    external_video_dependencies: plan.integrity.external_video_dependencies,
    mode: options.dryRun ? 'dry-run' : 'capture',
  };
  console.log(JSON.stringify(report, null, 2));
  if (options.dryRun) return;
  const result = captureSnapshot({
    repoRoot: options.repoRoot,
    releaseInputs,
    now: () => plan.integrity.captured_at,
  });
  console.log(`Snapshot ${result.status}: ${releaseInputs.tag}`);
}

function shouldCaptureRelease(repoRoot, releaseInputs) {
  return !shouldIgnoreReleaseAtAdoptionBoundary(
    readRegistry(repoRoot),
    releaseInputs
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

module.exports = { shouldCaptureRelease };
