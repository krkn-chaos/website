# Operator documentation release versioning — implementation plan

## Execution status — 2026-10-09

- Website infrastructure is on local branch `operator-docs-versioning` in
  `/Users/sahil/website-1`, updating PR #680. Operator integration is separate
  in `/private/tmp/krkn-operator-docs-fixes`, updating PR #158.
- Stable tags only: both `prerelease: false` and `vMAJOR.MINOR.PATCH` are required.
- Frozen v1.0.0 preserves Website commit `7c35229ddbec37d65ef6a9c53945443b6fa8bf6e`.
  The inclusive v1.0.10 adoption cutoff is `2026-09-26T13:03:34Z`.
- Source PR #681 prepares v1.1.0 in the editable authoring tree. The published
  v1.1.0 tag predates metadata; its source merge triggers the initial bootstrap
  automatically. Never assign the new source pages to the v1.0.0 snapshot.
- Merged source PRs automatically prepare Operator metadata PRs targeting
  `release-MAJOR.MINOR`. Humans review and merge before release tagging.
- Production rendering and strict link verification passed: 342 pages and
  301 links with no broken links. Local tests are rerun before pushing.
- Beads is a local-machine tracker, with no remote synchronization configured.
- Keep the repository PRs separate. Do not merge, deploy, or wait for GitHub CI.

The release handover in [`docs/operator-docs-versioning.md`](../../operator-docs-versioning.md)
describes source review, generated metadata PRs, publication notifications, and
reviewed snapshot PRs.

This plan implements the approved design in [the companion specification](../specs/2026-10-08-operator-docs-versioning-design.md). The detailed user-provided final plan is authoritative for requirements; this file records its execution order and repository handoff.

## Constraints

- Preserve authoring files at `content/en/docs/krkn-operator/`; do not reconstruct older releases.
- Use canonical repositories `krkn-chaos/website` and `krkn-chaos/krkn-operator`, regardless of local fork remotes.
- Use Node 20 CommonJS, existing `yaml` and `cheerio`, Hugo Extended 0.146.0, Docsy v0.12.0, and no new test framework.
- Keep a release snapshot immutable during normal builds. Fail on unverified/missing inputs or unsupported mutable dependencies.
- Admit only tags matching `vMAJOR.MINOR.PATCH` and GitHub releases with `prerelease: false`. Derive the default among merged entries by publication time and numeric release ID; never use `/releases/latest` or alphabetic tag ordering.
- Keep site-wide search on the default Operator snapshot. Preserve all other products' content, navigation, search, and print behavior.
- Keep the Operator repository changes separate from website changes. No merge or deployment is part of implementation.
- For future releases, merge the Website authoring PR first, then review and merge
  the generated Operator metadata PR before tagging. The generated
  snapshot PR continues using `docs/operator-release/<tag>`.

## Task 1 — Baseline, repository instructions, and planning artifacts

- Inspect working-tree changes and preserve unrelated files. Read `RTK.md` when present; if the `AGENTS.md` reference cannot be resolved, record that fact.
- Confirm the pinned toolchain, Hugo configuration, Docsy version, hooks, search indexes, link checker, workflows, Operator source paths, shortcodes, images, videos, custom scripts, aliases, and URL overrides.
- Run the baseline production build and strict link check. Record environmental failures separately from source failures.
- Replace superseded planning decisions in this plan and its companion specification with the approved design: release snapshots become production content; unversioned links forward to the derived default; release automation captures an explicitly pinned website commit; no support-policy badges or historical reconstruction.
- Keep Operator source changes in a separate checkout/PR.

**Deliverable:** current baseline and planning documents reflect the final decisions.

## Task 2 — Registry and stable page identity

Create `data/operator_doc_versions.yaml`, `scripts/lib/operator-docs.js`, and `scripts/tests/operator-docs.test.js`; update `.gitignore` and `package.json`.

- Start with `{ schema_version: 1, releases: [] }`.
- Parse YAML using the existing dependency. Reject duplicate or unsafe tags, invalid timestamps, hashes, snapshot paths, and inconsistent metadata.
- Select defaults by descending `published_at`, then descending numeric GitHub release ID. Do not sort tags lexically and do not store a latest pointer.
- Derive stable page keys from relative Markdown paths. `_index.md` maps to the overview key `""`; section indexes map to their directory; explicit `operator_docs_page_key` preserves identity across rename. Reject unsafe and duplicate keys.
- Add ignore exceptions narrowly around the new scripts/tests and ignore only `.cache/operator-docs/`.
- Add focused Node test commands.

**Deliverable:** tested registry and identity contract.

## Task 3 — Authoritative release input verification

Create `scripts/lib/operator-release-inputs.js` and focused tests; expose `resolveReleaseInputs` through the core helper.

- Fetch the exact published, non-draft Operator release and resolve its tag to a commit.
- Read `docs/website-release.yaml` at that tag. Select the record whose `operator_tag` exactly matches the tag, validate the schema, full Website SHA, and chart version. The one-time `v1.0.0` baseline is already pinned to its source commit and verified chart; normal automation ignores unregistered releases at or before the `v1.0.10` adoption cutoff.
- Verify the website commit exists in canonical `krkn-chaos/website` and belongs to reviewed default-branch history.
- Fetch the explicitly versioned published OCI Helm chart and verify chart metadata maps to the requested Operator tag. Do not treat the source `Chart.yaml` as published chart evidence.
- Record release ID, publication timestamp, Operator commit, website commit, chart reference/version, and evidence.
- Use argument arrays for subprocesses. Retry temporarily missing release/chart inputs for at most five minutes; then fail with the missing prerequisite and create no partial PR.

**Deliverable:** release preparation accepts only verified, pinned inputs.

## Task 4 — Frozen snapshot capture and integrity

Create `scripts/snapshot-operator-docs.js`; extend the core helper and unit tests.

- Read Markdown and data from the pinned Git commit, never the working tree. Exclude the existing `versions/` subtree.
- Preserve page structure, titles, descriptions, and ordering. Reject unsafe paths, symlinks, URL overrides that change routes, alias collisions, and duplicate page keys.
- Copy historical Operator images under `static/operator-docs/<tag>/images/krkn-operator/`; capture historical roadmap YAML when the roadmap shortcode is present.
- Audit media and shortcode/data dependencies. Allow `notice` and `roadmap`; reject unknown mutable dependencies with source location.
- Build and validate the full output plan before writing. Refuse different-content overwrite of an existing tag; identical retries are no-ops. Roll back only files created by a failed capture.
- Write snapshots under `content/en/docs/krkn-operator/versions/<tag>/`, captured roadmap under `data/operator_docs/releases/<tag>/roadmap.yaml`, and provenance/hash/inventory data under `operator-docs/snapshots/<tag>.json`.
- Normal builds validate capture records and never regenerate old snapshots.

**Deliverable:** complete release-owned content and dependencies with auditable hashes.

## Task 5 — Snapshot link and installation transformations

Extend capture and tests.

- Rewrite Markdown destinations and HTML `href`/`src` attributes using a syntax-aware scanner. Preserve prose, fenced/inline code, unrelated products, external URLs, same-version queries/fragments, and structurally valid relative links.
- Rewrite Operator links into the tag's version tree and screenshot references into the release-owned static path. Validate permission-badge targets against captured overview anchors.
- Remove the captured installation page's `/js/krkn-operator-version.js`; replace `<VERSION>` and loading markers with the verified chart version, and label it as the Helm chart version for that release.
- Keep YouTube URLs and add the specified context caption. Replace archived feedback forms with explicit current feedback and upstream issue links.
- Reject unreviewed custom scripts or unhandled mutable references with a source location.

**Deliverable:** archived instructions and links remain tied to the selected release.

## Task 6 — Prepared Hugo mounts and compatibility redirects

Create `scripts/prepare-operator-docs.js`, `scripts/hugo-with-operator-docs.js`, `scripts/finalize-operator-docs.js`, and redirect layouts.

- With an empty registry, leave the current content configuration intact. With snapshots, validate all records and generate a temporary Hugo configuration that preserves existing modules/settings while excluding the moving Operator tree, mounting release snapshots, and mounting generated redirects at unversioned routes.
- Generate redirects for routes in snapshots and current authoring content. Send corresponding pages to the default release; use its overview for unavailable pages. Keep the unversioned Operator root as the global navigation entry.
- Hide redirect children from navigation, search, and summaries. Provide canonical/no-index metadata, visible fallback links, and local browser forwarding. Preserve fragments only for matching articles; discard on overview fallback.
- After static Hugo builds, append exact temporary Netlify `302` routes to `public/_redirects`, retaining existing API/function rules and handling slash variants. Never catch versioned paths or use permanent redirects.
- Clear only `.cache/operator-docs/`. Forward all Hugo arguments unchanged. Finalize only successful static builds.

**Deliverable:** production uses frozen snapshots and old links resolve safely.

## Task 7 — Consistent build, authoring preview, and link checking

Modify `package.json` and `scripts/check-links.js`; add `config/operator-docs-authoring.yaml`.

- Route production, preview, development server, and link-check server through prepared Hugo inputs while preserving current baseURL, environment, minify, and arguments.
- Add a local authoring preview that mounts the moving source and visibly identifies it as unpublished.
- Keep authoring config out of deployment commands. Document that raw Hugo bypasses preparation and integrity checks.
- Preserve Netlify functions and post-build behavior.

**Deliverable:** every supported build path uses the intended content source.

## Task 8 — Scoped version selector and sidebar

Create Operator context/targets/selector/sidebar partials, local Docsy sidebar dispatch partials, `static/js/operator-docs-selector.js`, and `assets/scss/_operator_versions.scss`; update the active body hook and project SCSS entry.

- Resolve only exact Operator ancestry and snapshot metadata. Corresponding links use stable page keys and actual Hugo `RelPermalink` values. Missing pages fall back to the release overview and are labeled.
- Render releases newest first, with one selected release and the derived default marked “Latest”. Use a labeled native select and explicit Go button; provide no-JavaScript links and never navigate on arrow-key exploration.
- Place the selector above the Operator sidebar and keep it visible when mobile section navigation is collapsed. Show only selected-release navigation and an All documentation link.
- Preserve Docsy navigation outside Operator docs, hide the archive container globally, and bypass first-section tree cache for versioned Operator sections.
- Use existing light/dark theme tokens and visible focus styles. Load selector JavaScript only on versioned Operator pages.

**Deliverable:** accessible, product-scoped switching with release-correct navigation.

## Task 9 — Context, provenance, roadmap, and print behavior

Add the context banner, page metadata, breadcrumb, print overrides, and archive-aware roadmap behavior.

- Identify the selected release near the article heading. Older versions show a compact notice linking to the default and explain that site-wide search covers current documentation. Do not call all frozen releases unsupported.
- Remove the internal `versions` container from breadcrumbs. Link source to the pinned website commit and original authoring path; suppress edit/create-child links for frozen content.
- Show capture/source provenance rather than archive-file Git timestamps. Resolve roadmap data only from the selected release and fail if it is absent.
- Include provenance in direct release print output. Combined print uses the default Operator snapshot and excludes other Operator versions.
- Override only the pinned Docsy partials that need dispatch/filtering.

**Deliverable:** article, data, source, and print context matches the selected tag.

## Task 10 — Current-only browser search and chatbot

Update the local offline-search template override, `scripts/build-search-index.js`, and the active body hook.

- Include only the default Operator snapshot in Docsy browser search and the separate chatbot index. Exclude older snapshots, redirects, and authoring sources; preserve other products.
- Make the custom indexer importable for tests without auto-running its CLI. Use canonical versioned URLs for the default snapshot.
- Keep chatbot on the default release, omit it on older versions, and link older-version notices to current documentation where it is available. Do not change chatbot request schemas.

**Deliverable:** old snapshots do not duplicate current search results or receive unqualified assistant answers.

## Task 11 — Cross-repository release notification and metadata validation

Operator repository changes (separate checkout): tag-keyed
`docs/website-release.yaml`, release/chart preflight, and a notifier that runs
after successful chart publication. Website changes:
`.github/workflows/operator-docs-release.yml`,
`scripts/lib/operator-release-inputs.js`, `scripts/operator-docs-release-pr.js`,
and focused tests.

- The docs author opens a normal Website PR to `krkn-chaos/website:main`. After
  it merges, the Website Action opens an Operator metadata PR recording its full
  merge SHA and matching chart version against `release-MAJOR.MINOR`.
- The receiver rejects prerelease tags and stable tags with missing or
  mismatched metadata. Merge the metadata PR before the release tag is
  created; automation never rewrites an existing tag.
- The default-branch chart-completion listener sends `operator-docs-release-ready`
  after publication succeeds. The Website receiver independently verifies
  the published release, tag metadata, pinned Website commit, and chart before
  capture. The notification payload supplies only the tag.
- Use a GitHub App token to dispatch to the canonical Website repository. Do
  not fall back to a PAT. Keep workflow code on trusted default branches and
  verify App permissions before enabling notifications.
- Keep the Website snapshot branch deterministic as
  `docs/operator-release/<tag>` and open one reviewed snapshot PR per tag.
  Include provenance, chart mapping, inventory, transformations, tests, and
  preview expectations. Auto-merge stays disabled.
- Make duplicate notifications no-op/update; identical merged snapshot
  provenance exits successfully; changed provenance for an existing tag
  fails. Older PRs preserve newer registry entries and cannot move the
  default backwards.
- Seed only the requested `v1.0.0` baseline from its pinned Website commit.
  Keep the stable `v1.0.10` publication time as an inclusive adoption
  boundary for normal automation. Do not capture `v1.1.0-rc*` or reconstruct
  intermediate historical releases; the next normal snapshot is the first
  eligible stable release after the boundary.

**Deliverable:** each eligible stable publication prepares one reviewed
Website snapshot PR without publishing a prerelease or relabeling newer docs.

## Task 12 — CI, maintainer guide, and final verification

Create `docs/operator-docs-versioning.md`; update Hugo build and link-check workflows and path filters.

- Add unit, automation, integrity, and isolated generated-site checks. Use synthetic releases only in fixtures.
- Verify selector scoping, sidebar isolation, missing-article fallback, link/fragment behavior, exact redirects, API rule preservation, no authoring leakage, immutable content/data/media, installation pinning, browser/chatbot search policy, provenance, print traversal, preview baseURL, and no-JavaScript switching.
- Document the Website source PR, automatically generated metadata PRs, automated
  post-publication notification, generated snapshot PR, stable-only boundary,
  pinned Website commits, chart validation, retry, correction, rollback,
  local authoring preview, and dependency-extension rules.
- Review desktop/mobile, light/dark, keyboard/screen-reader label, back/forward, deep links, screenshots/video, and release PR preview when available.
- Run `npm run check:operator-docs`, `npm run test:operator-docs`, `npm run test:operator-docs:site`, `npm run build:production`, `NETLIFY=false LINK_CHECK_SOFT_FAIL=0 npm run check:links`, and `git diff --check`.

**Deliverable:** reviewed, documented implementation with a verified real release selectable, or a precise factual/credential blocker explicitly reported. Never deploy or merge as part of this implementation.
