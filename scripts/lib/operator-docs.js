'use strict';

const fs = require('node:fs');
const path = require('node:path');
const YAML = require('yaml');

const REGISTRY_PATH = path.join('data', 'operator_doc_versions.yaml');
const TAG_PATTERN =
  /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/i;
const TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function fail(message) {
  throw new Error(`Invalid Operator documentation registry: ${message}`);
}

function isTimestamp(value) {
  return (
    typeof value === 'string' &&
    TIMESTAMP_PATTERN.test(value) &&
    Number.isFinite(Date.parse(value))
  );
}

function validatePageKey(key, allowOverview) {
  if (key === '' && allowOverview) return;
  if (typeof key !== 'string' || !key) {
    throw new Error('page key must be a non-empty relative path');
  }
  if (key.startsWith('/') || key.includes('\\') || /[?#:]/.test(key)) {
    throw new Error(`unsafe page key: ${key}`);
  }
  const segments = key.split('/');
  if (
    segments.some(
      (segment) =>
        !segment ||
        segment === '.' ||
        segment === '..' ||
        !/^[A-Za-z0-9._~-]+$/.test(segment)
    )
  ) {
    throw new Error(`unsafe page key: ${key}`);
  }
}

function derivePageKey(relativeMarkdownPath, frontmatter = {}) {
  if (
    typeof relativeMarkdownPath !== 'string' ||
    !relativeMarkdownPath ||
    relativeMarkdownPath.startsWith('/') ||
    relativeMarkdownPath.includes('\\')
  ) {
    throw new Error(`unsafe Markdown path: ${relativeMarkdownPath}`);
  }

  const segments = relativeMarkdownPath.split('/');
  if (
    segments.some(
      (segment) => !segment || segment === '.' || segment === '..'
    ) ||
    !relativeMarkdownPath.endsWith('.md')
  ) {
    throw new Error(`unsafe Markdown path: ${relativeMarkdownPath}`);
  }

  const isOverview =
    segments.length === 1 && segments[0] === '_index.md' ||
    segments.at(-1) === '_index.md';
  const derived = isOverview
    ? segments.slice(0, -1).join('/')
    : segments.join('/').replace(/\.md$/, '');

  const hasExplicitKey = Object.prototype.hasOwnProperty.call(
    frontmatter,
    'operator_docs_page_key'
  );
  const key = hasExplicitKey ? frontmatter.operator_docs_page_key : derived;
  validatePageKey(key, isOverview);
  return key;
}

function validateRegistry(registry) {
  if (!registry || typeof registry !== 'object' || Array.isArray(registry)) {
    fail('root must be a mapping');
  }
  if (registry.schema_version !== 1) {
    fail('schema_version must be 1');
  }
  if (!Array.isArray(registry.releases)) {
    fail('releases must be an array');
  }
  if (
    Object.prototype.hasOwnProperty.call(registry, 'adoption_boundary_published_at') &&
    !isTimestamp(registry.adoption_boundary_published_at)
  ) {
    fail('adoption_boundary_published_at must be an ISO timestamp');
  }

  const tags = new Set();
  const releaseIds = new Set();
  for (const [index, release] of registry.releases.entries()) {
    const label = `releases[${index}]`;
    if (!release || typeof release !== 'object' || Array.isArray(release)) {
      fail(`${label} must be a mapping`);
    }
    if (typeof release.tag !== 'string' || !TAG_PATTERN.test(release.tag)) {
      fail(`${label}.tag is not a safe release directory identifier`);
    }
    if (tags.has(release.tag)) fail(`duplicate tag ${release.tag}`);
    tags.add(release.tag);

    if (
      !Number.isSafeInteger(release.github_release_id) ||
      release.github_release_id <= 0
    ) {
      fail(`${label}.github_release_id must be a positive integer`);
    }
    if (releaseIds.has(release.github_release_id)) {
      fail(`duplicate GitHub release ID ${release.github_release_id}`);
    }
    releaseIds.add(release.github_release_id);

    if (!isTimestamp(release.published_at)) {
      fail(`${label}.published_at must be an ISO timestamp`);
    }
    if (!COMMIT_PATTERN.test(release.operator_commit || '')) {
      fail(`${label}.operator_commit must be a full commit SHA`);
    }
    if (!COMMIT_PATTERN.test(release.website_commit || '')) {
      fail(`${label}.website_commit must be a full commit SHA`);
    }
    if (
      typeof release.helm_chart_version !== 'string' ||
      !release.helm_chart_version.trim()
    ) {
      fail(`${label}.helm_chart_version must be a non-empty string`);
    }
    if (
      typeof release.chart_reference !== 'string' ||
      !/^oci:\/\/[^\s]+$/.test(release.chart_reference)
    ) {
      fail(`${label}.chart_reference must be an OCI reference`);
    }
    if (!isTimestamp(release.captured_at)) {
      fail(`${label}.captured_at must be an ISO timestamp`);
    }

    const expectedRecord = `operator-docs/snapshots/${release.tag}.json`;
    if (release.snapshot_record !== expectedRecord) {
      fail(`${label}.snapshot_record must be ${expectedRecord}`);
    }
  }
  return undefined;
}

function readRegistry(repoRoot) {
  const registryFile = path.join(repoRoot, REGISTRY_PATH);
  let source;
  try {
    source = fs.readFileSync(registryFile, 'utf8');
  } catch (error) {
    throw new Error(`Unable to read Operator documentation registry at ${registryFile}: ${error.message}`);
  }

  let registry;
  try {
    registry = YAML.parse(source, { uniqueKeys: true });
  } catch (error) {
    throw new Error(`Unable to parse Operator documentation registry YAML: ${error.message}`);
  }
  validateRegistry(registry);
  return registry;
}

function selectDefaultRelease(registry) {
  validateRegistry(registry);
  if (registry.releases.length === 0) return null;
  return [...registry.releases].sort((left, right) => {
    const byPublication = Date.parse(right.published_at) - Date.parse(left.published_at);
    if (byPublication !== 0) return byPublication;
    return right.github_release_id - left.github_release_id;
  })[0];
}

function sortReleasesNewest(registry) {
  validateRegistry(registry);
  return [...registry.releases].sort((left, right) => {
    const byPublication = Date.parse(right.published_at) - Date.parse(left.published_at);
    if (byPublication !== 0) return byPublication;
    return right.github_release_id - left.github_release_id;
  });
}

function resolveReleaseInputs(options) {
  return require('./operator-release-inputs').resolveReleaseInputs(options);
}

function resolveReleaseInputsWithRetry(options) {
  return require('./operator-release-inputs').resolveReleaseInputsWithRetry(options);
}

function captureSnapshot(options) {
  return require('./operator-docs-snapshot').captureSnapshot(options);
}

function planSnapshot(options) {
  return require('./operator-docs-snapshot').planSnapshot(options);
}

function readSnapshotSource(repoRoot, commit) {
  return require('./operator-docs-snapshot').readSnapshotSource(repoRoot, commit);
}

function validateSnapshots(repoRoot, registry) {
  return require('./operator-docs-snapshot').validateSnapshots(repoRoot, registry);
}

function prepareHugoInputs(repoRoot, registry, options) {
  return require('./operator-docs-hugo').prepareHugoInputs(repoRoot, registry, options);
}

function finalizeRedirects(repoRoot, registry, publicDir) {
  return require('./operator-docs-hugo').finalizeRedirects(repoRoot, registry, publicDir);
}

module.exports = {
  captureSnapshot,
  derivePageKey,
  finalizeRedirects,
  planSnapshot,
  prepareHugoInputs,
  readRegistry,
  readSnapshotSource,
  resolveReleaseInputs,
  resolveReleaseInputsWithRetry,
  selectDefaultRelease,
  sortReleasesNewest,
  validateRegistry,
  validateSnapshots,
};
