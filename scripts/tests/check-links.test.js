'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');

const { hugoServerArgs } = require('../check-links');

test('the post-build link checker renders in memory and preserves published output', () => {
  const args = hugoServerArgs({ host: '127.0.0.1', port: 1313 });

  assert.ok(args.includes('--renderToMemory'));
});
