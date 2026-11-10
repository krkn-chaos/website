'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

test('copying the hands-on plugin methods preserves their class indentation', () => {
  const root = path.resolve(__dirname, '../..');
  const guide = fs.readFileSync(
    path.join(root, 'content/en/docs/developers-guide/custom-scenario/implement-plugin.md'),
    'utf8',
  );
  const snippets = [...guide.matchAll(/^```python\n([\s\S]*?)^```/gm)];
  const sample = snippets.find((match) => match[1].includes('def get_scenario_types'))?.[1];
  assert.ok(sample, 'the lab must provide the abstract-method implementation');
  assert.match(sample, /^ {4}def get_scenario_types/);

  let copied;
  const context = {
    document: { querySelectorAll: () => [] },
    navigator: { clipboard: { writeText: (text) => { copied = text; } } },
    sample: { textContent: sample },
  };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'assets/js/click-to-copy.js'), 'utf8') +
      '\ncopyCode(sample);',
    context,
  );

  assert.equal(copied, sample, 'copy must preserve every line, including the first indent');
});
