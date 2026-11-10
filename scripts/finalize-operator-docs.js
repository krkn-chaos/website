#!/usr/bin/env node
'use strict';

const path = require('node:path');
const { finalizeRedirects, readRegistry } = require('./lib/operator-docs');

const repoRoot = path.resolve(__dirname, '..');
try {
  const result = finalizeRedirects(
    repoRoot,
    readRegistry(repoRoot),
    path.join(repoRoot, 'public')
  );
  console.log(`Finalized ${result.appended} exact Operator compatibility redirects.`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
