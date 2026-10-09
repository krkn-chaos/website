'use strict';

const YAML = require('yaml');

const OPERATOR_REPOSITORY = 'krkn-chaos/krkn-operator';
const WEBSITE_REPOSITORY = 'krkn-chaos/website';
const HELM_CHART_REFERENCE =
  'oci://quay.io/krkn-chaos/charts/krkn-operator';
const TAG_PATTERN =
  /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;
const COMMIT_PATTERN = /^[0-9a-f]{40}$/i;

function fail(message, retryable = false) {
  const error = new Error(`Unable to resolve Operator release inputs: ${message}`);
  if (retryable) error.retryable = true;
  throw error;
}

function parseMetadata(source, operatorTag, { allowLegacy = false } = {}) {
  if (source == null) fail('docs/website-release.yaml is missing at the release tag');
  let metadata;
  try {
    metadata = YAML.parse(Buffer.isBuffer(source) ? source.toString('utf8') : source, {
      uniqueKeys: true,
    });
  } catch (error) {
    fail(`docs/website-release.yaml is invalid YAML: ${error.message}`);
  }
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    fail('docs/website-release.yaml must be a mapping');
  }
  if (metadata.schema_version !== 1) {
    fail('docs/website-release.yaml schema_version must be 1');
  }

  let selected;
  if (Array.isArray(metadata.releases)) {
    const seenTags = new Set();
    for (const release of metadata.releases) {
      if (!release || typeof release !== 'object' || Array.isArray(release)) {
        fail('docs/website-release.yaml releases entries must be mappings');
      }
      if (typeof release.operator_tag !== 'string' || !TAG_PATTERN.test(release.operator_tag)) {
        fail('docs/website-release.yaml release operator_tag is invalid');
      }
      if (seenTags.has(release.operator_tag)) {
        fail(`docs/website-release.yaml has duplicate Operator tag ${release.operator_tag}`);
      }
      seenTags.add(release.operator_tag);
      if (release.operator_tag === operatorTag) selected = release;
    }
    if (!selected) {
      fail(`docs/website-release.yaml does not contain a mapping for ${operatorTag}`);
    }
  } else if (allowLegacy && typeof metadata.website_commit === 'string') {
    selected = metadata;
  } else {
    fail('docs/website-release.yaml must contain a tag-keyed releases list');
  }

  if (!COMMIT_PATTERN.test(selected.website_commit || '')) {
    fail('docs/website-release.yaml website_commit must be a full Git commit SHA');
  }
  if (typeof selected.helm_chart_version !== 'string' || !selected.helm_chart_version.trim()) {
    fail('docs/website-release.yaml helm_chart_version must be a non-empty string');
  }
  if (selected.helm_chart_version !== operatorTag.slice(1)) {
    fail(`docs/website-release.yaml chart version must match Operator tag ${operatorTag} without its leading v`);
  }
  return selected;
}

function parseChartMetadata(value) {
  if (typeof value === 'string' || Buffer.isBuffer(value)) {
    try {
      return YAML.parse(Buffer.isBuffer(value) ? value.toString('utf8') : value, {
        uniqueKeys: true,
      });
    } catch (error) {
      fail(`published Helm chart metadata is invalid YAML: ${error.message}`);
    }
  }
  return value;
}

async function resolveReleaseInputs({ githubClient, operatorTag, bootstrapInputs }) {
  if (!githubClient || typeof githubClient !== 'object') {
    throw new TypeError('githubClient is required');
  }
  if (typeof operatorTag !== 'string' || !TAG_PATTERN.test(operatorTag)) {
    fail(`tag is not a stable Operator release tag: ${operatorTag}`);
  }
  for (const method of [
    'getReleaseByTag',
    'resolveTagCommit',
    'getFileAtCommit',
    'getCommit',
    'getDefaultBranchHead',
    'compareCommits',
    'getPublishedChart',
  ]) {
    if (typeof githubClient[method] !== 'function') {
      throw new TypeError(`githubClient.${method} must be a function`);
    }
  }

  const [operatorOwner, operatorRepo] = OPERATOR_REPOSITORY.split('/');
  const release = await githubClient.getReleaseByTag(
    operatorOwner,
    operatorRepo,
    operatorTag
  );
  if (!release) fail(`published release ${operatorTag} was not found`, true);
  if (release.draft) fail(`release ${operatorTag} is a draft`);
  if (release.prerelease !== false) {
    fail(`GitHub marks ${operatorTag} as a prerelease or did not confirm a stable release`);
  }
  if (release.tag_name !== operatorTag) {
    fail(`release tag does not match requested tag ${operatorTag}`);
  }
  if (!Number.isSafeInteger(release.id) || release.id <= 0) {
    fail(`release ${operatorTag} has an invalid GitHub release ID`);
  }
  if (typeof release.published_at !== 'string' || !Number.isFinite(Date.parse(release.published_at))) {
    fail(`release ${operatorTag} has no valid publication timestamp`);
  }

  const resolvedTag = await githubClient.resolveTagCommit(
    operatorOwner,
    operatorRepo,
    operatorTag
  );
  const operatorCommit = typeof resolvedTag === 'string' ? resolvedTag : resolvedTag?.sha;
  if (!COMMIT_PATTERN.test(operatorCommit || '')) {
    fail(`tag ${operatorTag} did not resolve to a full Operator commit SHA`);
  }

  const metadataSource = await githubClient.getFileAtCommit(
    operatorOwner,
    operatorRepo,
    operatorCommit,
    'docs/website-release.yaml'
  );
  let metadata;
  if (metadataSource == null && bootstrapInputs) {
    metadata = parseMetadata(JSON.stringify({
      schema_version: 1,
      website_commit: bootstrapInputs.website_commit,
      helm_chart_version: bootstrapInputs.helm_chart_version,
    }), operatorTag, { allowLegacy: true });
  } else {
    metadata = parseMetadata(metadataSource, operatorTag, {
      allowLegacy: Boolean(bootstrapInputs),
    });
    if (
      bootstrapInputs &&
      (bootstrapInputs.website_commit !== metadata.website_commit ||
        bootstrapInputs.helm_chart_version !== metadata.helm_chart_version)
    ) {
      fail('bootstrap inputs do not match metadata stored in the release tag');
    }
  }

  const [websiteOwner, websiteRepo] = WEBSITE_REPOSITORY.split('/');
  const websiteCommitResult = await githubClient.getCommit(
    websiteOwner,
    websiteRepo,
    metadata.website_commit
  );
  if (
    !websiteCommitResult ||
    typeof websiteCommitResult.sha !== 'string' ||
    websiteCommitResult.sha.toLowerCase() !== metadata.website_commit.toLowerCase()
  ) {
    fail(`website commit ${metadata.website_commit} does not exist in ${WEBSITE_REPOSITORY}`);
  }
  const defaultBranchHead = await githubClient.getDefaultBranchHead(
    websiteOwner,
    websiteRepo
  );
  const branchHead = typeof defaultBranchHead === 'string'
    ? defaultBranchHead
    : defaultBranchHead?.sha;
  if (!COMMIT_PATTERN.test(branchHead || '')) {
    fail(`${WEBSITE_REPOSITORY} returned an invalid default-branch head`);
  }
  const comparison = await githubClient.compareCommits(
    websiteOwner,
    websiteRepo,
    metadata.website_commit,
    branchHead
  );
  if (!comparison || !['ahead', 'identical'].includes(comparison.status)) {
    fail(`website commit ${metadata.website_commit} is not in reviewed default-branch history`);
  }

  let chartSource;
  try {
    chartSource = await githubClient.getPublishedChart(
      HELM_CHART_REFERENCE,
      metadata.helm_chart_version
    );
  } catch (error) {
    if (error.retryable === undefined) error.retryable = true;
    throw error;
  }
  const chart = parseChartMetadata(chartSource);
  if (!chart || typeof chart !== 'object') {
    fail('published Helm chart metadata is missing', true);
  }
  if (chart.name !== 'krkn-operator') {
    fail(`published chart at ${HELM_CHART_REFERENCE} is not krkn-operator`);
  }
  if (String(chart.version) !== metadata.helm_chart_version) {
    fail(
      `published chart version ${chart.version} does not match metadata version ${metadata.helm_chart_version}`
    );
  }
  if (chart.appVersion !== operatorTag) {
    fail(
      `published chart appVersion ${chart.appVersion} does not map to Operator tag ${operatorTag}`
    );
  }

  return {
    tag: operatorTag,
    github_release_id: release.id,
    published_at: release.published_at,
    operator_commit: operatorCommit.toLowerCase(),
    website_commit: metadata.website_commit.toLowerCase(),
    helm_chart_version: metadata.helm_chart_version,
    chart_reference: HELM_CHART_REFERENCE,
  };
}

async function resolveReleaseInputsWithRetry({
  timeoutMs = 5 * 60 * 1000,
  retryIntervalMs = 10 * 1000,
  sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  now = Date.now,
  ...options
}) {
  const deadline = now() + timeoutMs;
  while (true) {
    try {
      return await resolveReleaseInputs(options);
    } catch (error) {
      const remaining = deadline - now();
      if (!error.retryable || remaining <= 0) throw error;
      await sleep(Math.min(retryIntervalMs, remaining));
    }
  }
}

module.exports = {
  HELM_CHART_REFERENCE,
  OPERATOR_REPOSITORY,
  WEBSITE_REPOSITORY,
  parseMetadata,
  resolveReleaseInputs,
  resolveReleaseInputsWithRetry,
};
