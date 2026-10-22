#!/usr/bin/env node
'use strict';

const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const {
  finalizeRedirects,
  prepareHugoInputs,
  readRegistry,
} = require('./lib/operator-docs');

const repoRoot = path.resolve(__dirname, '..');
const hugoBin = process.env.HUGO_BIN || path.join(repoRoot, 'node_modules/.bin/hugo');
const args = process.argv.slice(2);
const commandsWithoutStaticOutput = new Set([
  'server',
  'serve',
  'version',
  'mod',
  'config',
  'env',
  'help',
  'list',
  'completion',
]);

function isStaticBuild(argv) {
  if (argv.some((argument) => commandsWithoutStaticOutput.has(argument))) return false;
  if (argv.includes('--help') || argv.includes('-h')) return false;
  return true;
}

function runHugo(argv) {
  return new Promise((resolve, reject) => {
    const child = spawn(hugoBin, argv, {
      cwd: repoRoot,
      stdio: 'inherit',
      env: process.env,
    });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) resolve(128);
      else resolve(code ?? 1);
    });
    const forwardSignal = (signal) => {
      if (child.exitCode === null) child.kill(signal);
    };
    process.once('SIGINT', forwardSignal);
    process.once('SIGTERM', forwardSignal);
    child.once('exit', () => {
      process.removeListener('SIGINT', forwardSignal);
      process.removeListener('SIGTERM', forwardSignal);
    });
  });
}

async function main() {
  if (!fs.existsSync(hugoBin)) {
    throw new Error(`Hugo binary not found at ${hugoBin}`);
  }
  const authoringPreview = process.env.OPERATOR_DOCS_AUTHORING_PREVIEW === '1';
  const deployPreview = process.env.OPERATOR_DOCS_DEPLOY_PREVIEW === '1';
  const registry = authoringPreview ? null : readRegistry(repoRoot);
  const prepared = authoringPreview
    ? { enabled: false }
    : prepareHugoInputs(repoRoot, registry, {
      includeAuthoringSourcePreview: deployPreview,
    });
  const generatedConfig = prepared.hugoConfigPath
    ? `hugo.yaml,${path.relative(repoRoot, prepared.hugoConfigPath)}`
    : null;
  const hugoArgs = authoringPreview
    ? ['--config', 'hugo.yaml,config/operator-docs-authoring.yaml', ...args]
    : generatedConfig
      ? ['--config', generatedConfig, ...args]
      : args;
  if (authoringPreview) {
    console.log('Authoring preview — not published documentation.');
  } else if (deployPreview) {
    console.log('Deploy preview — upcoming Operator docs are shown at unversioned URLs; release snapshots remain frozen.');
  }
  const exitCode = await runHugo(hugoArgs);
  if (exitCode !== 0) {
    process.exitCode = exitCode;
    return;
  }
  if (isStaticBuild(args) && prepared.enabled && !deployPreview) {
    finalizeRedirects(repoRoot, registry, path.join(repoRoot, 'public'));
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
