#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { prepareHugoInputs, readRegistry } = require('./lib/operator-docs');

const repoRoot = path.resolve(__dirname, '..');
try {
  const registry = readRegistry(repoRoot);
  const result = prepareHugoInputs(repoRoot, registry);
  if (result.enabled) {
    console.log(`Prepared Operator release documentation (${result.versionTag})`);
    console.log(`Generated Hugo config: ${path.relative(repoRoot, result.hugoConfigPath)}`);
    console.log(`Generated ${result.redirects.length} compatibility routes`);
  } else {
    console.log('No Operator snapshots are registered; using the existing content configuration.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
