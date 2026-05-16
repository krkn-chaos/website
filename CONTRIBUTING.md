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