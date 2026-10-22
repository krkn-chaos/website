# Krkn Operator documentation releases

## Where authors edit and what readers see

Authors prepare the next release in the Website repository under
`content/en/docs/krkn-operator/`. That tree is the editable source. In
production builds with registered snapshots, Hugo excludes it from the public
site and mounts the frozen release trees found under
`content/en/docs/krkn-operator/versions/`. Navigation, browser search, chatbot
search, and printed documentation use the published snapshots, not the moving
authoring tree.

The source files remain in GitHub so authors can update them. They are not
published just because their Website PR is merged. The local command
`npm run preview:operator-source` is explicitly labeled as an unpublished
authoring preview.

Netlify deploy previews make these edits reviewable before release: the
editable source appears at the ordinary, unversioned Operator URLs, with an
"Upcoming Operator documentation preview — not published" notice. Browser
search includes the editable source, and the documentation assistant is hidden
on these pages because it uses published documentation. Registered release
URLs remain mounted from their frozen snapshots. For example, while
preparing v1.2.0, inspect the roadmap at
`<deploy-preview-url>/docs/krkn-operator/releases/`; the page at
`<deploy-preview-url>/docs/krkn-operator/versions/v1.1.0/releases/` continues
to show the captured v1.1.0 roadmap. Production builds do not enable this
preview mode: source pages stay hidden and unversioned links redirect to the
newest published stable snapshot.

Previously shared unversioned URLs keep working through generated redirect
pages that send readers to the corresponding article in the newest published
stable snapshot, or its overview if the article is unavailable. Those pages
are compatibility redirects, not copies of the authoring sections. Versioned
URLs stay pinned, for example:

```text
/docs/krkn-operator/versions/v1.0.0/usage/jobs/
/docs/krkn-operator/versions/v1.1.0/usage/jobs/
```

Only stable tags matching `vMAJOR.MINOR.PATCH` are captured. GitHub must also
report that the release is not a prerelease; the tag check excludes RC tags
even if GitHub mislabels them.

## Flow for a new release, such as v1.2.0

1. **Prepare the Website source.** For v1.2.0, authors edit the docs, media,
   and page structure under `content/en/docs/krkn-operator/`. They can use any
   branch names and merge as many normal Website PRs as needed to finish this
   release. Those PRs do not need a special name or release label: the bot
   reads the whole authoring tree from Website `main`. Do not create or change
   `content/en/docs/krkn-operator/versions/v1.2.0/`; the bot generates that
   folder. A renamed page can keep its previous selector identity by retaining
   its `operator_docs_page_key` front matter.
2. **Review and merge the source PRs.** Merging makes the authoring changes
   available in Website Git history, but production still serves the already
   published snapshots. The source is not shown to website readers.
3. **Publish Operator v1.2.0 and its chart.** This is the normal Operator
   release. Once the chart publication succeeds, the Operator workflow
   automatically dispatches the release tag to the Website receiver. No one
   supplies a Website SHA or chart version manually.
4. **The Website bot resolves and validates the source.** It pins the current
   Website `main` commit and uses that exact commit to read the authoring tree.
   The SHA is recorded in the generated snapshot PR; no one supplies it
   manually. The bot checks the stable Operator release and verifies the
   published chart version and `appVersion`.
5. **The Website bot opens a snapshot PR.** It captures the docs and supported
   dependencies from that exact Website merge commit, writes the v1.2.0
   snapshot and integrity record, and opens or updates one PR on
   `docs/operator-release/v1.2.0`. It runs the integrity checks, tests, strict
   link check, and production build before opening a ready-for-review PR.
6. **Review and merge the snapshot PR.** A Website maintainer checks the
   preview, pages, navigation, media, install commands, redirects, search, and
   print output, then merges it. After deployment, v1.2.0 appears in the
   selector. It becomes the default only if it is the newest published stable
   release. Earlier snapshots and their URLs remain unchanged.

The team works on one Operator documentation release at a time. After the bot
captures v1.2.0, keep the authoring tree unchanged until the generated v1.2.0
Website snapshot PR is reviewed and merged. Then start preparing the next
release in the same authoring tree. The bot does not need to identify a
particular source PR or handle two releases' authoring content at once. The
human work is to prepare and review the source PRs, create the normal Operator
release, and review the generated Website snapshot PR. There is no metadata PR
in the Operator repository and no manual copying into a version directory.

## Existing and corrected versions

The registry starts with the preserved v1.0.0 snapshot from Website commit
`7c35229ddbec37d65ef6a9c53945443b6fa8bf6e`. Its adoption boundary is stable
release v1.0.10, published at `2026-09-26T13:03:34Z`; unregistered releases at
or before that time are not reconstructed. The newer v1.1 source docs are not
relabelled as v1.0. If the source PRs and stable release already exist, the
tag-only workflow can be rerun to prepare its snapshot without changing the
Operator tag.

To correct an already published version, open a Website PR that edits only
that release's archived content under
`content/en/docs/krkn-operator/versions/vX.Y.Z/` and its release-owned data or
assets under `data/operator_docs/releases/vX.Y.Z/` or
`static/operator-docs/vX.Y.Z/`. Update
`operator-docs/snapshots/vX.Y.Z.json` hashes and add a correction record with
the time, reason, and affected paths. Preserve the original source commits and
provenance. If the correction should also apply to future releases, separately
make the same change in the editable authoring tree. A correction PR does not
change the default version.

## Automation setup and retries

The Website receiver runs trusted code from Website `main` and reads
documentation from the pinned Website `main` commit. Install the
documentation GitHub App on `krkn-chaos/website` and `krkn-chaos/krkn-operator`
with the repository permissions required by each workflow. Configure the
existing `DOC_SYNC_BOT_APP_ID` variable and
`DOC_SYNC_BOT_APP_PRIVATE_KEY` secret. The Website workflow needs Contents and
Pull requests write permission to open its snapshot PR. Do not use a personal
access token fallback.

The Operator notifier dispatch payload contains only `operator_tag`; the
Website fetches release, current source commit, and chart data itself. Duplicate
notifications reuse the same deterministic Website branch and PR. If
automation fails, fix the prerequisite named in the workflow summary and rerun
`Prepare Operator documentation release PR` with the same tag. The manual
workflow accepts only the tag; source commit and chart inputs are still
resolved and verified automatically.

## Local checks

Use the supported npm commands so Hugo receives the generated content mounts
and snapshot validation:

```text
npm run check:operator-docs
npm run test:operator-docs
npm run test:operator-docs:site
npm run build:production
NETLIFY=false LINK_CHECK_SOFT_FAIL=0 npm run check:links
```

A raw `hugo` command bypasses snapshot preparation and integrity checks. The
`preview:operator-source` command is only for authors to inspect unpublished
source locally. In a Website PR deploy preview, use unversioned Operator URLs
to review pending source edits and versioned URLs to verify archived releases.
Use a production build to check what public readers will see.
