'use strict';

const PROVENANCE_FIELDS = [
  'tag',
  'github_release_id',
  'published_at',
  'operator_commit',
  'website_commit',
  'helm_chart_version',
  'chart_reference',
];

const BOT_GIT_NAME = 'github-actions[bot]';
const BOT_GIT_EMAIL = '41898282+github-actions[bot]@users.noreply.github.com';
const OPERATOR_TAG_PATTERN = /^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)$/;

function assertBootstrapInputsAllowed(registry, tag, bootstrapInputs) {
  if (!bootstrapInputs || !registry?.adoption_boundary_published_at) return;

  const registeredRelease = (registry.releases || []).find((release) => release.tag === tag);
  if (!registeredRelease) {
    const adoptedRelease = (registry.releases || []).some((release) =>
      Date.parse(release.published_at) >= Date.parse(registry.adoption_boundary_published_at)
    );
    if (adoptedRelease) {
      throw new Error('bootstrap inputs are only accepted before the adoption boundary');
    }
    return;
  }
  if (
    registeredRelease.website_commit !== bootstrapInputs.website_commit ||
    registeredRelease.helm_chart_version !== bootstrapInputs.helm_chart_version
  ) {
    throw new Error('bootstrap inputs do not match the registered bootstrap provenance');
  }
}

function mergeMainWithBotIdentity(repoRoot, runGit) {
  if (typeof runGit !== 'function') throw new Error('runGit must be a function');
  runGit(repoRoot, ['config', 'user.name', BOT_GIT_NAME]);
  runGit(repoRoot, ['config', 'user.email', BOT_GIT_EMAIL]);
  return runGit(repoRoot, ['merge', '--no-edit', 'origin/main']);
}

function prepareReleaseBranch(repoRoot, branch, runGit, remoteBranchExists) {
  if (typeof runGit !== 'function') throw new Error('runGit must be a function');
  if (typeof remoteBranchExists !== 'function') {
    throw new Error('remoteBranchExists must be a function');
  }

  runGit(repoRoot, ['fetch', 'origin', 'main']);
  const hasRemoteBranch = remoteBranchExists(repoRoot, branch);
  if (hasRemoteBranch) {
    runGit(repoRoot, [
      'fetch', 'origin', `refs/heads/${branch}:refs/remotes/origin/${branch}`,
    ]);
    runGit(repoRoot, ['checkout', '-B', branch, `origin/${branch}`]);
    mergeMainWithBotIdentity(repoRoot, runGit);
  } else {
    runGit(repoRoot, ['checkout', '-b', branch, 'origin/main']);
  }
  return hasRemoteBranch;
}

function assertTrustedReleaseBranch(repoRoot, tag, runGit) {
  if (typeof runGit !== 'function') throw new Error('runGit must be a function');
  releaseBranchName(tag);
  const changedPaths = runGit(repoRoot, ['diff', '--name-only', 'origin/main...HEAD'])
    .split('\n').filter(Boolean);
  const allowed = (file) => file === 'data/operator_doc_versions.yaml' ||
    file === `operator-docs/snapshots/${tag}.json` ||
    file.startsWith(`content/en/docs/krkn-operator/versions/${tag}/`) ||
    file.startsWith(`static/operator-docs/${tag}/`) ||
    file.startsWith(`data/operator_docs/releases/${tag}/`);
  const unexpected = changedPaths.filter((file) => !allowed(file));
  if (unexpected.length) {
    throw new Error(`untrusted changes on existing snapshot branch: ${unexpected.join(', ')}`);
  }
  if (changedPaths.length) {
    const tree = runGit(repoRoot, ['ls-tree', '-rz', 'HEAD', '--', ...changedPaths]);
    const symlinks = tree.split('\0').filter((entry) => entry.startsWith('120000 blob '));
    if (symlinks.length) {
      throw new Error(`untrusted symlinks on existing snapshot branch: ${symlinks.map((entry) => entry.split('\t').pop()).join(', ')}`);
    }
  }
  return true;
}

function stageSnapshotChanges(repoRoot, tag, runGit) {
  if (typeof runGit !== 'function') throw new Error('runGit must be a function');
  releaseBranchName(tag);
  const paths = [
    'data/operator_doc_versions.yaml',
    `content/en/docs/krkn-operator/versions/${tag}`,
    `static/operator-docs/${tag}`,
    `data/operator_docs/releases/${tag}`,
    `operator-docs/snapshots/${tag}.json`,
  ];
  const existingPaths = runGit(repoRoot, [
    'ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...paths,
  ]).split('\0').filter(Boolean);
  if (existingPaths.length === 0) return false;
  runGit(repoRoot, ['add', '-A', '--', ...existingPaths]);
  return Boolean(runGit(repoRoot, ['diff', '--cached', '--name-only', '--', ...paths]));
}

function sameReleaseProvenance(left, right) {
  return PROVENANCE_FIELDS.every((field) => {
    if (field !== 'chart_reference') return left?.[field] === right?.[field];
    return normalizedChartReference(left) === normalizedChartReference(right);
  });
}

function normalizedChartReference(release) {
  const reference = release?.chart_reference;
  const version = release?.helm_chart_version;
  if (typeof reference !== 'string' || typeof version !== 'string' || !version) {
    return reference;
  }
  const versionSuffix = `:${version}`;
  return reference.endsWith(versionSuffix)
    ? reference.slice(0, -versionSuffix.length)
    : reference;
}

function assertSameReleaseProvenance(existing, incoming) {
  if (!sameReleaseProvenance(existing, incoming)) {
    throw new Error(`release ${incoming.tag} already exists with different provenance`);
  }
}

function isBeforeAdoptionBoundary(release, boundary) {
  if (typeof boundary !== 'string' || !Number.isFinite(Date.parse(boundary))) {
    throw new Error('the published-release adoption boundary is missing or invalid');
  }
  if (!Number.isFinite(Date.parse(release?.published_at || ''))) {
    throw new Error(`release ${release?.tag || '(unknown)'} has an invalid published_at timestamp`);
  }
  return Date.parse(release.published_at) <= Date.parse(boundary);
}

function shouldIgnoreReleaseAtAdoptionBoundary(registry, release, bootstrapInputs) {
  assertBootstrapInputsAllowed(registry, release?.tag, bootstrapInputs);
  const registeredRelease = (registry?.releases || []).find(
    (entry) => entry.tag === release?.tag
  );
  if (registeredRelease) {
    assertSameReleaseProvenance(registeredRelease, release);
    return false;
  }
  const boundary = registry?.adoption_boundary_published_at;
  if (boundary) return isBeforeAdoptionBoundary(release, boundary);
  if (!bootstrapInputs) {
    throw new Error('the adoption boundary has not been bootstrapped; use the manual workflow with explicit website commit and chart inputs');
  }
  return false;
}

function releaseBranchName(tag) {
  if (!OPERATOR_TAG_PATTERN.test(tag || '')) {
    throw new Error(`unsafe Operator release tag for branch name: ${tag}`);
  }
  return `docs/operator-release/${tag}`;
}

function selectExistingPullRequest(pulls, branch) {
  if (!Array.isArray(pulls)) throw new Error('GitHub pull request response must be an array');
  const matching = pulls.filter((pull) => pull.head?.ref === branch);
  const open = matching.filter((pull) => pull.state === 'open');
  if (open.length > 1) throw new Error(`multiple open Operator documentation PRs exist for ${branch}`);
  if (open.length === 1) return open[0];
  return matching.sort((left, right) => Date.parse(right.updated_at) - Date.parse(left.updated_at))[0] || null;
}

function buildPullRequestBody(release, integrity) {
  const pages = integrity.expected_output_inventory
    .filter((filePath) => filePath.startsWith('content/en/docs/krkn-operator/versions/') && filePath.endsWith('.md'))
    .map((filePath) => `- \`${filePath.replace(/^content\/en\/docs\/krkn-operator\/versions\/[^/]+\//, '')}\``);
  const dependencies = integrity.external_video_dependencies.length
    ? integrity.external_video_dependencies.map((url) => `- ${url}`).join('\n')
    : '- None';

  return [
    `## Release inputs`,
    '',
    `- Operator release: [${release.tag}](https://github.com/krkn-chaos/krkn-operator/releases/tag/${release.tag})`,
    `- Operator commit: \`${release.operator_commit}\``,
    `- Pinned website documentation commit: [\`${release.website_commit}\`](https://github.com/krkn-chaos/website/commit/${release.website_commit})`,
    `- Published chart: \`${release.chart_reference}:${release.helm_chart_version}\` (appVersion \`${release.tag}\`)`,
    `- Release published: ${release.published_at}`,
    '',
    '## Captured pages',
    '',
    ...pages,
    '',
    '## Transformations and preserved dependencies',
    '',
    '- Operator-internal links are rewritten into the pinned release tree.',
    '- Installation instructions use the verified published chart version and no live latest-version script.',
    '- Operator screenshots and local videos are stored with this release; roadmap data is copied when used.',
    '- The feedback form links to current feedback and the upstream issue tracker.',
    '- YouTube walkthroughs remain linked and are labeled as potentially showing an earlier interface.',
    `- External video dependencies:\n${dependencies}`,
    '',
    '## Review and preview',
    '',
    '- Review the generated production preview before merging; auto-merge is disabled.',
    '- Verify the selector, sidebar, legacy redirects, search index, print output, pinned installation commands, and captured media.',
    '- Integrity checks, focused tests, strict link checks, and the production build must pass before this PR opens.',
    '',
    `Snapshot record: \`${release.snapshot_record}\``,
  ].join('\n');
}

module.exports = {
  assertBootstrapInputsAllowed,
  assertSameReleaseProvenance,
  assertTrustedReleaseBranch,
  buildPullRequestBody,
  isBeforeAdoptionBoundary,
  mergeMainWithBotIdentity,
  prepareReleaseBranch,
  releaseBranchName,
  sameReleaseProvenance,
  selectExistingPullRequest,
  stageSnapshotChanges,
  shouldIgnoreReleaseAtAdoptionBoundary,
};
