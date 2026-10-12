# Operator documentation release versioning

Date: 2026-10-08. Status: approved implementation design.

## Goal and reader behavior

Add a version selector only to Krkn Operator documentation. It appears above the Operator sidebar on every versioned Operator page. The default is the most recently published stable Operator release by publication timestamp. A reader can switch to another stable release and stay on the corresponding article when that page exists; otherwise the page opens that release's overview with a clear fallback label.

Published URLs live below `/docs/krkn-operator/versions/<release-tag>/`. Existing unversioned Operator URLs forward to the current default snapshot after versioning is enabled. A shared versioned URL remains pinned to its tag. Cross-version selection opens the article at its top; incoming fragments continue to work on an unversioned redirect when the destination article exists.

## Authoring and published content

Authors and the documentation sync bot keep using `content/en/docs/krkn-operator/`. This moving tree is source material, not production documentation once the first release snapshot is registered. Release snapshots are separately stored at `content/en/docs/krkn-operator/versions/<tag>/`; release roadmap data and images are also release-owned.

Build preparation validates each snapshot's inventory and hashes, creates a temporary Hugo configuration, excludes the moving Operator tree, mounts release snapshots, and mounts generated compatibility redirects at the unversioned paths. Before any snapshot is registered, the existing content configuration remains active so infrastructure can roll out without removing Operator documentation. Normal builds never regenerate or update snapshots.

Each snapshot is captured from the full website commit explicitly pinned by the Operator release metadata. Capture preserves article structure and route identity, rewrites internal Operator links and local images, pins the installation page to the separately verified published Helm chart version, and captures mutable roadmap data. Unsupported mutable dependencies fail the capture. A reviewed integrity record stores provenance, source and output hashes, inventory, and captured dependencies.

## Release registry and default selection

`data/operator_doc_versions.yaml` records only published, non-draft stable releases whose website snapshot PR has been merged. A stable tag must match `vMAJOR.MINOR.PATCH` with no suffix, and GitHub must report `prerelease: false`. Entries include the GitHub release ID and publication timestamp, exact Operator and Website commits, chart version/reference, capture timestamp, and snapshot record path. The default is derived from greatest `published_at`, with numeric release ID as a tie breaker. Tags are never sorted alphabetically, the GitHub `releases/latest` endpoint is not used, and no manually maintained latest pointer exists. Merging an older release PR later cannot move the default backwards. GitHub currently marks some `v1.1.0-rc*` releases as non-prereleases, so the tag-shape check is required too.

The UI displays the exact stable release tag and does not make support-policy claims. Snapshot retention and support policy are separate decisions.

## Release automation

The Operator release commit carries `docs/website-release.yaml` with a full Website merge commit SHA and the chart version. Merging a Website source PR from `docs/operator-source/vMAJOR.MINOR.PATCH` automatically prepares a tag-keyed metadata PR against the existing Operator `release-MAJOR.MINOR` branch. A maintainer reviews and merges it before creating the tag; no manual SHA copying is required. After release and chart publication, the Operator workflows dispatch `operator-docs-release-ready` to the canonical Website repository. The receiver fetches authoritative metadata, verifies the stable release, tag metadata, Website commit ancestry, and published chart package, then captures content using trusted code from the Website default branch. The dispatch payload supplies only the tag.

The receiver opens or updates one deterministic Website PR per tag. The PR contains the snapshot and registry entry and runs integrity checks, tests, and a production build. Auto-merge is disabled; maintainers review and merge. Duplicate notifications are idempotent, and changed provenance for an existing tag fails safely. Publication failures leave current site output unchanged. The initial rollout explicitly preserves the current `v1.0.0` docs from Website commit `7c35229ddbec37d65ef6a9c53945443b6fa8bf6e`. The registry also records the inclusive `v1.0.10` adoption cutoff, so unregistered releases at or before that date are not reconstructed. The first normal automated snapshot is the next eligible stable release after the cutoff, expected to be `v1.1.0`.

## Navigation, search, and rendering

The selector is a labeled native select with an explicit Go button and ordinary links as a no-JavaScript fallback. It is scoped to Operator snapshots and shows only the selected release's navigation plus an All documentation link. Docsy behavior for other documentation remains intact; its section-tree cache must be bypassed for versioned Operator navigation.

Older snapshots show a compact notice linking to the default version and explain that site-wide search covers current documentation. Browser and chatbot search indexes contain only the default Operator snapshot. The chatbot is omitted on older releases. Version context is used for breadcrumbs, source-at-commit links, capture provenance, print output, and release-specific roadmap data. A missing captured roadmap is an error; it never falls back to current data. Combined site print output includes only the default Operator snapshot.

## Boundaries and rollout

Do not reconstruct intermediate older releases, redesign the Operator landing page, add videos, alter unrelated product documentation, fork Docsy, or change the chatbot request schema. Preserve the specifically requested `v1.0.0` documentation baseline from its pinned Website commit; use the stable `v1.0.10` publication time as the inclusive cutoff for automatic adoption and start normal snapshots with the next stable release after it. Keep Website and Operator changes in separate repositories and PRs. Do not deploy or merge during implementation without separate authorization.

While the registry is empty, current Operator behavior stays available. Existing URLs begin forwarding only after the first stable snapshot PR is reviewed, merged, and deployed.
