# How to Contribute

We'd love to accept your patches and contributions to this project. There are
just a few small guidelines you need to follow.

## Developer Certificate of Origin (DCO)

This project uses DCO sign-off instead of a CLA. All commits must be signed off
by adding `-s` to your commit command:

```bash
git commit -s -m "your commit message"
```

This adds a `Signed-off-by` line to your commit certifying that you wrote the
change and have the right to submit it under the project license. CI will block
your PR if any commit is missing the sign-off.

## Code Reviews

All submissions, including submissions by project members, require review. We
use GitHub pull requests for this purpose. Consult
[GitHub Help](https://help.github.com/articles/about-pull-requests/) for more
information on using pull requests.

## Community Guidelines

This project follows
[Google's Open Source Community Guidelines](https://opensource.google.com/conduct/).

---

## Local Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v20 or later
- **npm** v9 or later
- **Go** v1.21 or later (required by Hugo modules)
- **Hugo Extended** v0.146.0 or later

### Installation

1. Fork and clone the repository:

```bash
git clone https://github.com/<your-github-username>/website.git
cd website
```

2. Add the upstream remote:

```bash
git remote add upstream https://github.com/krkn-chaos/website.git
```

3. Install dependencies:

```bash
npm install
```

### Running the Local Development Server

```bash
npm run dev
```

This starts a Hugo development server at `http://localhost:1313` with live reload enabled.

### Building the Site

```bash
npm run build
```

The built site will be output to the `public/` directory.

### Running the API Server Locally

```bash
cd api
npm install
npm start
```

The API server starts at `http://localhost:3001` by default.

### DCO Sign-off

All commits must be signed off to satisfy the [Developer Certificate of Origin (DCO)](https://developercertificate.org/). Use the `-s` flag when committing:

```bash
git commit -s -m "your commit message"
```

### Branch Naming Convention

Create a new branch from `main` for every contribution:

```bash
git checkout main
git pull upstream main
git checkout -b krkn/<your-feature-or-fix>
```

### Submitting a Pull Request

1. Push your branch to your fork
2. Open a Pull Request against `krkn-chaos/website:main`
3. Fill in the PR template with a clear description of your changes
4. Ensure all CI checks pass before requesting a review

---

## Scenario Page Markers

Every scenario page under `content/en/docs/scenarios/` declares which krkn-hub scenario it
documents. The declaration is a marker in `_index.md`, placed under the front matter and
wrapping the page's descriptive content:

```html
<krkn-hub-scenario id="node-scenarios">

This scenario disrupts the node(s) matching the label or node name(s) on your cluster.

</krkn-hub-scenario>
```

The `id` is the krkn-hub directory name for that scenario. The wrapper does not show up on the
rendered page, and the prose inside it renders normally.

This marker is how [krkn-doc-sync-bot](https://github.com/krkn-chaos/docsync-bot), the app that
opens the `[docs-sync]` pull requests on this repo, finds which page documents which scenario.
If it is missing or points at the wrong scenario, the generated parameter tables land on the
wrong page.

### One id, one page

An id names a single krkn-hub scenario, so exactly one page may claim it. Two pages claiming
the same id means the docs disagree about which page owns that scenario, and the bot has no
way to pick.

Some pages document a real scenario but run another page's image with different parameters.
Those pages do not own the id, so they say so instead of claiming it. This is the opt-out on
`aurora-disruption`:

```html
<!-- krkn-hub-scenario: none. This page runs the pod-network-filter image with
     parameters tuned for AWS Aurora. The id belongs to
     /docs/scenarios/network-chaos-ng-scenarios/pod-network-filter/ which documents the
     image itself. Adding a marker here would make the id ambiguous and fail CI. -->
```

The reason is required. A bare `<!-- krkn-hub-scenario: none -->` is rejected, because an
unexplained absence is exactly the ambiguity this is meant to prevent. A reader should never
have to guess whether a marker was left out on purpose or simply forgotten.

To find the current opt-outs and read why each one is there, grep for them:

```bash
grep -rl "krkn-hub-scenario: none" content/en/docs/scenarios/
```

### Check before you push

```bash
python scripts/check-scenario-markers.py
```

Standard library only, no dependencies. It enforces three rules:

1. One page per id.
2. One marker per page. Only the first is ever read, so a second one is dead.
3. A page with no marker carries an opt-out that gives a reason.

A page counts as a scenario page when its directory holds `_tab-*.md` files, so section
landing pages are skipped. The same check runs in CI on any pull request touching
`content/en/docs/scenarios/`.
