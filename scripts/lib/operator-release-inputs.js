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

async function resolveReleaseInputs({ githubClient, operatorTag, websiteCommit }) {
  if (!githubClient || typeof githubClient !== 'object') {
    throw new TypeError('githubClient is required');
  }
  if (typeof operatorTag !== 'string' || !TAG_PATTERN.test(operatorTag)) {
    fail(`tag is not a stable Operator release tag: ${operatorTag}`);
  }
  for (const method of [
    'getReleaseByTag',
    'resolveTagCommit',
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

  const [websiteOwner, websiteRepo] = WEBSITE_REPOSITORY.split('/');
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
  const selectedWebsiteCommit = websiteCommit || branchHead;
  if (!COMMIT_PATTERN.test(selectedWebsiteCommit || '')) {
    fail('the pinned Website commit must be a full Git commit SHA');
  }
  const pinnedWebsiteCommit = selectedWebsiteCommit.toLowerCase();
  const websiteCommitResult = await githubClient.getCommit(
    websiteOwner,
    websiteRepo,
    pinnedWebsiteCommit
  );
  if (
    !websiteCommitResult ||
    typeof websiteCommitResult.sha !== 'string' ||
    websiteCommitResult.sha.toLowerCase() !== pinnedWebsiteCommit
  ) {
    fail(`website commit ${pinnedWebsiteCommit} does not exist in ${WEBSITE_REPOSITORY}`);
  }
  const comparison = await githubClient.compareCommits(
    websiteOwner,
    websiteRepo,
    pinnedWebsiteCommit,
    branchHead
  );
  if (!comparison || !['ahead', 'identical'].includes(comparison.status)) {
    fail(`website commit ${pinnedWebsiteCommit} is not in reviewed default-branch history`);
  }

  const chartVersion = operatorTag.slice(1);
  let chartSource;
  try {
    chartSource = await githubClient.getPublishedChart(
      HELM_CHART_REFERENCE,
      chartVersion
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
  if (String(chart.version) !== chartVersion) {
    fail(
      `published chart version ${chart.version} does not match Operator tag version ${chartVersion}`
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
    website_commit: pinnedWebsiteCommit,
    helm_chart_version: chartVersion,
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
  resolveReleaseInputs,
  resolveReleaseInputsWithRetry,
};
