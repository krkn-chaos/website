'use strict';

const { execFileSync } = require('node:child_process');
const YAML = require('yaml');

function createGithubClient({ token = process.env.GITHUB_TOKEN, fetchImpl = globalThis.fetch, helmBin = 'helm' } = {}) {
  if (typeof fetchImpl !== 'function') throw new TypeError('Fetch API is required');

  async function request(owner, repository, endpoint) {
    const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repository)}${endpoint}`;
    const headers = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'krkn-operator-docs-versioning',
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    let response;
    try {
      response = await fetchImpl(url, { headers });
    } catch (error) {
      error.retryable = true;
      throw error;
    }
    if (response.status === 404) return null;
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      const error = new Error(`GitHub API ${response.status} for ${endpoint}: ${detail.slice(0, 300)}`);
      if (response.status === 429 || response.status >= 500) error.retryable = true;
      throw error;
    }
    return response.json();
  }

  return {
    async getReleaseByTag(owner, repository, tag) {
      return request(owner, repository, `/releases/tags/${encodeURIComponent(tag)}`);
    },

    async resolveTagCommit(owner, repository, tag) {
      let reference = await request(
        owner,
        repository,
        `/git/ref/tags/${encodeURIComponent(tag)}`
      );
      if (!reference?.object) return null;
      let object = reference.object;
      const seen = new Set();
      while (object.type === 'tag') {
        if (!object.sha || seen.has(object.sha) || seen.size >= 8) {
          throw new Error(`Invalid annotated Git tag chain for ${tag}`);
        }
        seen.add(object.sha);
        const annotatedTag = await request(owner, repository, `/git/tags/${object.sha}`);
        if (!annotatedTag?.object) return null;
        object = annotatedTag.object;
      }
      return object.type === 'commit' ? object.sha : null;
    },

    async getFileAtCommit(owner, repository, commit, filePath) {
      const encodedPath = filePath.split('/').map(encodeURIComponent).join('/');
      const file = await request(
        owner,
        repository,
        `/contents/${encodedPath}?ref=${encodeURIComponent(commit)}`
      );
      if (!file) return null;
      if (file.type !== 'file' || file.encoding !== 'base64' || typeof file.content !== 'string') {
        throw new Error(`GitHub did not return a regular file for ${filePath}@${commit}`);
      }
      return Buffer.from(file.content.replace(/\s+/g, ''), 'base64');
    },

    async getCommit(owner, repository, commit) {
      const result = await request(owner, repository, `/commits/${encodeURIComponent(commit)}`);
      return result ? { sha: result.sha } : null;
    },

    async getDefaultBranchHead(owner, repository) {
      const metadata = await request(owner, repository, '');
      if (!metadata?.default_branch) return null;
      const branch = await request(
        owner,
        repository,
        `/commits/${encodeURIComponent(metadata.default_branch)}`
      );
      return branch ? { sha: branch.sha } : null;
    },

    async compareCommits(owner, repository, base, head) {
      return request(
        owner,
        repository,
        `/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`
      );
    },

    async getPublishedChart(reference, version) {
      let output;
      try {
        output = execFileSync(
          helmBin,
          ['show', 'chart', reference, '--version', version],
          { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
        );
      } catch (error) {
        const detail = error.stderr?.toString().trim() || error.message;
        throw new Error(`Unable to fetch published Helm chart ${reference}@${version}: ${detail}`);
      }
      return YAML.parse(output, { uniqueKeys: true });
    },
  };
}

module.exports = { createGithubClient };
