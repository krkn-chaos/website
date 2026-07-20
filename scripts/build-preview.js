#!/usr/bin/env node

/**
 * Cross-platform runner for the Netlify deploy-preview Hugo build.
 *
 * The previous implementation set the base URL inline in package.json using
 * POSIX shell parameter expansion:
 *
 *   npm run _hugo-dev -- --minify --baseURL "${DEPLOY_PRIME_URL:-/}"
 *
 * That syntax is not understood by cmd.exe/PowerShell, so `npm run
 * build:preview` failed on Windows. A later fix removed the --baseURL flag
 * entirely to work around the Windows failure, but that silently broke
 * Netlify deploy previews: without it, Hugo falls back to the `baseURL`
 * configured in hugo.yaml (the production domain), so every deploy-preview
 * build generates canonical tags, Open Graph URLs, and absolute links that
 * point at production instead of the actual preview URL.
 *
 * This script restores the original behavior (use Netlify's DEPLOY_PRIME_URL
 * when present, otherwise fall back to "/") without relying on shell-specific
 * syntax: Node reads process.env directly and passes the base URL as a
 * plain argv entry, so there is nothing for the OS shell to interpret.
 */

const { spawnSync } = require('child_process');

const baseURL = process.env.DEPLOY_PRIME_URL || '/';

const result = spawnSync(
  process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['run', '_hugo-dev', '--', '--minify', '--baseURL', baseURL],
  { stdio: 'inherit' }
);

if (result.error) {
  console.error(`💥 Failed to launch Hugo build: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status === null ? 1 : result.status);
