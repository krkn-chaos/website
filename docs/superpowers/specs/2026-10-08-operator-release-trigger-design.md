# Operator release to Website snapshot flow

Date: 2026-10-14. Status: approved release-first flow.

## Sources of truth

The editable Website source for an upcoming release remains under
`content/en/docs/krkn-operator/`. Authors can use any branch name and open
multiple normal PRs to `krkn-chaos/website:main`. They do not create or edit a
`versions/<tag>/` snapshot by hand. Once snapshots exist, production Hugo
builds exclude the authoring tree and render pages only from the registered
release snapshots under `content/en/docs/krkn-operator/versions/`. Generated
unversioned routes are redirect stubs for old links; they never render the
moving source.

After the source PRs are reviewed and merged, the corresponding stable
Operator tag and its Helm chart are published through the existing release
process. The Website receiver pins the current `main` commit when it processes
the release notification; that full SHA is the documentation pin. The team
works on one Operator documentation release at a time and keeps the authoring
tree unchanged until that release's snapshot PR is merged. Chart version is derived from
the stable Operator tag by removing its leading `v`, then verified against the
published chart's `version` and `appVersion`. No manually maintained
`docs/website-release.yaml` is involved.

## Event flow

1. Humans prepare and merge any number of ordinary Website source PRs for the
   one upcoming release before the Operator release. They can use any branch
   names; branch names and individual PR identities are not release inputs.
   The changes accumulate under `content/en/docs/krkn-operator/`.
2. The Operator release and chart publish. After successful chart publication,
   the Operator workflow dispatches `operator-docs-release-ready` with only
   `{ operator_tag: "v1.2.0" }` to the canonical Website repository.
3. The Website receiver verifies a published, non-draft stable release and the
   published chart. It resolves the current Website `main` commit and verifies
   it belongs to reviewed default-branch history.
4. The receiver reads docs and captured assets from that exact commit, validates
   the snapshot, and opens or updates the deterministic Website branch
   `docs/operator-release/<tag>`.
5. A human reviews and merges the generated Website snapshot PR. The site
   deploys that frozen version; the default changes only when it is the newest
   stable release by publication time and release ID. Only after this PR is
   merged do authors begin preparing the next Operator release's docs.

The Operator notifier payload does not carry a commit or chart version. The
Website fetches the current default-branch commit and authoritative release and
chart data itself. Invalid release/chart data, a missing or unreviewed Website
commit, or mutable dependencies fail closed before the snapshot PR is opened.
A failed run can be retried by tag after the issue is fixed; no SHA or chart
inputs are typed manually. Duplicate notifications reuse the same branch and
PR. Changed provenance for a tag already captured fails rather than replacing
the archive.

## Stable adoption and corrections

Only tags of the form `vMAJOR.MINOR.PATCH` with `prerelease: false` are
eligible. The tag-shape check excludes RC tags even if GitHub labels them as
stable. The initial registry preserves v1.0.0 from Website commit
`7c35229ddbec37d65ef6a9c53945443b6fa8bf6e` and skips unregistered releases at
or before the v1.0.10 adoption cutoff (`2026-09-26T13:03:34Z`).

Normal builds never regenerate an older snapshot from current authoring
content. Corrections are reviewed Website PRs that update that version's
archived pages, captured dependencies, integrity hashes, and correction record
while preserving the original source provenance. The same text can separately
be changed in the authoring tree for future releases.

## Security and operational requirements

Workflow code runs from trusted Website `main`; documentation content and
captured dependencies are read from the pinned Website `main` commit. The website uses
the configured GitHub App to open its PR. Auto-merge stays disabled. The
release PR describes exact source and release identifiers, the page inventory,
transformations, checks, and preview expectations. Live output changes only
after review and merge of that Website PR.
