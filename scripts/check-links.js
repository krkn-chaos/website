#!/usr/bin/env node
/**
 * Internal link check: hugo server + linkinator crawl.
 *
 * Exit 0 — ok (or soft-fail via LINK_CHECK_SOFT_FAIL=1 / NETLIFY=true)
 * Exit 1 — broken links
 * Exit 2 — checker failed to start
 */

'use strict';

const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const HOST = process.env.LINK_CHECK_HOST || '127.0.0.1';
const PORT = Number(process.env.LINK_CHECK_PORT || 1313);
const BASE = `http://${HOST}:${PORT}`;
const SOFT_FAIL =
  process.env.LINK_CHECK_SOFT_FAIL === '1' || process.env.NETLIFY === 'true';
const TIMEOUT_MS = Number(process.env.LINK_CHECK_TIMEOUT_MS || 180000);

function bin(name) {
  const file = path.join(ROOT, 'node_modules', '.bin', name);
  if (!fs.existsSync(file)) {
    throw new Error(`${name} not found — run npm install first`);
  }
  return file;
}

function waitForServer(url) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      const req = http.get(url, (res) => {
        res.resume();
        if (res.statusCode && res.statusCode < 500) return resolve();
        retry();
      });
      req.on('error', retry);
      req.setTimeout(2000, () => {
        req.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - start > TIMEOUT_MS) {
        reject(new Error(`Hugo server not ready at ${url}`));
        return;
      }
      setTimeout(tryOnce, 500);
    };
    tryOnce();
  });
}

function stop(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch (_) {
    try {
      child.kill('SIGTERM');
    } catch (_) {
      /* ignore */
    }
  }
}

/** Map page URL → content source file (best effort). */
function sourceFileFor(pageUrl) {
  let pathname;
  try {
    pathname = new URL(pageUrl).pathname;
  } catch (_) {
    return null;
  }
  const rel = pathname.replace(/\/+$/, '').replace(/^\//, '');
  if (!rel) return 'layouts/index.html';

  for (const candidate of [
    path.join('content/en', `${rel}.md`),
    path.join('content/en', rel, '_index.md'),
  ]) {
    if (fs.existsSync(path.join(ROOT, candidate))) return candidate;
  }
  return null;
}

/** Enrich linkinator errors with Hugo source paths. */
function printSources(output) {
  const lines = output.split(/\r?\n/);
  let parent = null;
  const seen = new Set();

  console.error('\nSource files:\n');
  for (const line of lines) {
    const broken = line.match(/^\s*\[(\d+)\]\s+(https?:\/\/\S+)/);
    if (/^https?:\/\/\S+\s*$/.test(line)) {
      parent = line.trim();
      continue;
    }
    if (!broken || !parent) continue;

    const key = `${parent}|${broken[2]}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const src = sourceFileFor(parent);
    console.error(`  [${broken[1]}] ${broken[2]}`);
    console.error(`       found on: ${parent}`);
    console.error(`       source:   ${src || '(unknown)'}`);
    console.error('');
  }
}

function runLinkinator(hugo) {
  const args = [
    BASE,
    '--recurse',
    '--verbosity',
    'error',
    '--skip',
    `^(https?://(?!${HOST.replace(/\./g, '\\.')}|localhost)|mailto:)`,
    '--skip',
    '_print',
  ];

  console.log(`→ linkinator ${args.join(' ')}\n`);

  return new Promise((resolve, reject) => {
    const child = spawn(bin('linkinator'), args, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let done = false;
    let broken = false;
    let output = '';

    const finish = (code) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(code);
    };

    // Linkinator can hang on keep-alive; stop hugo after the summary.
    const onDone = () => {
      stop(hugo);
      setTimeout(() => {
        if (child.exitCode === null) child.kill('SIGTERM');
      }, 2000).unref?.();
    };

    const onData = (buf) => {
      const text = buf.toString();
      output += text;
      process.stdout.write(text);
      if (/Detected \d+ broken links/i.test(text)) {
        broken = true;
        printSources(output);
        onDone();
      } else if (/Successfully scanned \d+ links/i.test(text)) {
        onDone();
      }
    };

    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    child.on('error', reject);
    child.on('close', (code) => finish(broken ? 1 : code ?? 1));

    const timer = setTimeout(() => {
      stop(hugo);
      child.kill('SIGKILL');
      reject(new Error(`Timed out after ${TIMEOUT_MS}ms`));
    }, TIMEOUT_MS);
  });
}

async function main() {
  console.log('🔗 Internal link check');
  console.log(`   ${BASE}  soft-fail=${SOFT_FAIL}`);

  const hugo = spawn(
    bin('hugo'),
    [
      'server',
      '--bind',
      HOST,
      '--port',
      String(PORT),
      '--baseURL',
      `${BASE}/`,
      '--disableFastRender',
      '--watch=false',
    ],
    {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32',
    }
  );

  let hugoLog = '';
  const appendLog = (d) => {
    hugoLog = (hugoLog + d).slice(-8000);
  };
  hugo.stdout.on('data', appendLog);
  hugo.stderr.on('data', appendLog);

  let exitCode = 0;
  try {
    await waitForServer(BASE);
    console.log('✅ Hugo ready\n');

    const status = await runLinkinator(hugo);
    if (status === 0) {
      console.log('\n✅ No broken internal links');
    } else if (SOFT_FAIL) {
      console.warn('\n⚠️  Broken links found (soft-fail — not failing build)');
    } else {
      console.error('\n❌ Broken internal links found');
      exitCode = 1;
    }
  } catch (err) {
    console.error(`\n❌ ${err.message}`);
    if (hugoLog) console.error(hugoLog);
    exitCode = SOFT_FAIL ? 0 : 2;
  } finally {
    stop(hugo);
  }

  process.exit(exitCode);
}

main();
