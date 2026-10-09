#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const YAML = require('yaml');

const WEBSITE = '/repos/krkn-chaos/website';
const OPERATOR = '/repos/krkn-chaos/krkn-operator';
const METADATA_PATH = 'docs/website-release.yaml';
const SOURCE_BRANCH = /^docs\/operator-source\/(v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*))$/;
const SHA = /^[0-9a-f]{40}$/;

function identifySourceRelease(pull) {
  if (!pull?.merged) throw new Error('Website source PR must be merged');
  if (pull.base?.ref !== 'main' || pull.base?.repo?.full_name !== 'krkn-chaos/website') {
    throw new Error('Website source PR must target krkn-chaos/website main');
  }
  const match = SOURCE_BRANCH.exec(pull.head?.ref || '');
  if (!match) throw new Error('Website source branch must name a stable release: docs/operator-source/vMAJOR.MINOR.PATCH');
  if (!SHA.test(pull.merge_commit_sha || '')) throw new Error('Website source PR has no full merge commit SHA');
  return {
    tag: match[1], websiteCommit: pull.merge_commit_sha,
    chartVersion: match[1].slice(1), releaseBranch: `release-${match[2]}.${match[3]}`,
  };
}

function parseMetadata(source) {
  const metadata = source == null ? { schema_version: 1, releases: [] } : YAML.parse(source, { uniqueKeys: true });
  if (metadata?.schema_version !== 1 || !Array.isArray(metadata.releases)) {
    throw new Error('Operator metadata must contain schema_version: 1 and a tag-keyed releases list');
  }
  const tags = new Set();
  for (const entry of metadata.releases) {
    if (!/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(entry?.operator_tag || '') ||
        !SHA.test(entry.website_commit || '') || entry.helm_chart_version !== entry.operator_tag.slice(1) ||
        tags.has(entry.operator_tag)) throw new Error('Operator metadata contains an invalid or duplicate release mapping');
    tags.add(entry.operator_tag);
  }
  return metadata;
}

function appendReleaseMetadata(source, release) {
  const metadata = parseMetadata(source);
  const entry = { operator_tag: release.tag, website_commit: release.websiteCommit, helm_chart_version: release.chartVersion };
  const existing = metadata.releases.find(item => item.operator_tag === release.tag);
  if (existing) {
    if (existing.website_commit !== entry.website_commit || existing.helm_chart_version !== entry.helm_chart_version) {
      throw new Error(`Operator ${release.tag} already has different provenance`);
    }
    return source;
  }
  metadata.releases.push(entry);
  return YAML.stringify(metadata);
}

async function optional(api, route) {
  try { return await api('GET', route); }
  catch (error) { if (error.status === 404) return null; throw error; }
}

async function readMetadata(api, ref) {
  const file = await optional(api, `${OPERATOR}/contents/${METADATA_PATH}?ref=${encodeURIComponent(ref)}`);
  if (file == null) return null;
  if (file.encoding !== 'base64' || typeof file.content !== 'string') throw new Error('Operator metadata is not a regular text file');
  return Buffer.from(file.content, 'base64').toString('utf8');
}

async function prepareMetadataPr({ api, sourcePullNumber }) {
  if (!Number.isSafeInteger(Number(sourcePullNumber)) || Number(sourcePullNumber) <= 0) throw new Error('A positive Website source PR number is required');
  const pull = await api('GET', `${WEBSITE}/pulls/${Number(sourcePullNumber)}`);
  const release = identifySourceRelease(pull);
  let authoringChanged = false;
  for (let page = 1; ; page += 1) {
    const files = await api('GET', `${WEBSITE}/pulls/${Number(sourcePullNumber)}/files?per_page=100&page=${page}`);
    authoringChanged ||= files.some(file => file.filename.startsWith('content/en/docs/krkn-operator/') &&
      !file.filename.startsWith('content/en/docs/krkn-operator/versions/'));
    if (files.length < 100) break;
  }
  if (!authoringChanged) throw new Error('Website source PR must change Operator authoring content');
  const ancestry = await api('GET', `${WEBSITE}/compare/${release.websiteCommit}...main`);
  if (!['ahead', 'identical'].includes(ancestry.status)) throw new Error('Website source merge commit is not in main history');

  const published = await optional(api, `${OPERATOR}/releases/tags/${release.tag}`);
  if (published) {
    if (published.draft || published.prerelease || published.tag_name !== release.tag) throw new Error('Operator release is not a published stable release');
    const taggedMetadata = await readMetadata(api, release.tag);
    if (taggedMetadata != null) {
      const expected = appendReleaseMetadata(taggedMetadata, release);
      if (expected !== taggedMetadata) throw new Error('Published Operator tag has no metadata mapping for this release');
      return { ...release, mode: 'snapshot' };
    }
    return { ...release, mode: 'bootstrap' };
  }
  if (await optional(api, `${OPERATOR}/git/ref/tags/${release.tag}`)) {
    throw new Error('Operator tag already exists; do not rewrite it to add release metadata');
  }

  const base = await api('GET', `${OPERATOR}/git/ref/heads/${release.releaseBranch}`);
  const baseSha = base.object.sha;
  const baseSource = await readMetadata(api, baseSha);
  const content = appendReleaseMetadata(baseSource, release);
  if (baseSource === content) return { ...release, mode: 'metadata-merged' };
  const branch = `docs/website-release/${release.tag}`;
  const existingBranch = await optional(api, `${OPERATOR}/git/ref/heads/${branch}`);
  let unchanged = false;
  if (existingBranch) {
    const branchSource = await readMetadata(api, existingBranch.object.sha);
    appendReleaseMetadata(branchSource, release);
    const comparison = await api('GET', `${OPERATOR}/compare/${baseSha}...${existingBranch.object.sha}`);
    if (!Array.isArray(comparison.files) || comparison.files.some(file => file.filename !== METADATA_PATH)) {
      throw new Error('Metadata branch has other changes; refusing to overwrite it');
    }
    const baseEntries = parseMetadata(content).releases;
    for (const entry of parseMetadata(branchSource).releases) {
      if (!baseEntries.some(item => item.operator_tag === entry.operator_tag && item.website_commit === entry.website_commit && item.helm_chart_version === entry.helm_chart_version)) {
        throw new Error('Metadata branch has an unmerged mapping; refusing to discard it');
      }
    }
    unchanged = branchSource === content && ['ahead', 'identical'].includes(comparison.status);
  }
  if (!unchanged) {
    const baseCommit = await api('GET', `${OPERATOR}/git/commits/${baseSha}`);
    const tree = await api('POST', `${OPERATOR}/git/trees`, {
      base_tree: baseCommit.tree.sha, tree: [{ path: METADATA_PATH, mode: '100644', type: 'blob', content }],
    });
    const identity = { name: 'github-actions[bot]', email: '41898282+github-actions[bot]@users.noreply.github.com' };
    const commit = await api('POST', `${OPERATOR}/git/commits`, {
      message: `ci: pin Website docs for ${release.tag}\n\nSigned-off-by: ${identity.name} <${identity.email}>`,
      tree: tree.sha, parents: [...new Set([baseSha, ...(existingBranch ? [existingBranch.object.sha] : [])])],
      author: identity, committer: identity,
    });
    if (existingBranch) await api('PATCH', `${OPERATOR}/git/refs/heads/${branch}`, { sha: commit.sha, force: false });
    else await api('POST', `${OPERATOR}/git/refs`, { ref: `refs/heads/${branch}`, sha: commit.sha });
  }
  const pulls = await api('GET', `${OPERATOR}/pulls?state=open&head=${encodeURIComponent(`krkn-chaos:${branch}`)}&base=${release.releaseBranch}&per_page=100`);
  if (pulls.length > 1) throw new Error('Multiple open metadata PRs exist for this release');
  const metadataPull = pulls[0] || await api('POST', `${OPERATOR}/pulls`, {
    title: `ci: pin Website documentation for ${release.tag}`, head: branch, base: release.releaseBranch,
    body: `Pins the reviewed [Website source PR #${Number(sourcePullNumber)}](https://github.com/krkn-chaos/website/pull/${Number(sourcePullNumber)}) at commit ${release.websiteCommit} to Operator ${release.tag} and chart ${release.chartVersion}.\n\nReview and merge this PR before creating the release tag. The release and chart publication then notify the Website, which creates a separate frozen-snapshot PR. Auto-merge is disabled.`,
    draft: false,
  });
  return { ...release, mode: 'metadata', pull: metadataPull };
}

function createApi(token) {
  if (!token) throw new Error('GITHUB_TOKEN is required');
  return async (method, route, body) => {
    const response = await fetch(`https://api.github.com${route}`, {
      method, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    if (!response.ok) throw Object.assign(new Error(`GitHub ${method} ${route}: HTTP ${response.status}`), { status: response.status });
    return response.status === 204 ? null : response.json();
  };
}

async function main() {
  const result = await prepareMetadataPr({ api: createApi(process.env.GITHUB_TOKEN), sourcePullNumber: process.env.SOURCE_PULL_NUMBER });
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT,
    `mode=${result.mode}\noperator_tag=${result.tag}\nwebsite_commit=${result.websiteCommit}\nchart_version=${result.chartVersion}\n`);
  const summary = result.mode === 'metadata-merged' ? `Operator metadata for ${result.tag} is already merged; waiting for release publication` : result.pull ? `Prepared Operator metadata PR: ${result.pull.html_url}` : `Preparing ${result.mode} snapshot for ${result.tag} from ${result.websiteCommit}`;
  console.log(summary);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${summary}\n`);
}

module.exports = { identifySourceRelease, appendReleaseMetadata, prepareMetadataPr };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
