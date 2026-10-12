# Krkn Operator documentation releases

Authors continue editing the Operator documentation under
`content/en/docs/krkn-operator/`. The Website captures those pages from a
release-pinned Website commit and publishes a frozen copy at
`/docs/krkn-operator/versions/<operator-tag>/` after a stable Operator release.
Versioned links stay on their release; existing unversioned links forward to
the newest stable snapshot that has been reviewed and deployed.

## What happens for each release

1. **The docs author updates the Website source.** Open a normal pull request
   to `krkn-chaos/website:main` from a branch named
   `docs/operator-source/vMAJOR.MINOR.PATCH`. The branch identifies the release
   for the merged-PR Action; prerelease suffixes are rejected. Edit files under
   `content/en/docs/krkn-operator/`; do not edit generated files under
   `versions/`. The source PR can add, remove, or rename pages and change
   layouts, images, and videos. Keep `operator_docs_page_key` in front matter
   when a renamed page should retain its previous identity.
2. **A maintainer merges the docs PR.** The Website Action reads the merged PR
   from GitHub, verifies its merge commit is in `main`, and creates an Operator
   metadata PR against the existing `release-MAJOR.MINOR` branch. It records
   the exact Website merge SHA and derives the chart version from the tag.
3. **A maintainer reviews and merges the generated Operator metadata PR before
   tagging the release.** The Action writes this tag-keyed mapping to
   `docs/website-release.yaml`, preserving previous entries:

   ```yaml
   schema_version: 1
   releases:
     - operator_tag: v1.1.0
       website_commit: "<full Website merge commit SHA>"
       helm_chart_version: "1.1.0"
   ```

   The chart version is the Operator tag without its leading `v`. The release
   receiver validates that the tag has a matching metadata entry. There is no
   manual SHA or chart-version copying. The merged metadata becomes part of
   the release commit, so the tag identifies its documentation source.
4. **The release maintainer publishes the stable Operator tag and chart** using
   the normal release process. Prerelease tags are not versioned. After chart
   publication succeeds, the Operator workflow automatically notifies the
   Website. A publication-completion notification also permits a retry if the
   release and chart become visible at different times. Duplicate notices reuse
   one snapshot PR. No one manually dispatches the normal release workflow.
5. **The Website receiver verifies the release inputs** from the tag, checks
   the pinned Website commit is in reviewed `main` history, and verifies the
   published chart and its `appVersion`. It captures the Markdown, images,
   roadmap data, and other supported dependencies from that exact Website
   commit, then opens or updates a snapshot PR.
6. **A Website reviewer checks and merges the snapshot PR.** Review its
   preview, page inventory, provenance, install commands, links, media,
   redirects, search, and print behavior. Auto-merge is disabled. Once the PR
   deploys, that release becomes the default if it is the newest published
   stable release.

The Website never infers the source commit from the current branch and never
refreshes an old snapshot from moving authoring files. Duplicate notifications
are safe. A missing or mismatched release, Website commit, or chart prevents a
partial snapshot PR from being created.

## Stable-only rollout and current docs

Only tags matching `vMAJOR.MINOR.PATCH` with no suffix are eligible, and
GitHub must report `prerelease: false`. Both checks are required because
GitHub currently reports some `v1.1.0-rc*` tags as non-prereleases; their `-rc`
suffix still excludes them.

The initial registry preserves the current `v1.0.0` documentation as a named,
frozen snapshot. It is captured from Website commit
`7c35229ddbec37d65ef6a9c53945443b6fa8bf6e`, the exact revision containing
those pages. The adoption boundary is the publication time of stable
`v1.0.10` (`2026-09-26T13:03:34Z`), so the automation will not reconstruct
other releases published at or before that point. It will not label 1.1 source
docs as 1.0 docs. Website PR #681 is the separate 1.1.0 authoring change.
Because v1.1.0 is already published without metadata, its source-merge Action
uses the reviewed merge commit as the one-time bootstrap input and verifies
the existing release and published chart through the same receiver. It never
rewrites the Operator tag. Bootstrap is closed once a release at or after the
adoption cutoff is captured; identical retries of a registered release remain
allowed. Its snapshot becomes the new default after the generated Website
snapshot PR is merged. Until then, unversioned links
resolve to the preserved v1.0.0 snapshot after the initial versioning PR is
deployed. Prereleases never appear in the selector.

Among merged snapshots, the default is selected by publication time and then
numeric GitHub release ID. An older release PR merged later cannot move the
default backwards. The GitHub `latest` flag and alphabetical tag order are not
used.

## One-time setup and merge order

The automation becomes active after the Website receiver and Operator release
workflows are merged and the GitHub App is configured in both repositories.
Install the App for both `krkn-chaos/website` and `krkn-chaos/krkn-operator`
with Contents and Pull requests write permissions. The Website Action creates
the Operator metadata PR; the receiver creates the Website snapshot PR. The
Operator notifier requests only Website Contents write for dispatch. Configure the existing
`DOC_SYNC_BOT_APP_ID` variable and `DOC_SYNC_BOT_APP_PRIVATE_KEY` secret as
required by each workflow; do not substitute a personal access token.

For the initial rollout, merge the Website versioning PR with the preserved
v1.0.0 snapshot and deploy its receiver first. Configure and test the App, then
merge the Operator notifier PR. The stable version lookup fix in Website PR
#660 is independent and may merge separately. After #680 is merged and
deployed, rebase source PR #681 onto updated `main`, review its preview, and
merge it. That merge automatically prepares the initial 1.1.0 snapshot PR.
For subsequent releases, merge the generated Operator metadata PR before
creating the tag, then review and merge the generated Website snapshot PR.

## Local previews and checks

Use the supported npm commands so snapshot integrity and generated mounts are
prepared:

```text
npm run check:operator-docs
npm run test:operator-docs
npm run test:operator-docs:site
npm run build:production
NETLIFY=false LINK_CHECK_SOFT_FAIL=0 npm run check:links
```

`npm run preview:operator-source` is labeled as an unpublished authoring
preview. Use a prepared production or deployment preview to verify the
published experience. A raw `hugo` invocation bypasses snapshot preparation
and integrity checks.

## Retries, corrections, and rollback

If an Action fails, its summary and logs identify the missing prerequisite.
Fix that issue and rerun the same workflow for the same tag. To retry metadata
preparation, run `Prepare Operator release documentation metadata` with the
merged source PR number; no source SHA or chart-version input is needed. The receiver
retries temporary release or chart publication delays and does not open a
partial snapshot PR. A tag already registered with different provenance fails
rather than being overwritten or retagged.

Normal website builds validate snapshots and never regenerate them. A content
correction requires a reviewed Website PR that updates the affected captured
content or data, recalculates integrity hashes, and adds a correction record
with the time, affected paths, and reason. Preserve the original source
commits. For a deployment failure, restore the previous successful deployment
and keep published snapshots. To hold back the default, make an explicit
reviewed registry change.

The capture pipeline permits the `notice` and `roadmap` shortcodes and captures
roadmap data and known Operator assets when used. Extend the capture logic and
integrity tests before adding another shortcode, parameter/CRD file, local
media location, or other mutable dependency. Old snapshots must not fetch
current data during builds.
