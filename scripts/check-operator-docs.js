#!/usr/bin/env node
'use strict';

const path = require('node:path');
const {
  prepareHugoInputs,
  readRegistry,
  selectDefaultRelease,
  validateSnapshots,
} = require('./lib/operator-docs');

const repoRoot = path.resolve(__dirname, '..');
try {
  const registry = readRegistry(repoRoot);
  validateSnapshots(repoRoot, registry);
  const prepared = prepareHugoInputs(repoRoot, registry);
  if (prepared.enabled) {
    console.log(
      `Operator documentation snapshots are valid. Default: ${selectDefaultRelease(registry).tag}.`
    );
  } else {
    console.log('Operator documentation registry is valid and has no published snapshots yet.');
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
