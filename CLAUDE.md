<p align="center">
  <img src="./static/img/readme-banner.svg" alt="Krkn - Chaos Engineering for Kubernetes" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/krkn-chaos/website/releases"><img src="https://img.shields.io/github/v/release/krkn-chaos/website?style=flat-square&color=0E58A0&label=release" alt="Release"></a>
  <a href="https://github.com/krkn-chaos/website/stargazers"><img src="https://img.shields.io/github/stars/krkn-chaos/website?style=flat-square&color=EC1C24" alt="Stars"></a>
  <a href="https://github.com/krkn-chaos/website/network/members"><img src="https://img.shields.io/github/forks/krkn-chaos/website?style=flat-square&color=334155" alt="Forks"></a>
  <a href="https://krkn-chaos.dev"><img src="https://img.shields.io/badge/docs-krkn--chaos.dev-3B82F6?style=flat-square" alt="Documentation"></a>
</p>

---

# CLAUDE.md - Krkn Website

## Project Overview

The [krkn-chaos.dev](https://krkn-chaos.dev) website is the documentation and marketing site for Krkn, a chaos engineering tool for Kubernetes/OpenShift. Built with Hugo + Docsy theme, deployed on Netlify. Apple-inspired dark/light theme with custom SCSS architecture.

## Repository Structure

```
website/
├── content/en/                  # All English content (Markdown + HTML)
│   ├── docs/                    # Documentation section
│   │   ├── scenarios/           # 20+ chaos scenario pages (each with tab content)
│   │   ├── krkn/                # Core Krkn docs
│   │   ├── krknctl/             # CLI tool docs
│   │   ├── krkn_ai/             # Krkn AI docs (config/, getting-started, etc.)
│   │   ├── installation/        # Installation guides
│   │   ├── getting-started/     # Quick start
│   │   ├── cerberus/            # Health monitoring
│   │   ├── developers-guide/    # Developer documentation
│   │   ├── contribution-guidelines/ # How to contribute
│   │   └── chaos-testing-guide/ # Best practices
│   ├── blog/                    # Blog section (curated external links)
│   └── community/               # Community page
├── layouts/                     # Hugo template overrides
│   ├── index.html               # Custom homepage (hero, features, scenarios, CTA)
│   ├── _partials/               # Docsy partial overrides (MUST use underscore prefix)
│   │   ├── navbar.html          # Custom glass-morphism navbar
│   │   ├── footer.html          # Custom 4-column footer
│   │   ├── chatbot.html         # AI chatbot widget
│   │   └── hooks/
│   │       ├── head-end.html    # Theme init script (prevents FOUC)
│   │       └── body-end.html    # Scroll animations, chatbot inject, tab hash sync
│   ├── blog/                    # Custom blog layout (replaces Docsy default)
│   │   ├── baseof.html
│   │   └── list.html
│   ├── community/               # Custom community layout (replaces Docsy default)
│   │   ├── baseof.html
│   │   └── list.html
│   ├── shortcodes/              # Custom shortcodes (notice, include)
│   └── _default/_markup/        # Heading anchor renderer
├── assets/scss/                 # SCSS source files
│   ├── _styles_project.scss     # Main entry — CSS custom properties + imports
│   ├── _variables_project.scss  # Bootstrap/Docsy variable overrides
│   ├── _custom_animations.scss  # Scroll-triggered reveal animations
│   ├── _custom_navbar.scss      # Navbar: glass-morphism, responsive, theme toggle
│   ├── _custom_hero.scss        # Hero section: gradient, cluster animation, CTAs
│   ├── _custom_sections.scss    # Feature grid, scenarios, timeline, CTA, footer
│   ├── _custom_docs.scss        # Documentation: sidebar, content, TOC, code blocks
│   └── _custom_pages.scss       # Blog & community page styles
├── static/                      # Static assets (CSS, JS, images, favicons)
│   ├── css/                     # Chatbot CSS, tab scroll CSS
│   ├── js/                      # Scroll animations JS, chatbot JS
│   ├── img/                     # Logos (Krkn SVG, CNCF white/color)
│   └── search-index.json        # Pre-built Lunr search index
├── netlify/functions/           # Netlify serverless functions (chat, health, etc.)
├── hugo.yaml                    # Main Hugo configuration
├── package.json                 # npm dependencies and build scripts
├── go.mod                       # Go module (Docsy v0.12.0)
├── netlify.toml                 # Netlify deployment configuration
└── .github/workflows/           # CI (rebuild-docs-index on content changes)
```

## Quick Start

```bash
# Install dependencies
npm install

# Development server (with drafts and future posts)
npm run dev
# or
hugo server --disableFastRender

# Production build
npm run build:production

# Clean build artifacts
npm run clean
```

## Stack & Versions

- **Hugo:** v0.146.0+ (extended edition, required for SCSS)
- **Docsy theme:** v0.12.0 (imported as Hugo module via `go.mod`)
- **Go:** 1.21+ (for Hugo modules)
- **Node:** 20 (for build scripts and Netlify functions)
- **Deployment:** Netlify (auto-deploys from `main` branch)
- **Search:** Lunr.js offline search (`static/search-index.json` built at build time)
- **Fonts:** Satoshi (headings) + General Sans (body) via Fontshare CDN

## Hugo Configuration

- **Main config:** `hugo.yaml`
- **Menu entries:** Defined centrally in `hugo.yaml` under `menus.main:` — do NOT add `menu` to content front matter
- **Docsy module:** Imported via `module.imports` in `hugo.yaml`
- **Tab content files:** `_tab-*.md` files are excluded from Hugo page building via `ignoreFiles: ['_tab-.*\.md$']` in `hugo.yaml`
- **Syntax highlighting:** Hugo's Chroma with `pygmentsUseClasses: true` and `noClasses: false`. **Prism is DISABLED** (`prism_syntax_highlighting: false`) — never re-enable it.
- **Taxonomies:** Tags and categories are enabled but not prominently displayed

## Theming (Dark / Light)

### How It Works

- **Dark theme is the default**
- Theme controlled by `data-theme` attribute on `<html>` (`dark` | `light`)
- User preference stored in `localStorage` key `krkn-theme`
- Flash-of-unstyled-content prevented by inline `<script>` in `head-end.html`
- Toggle button in navbar switches between themes

### CSS Custom Properties

All color tokens are defined as `--krkn-*` variables in `_styles_project.scss`:

```scss
:root, [data-theme="dark"] {
  --krkn-bg: #0A0B10;
  --krkn-surface: #111827;
  --krkn-elevated: #1A2332;
  --krkn-primary: #EC1C24;         /* Krkn red */
  --krkn-secondary: #0E58A0;      /* Royal blue */
  --krkn-text: #F8FAFC;
  --krkn-text-muted: #94A3B8;
  --krkn-text-subtle: #64748B;
  --krkn-border-subtle: #1E293B;
  --krkn-border-prominent: #334155;
  /* ...more tokens */
}

[data-theme="light"] {
  --krkn-bg: #F4F3EF;             /* warm linen */
  --krkn-surface: #E8E7E3;        /* warm stone */
  --krkn-elevated: #DDDCD8;       /* warm pebble */
  /* ...more tokens */
}
```

**ALWAYS use `var(--krkn-*)` tokens** — never hardcode hex colors in component styles. This ensures both themes work correctly.

### Brand Colors (from Krkn logo)

- Primary red: `#EC1C24` — chaos energy, CTAs, accents
- Secondary blue: `#0E58A0` — resilience, links, secondary actions
- Dark navy: `#0A0B10` — dark backgrounds

## SCSS Architecture

All custom styles go through Docsy's extension points:

- `_styles_project.scss` — Main entry for custom CSS; defines CSS custom properties and imports all partials
- `_variables_project.scss` — Bootstrap/Docsy variable overrides (compiled at build time)

Custom SCSS partials (imported in order by `_styles_project.scss`):

1. `_custom_animations.scss` — Scroll-triggered reveal animations
2. `_custom_navbar.scss` — Navbar: glass-morphism, responsive, theme toggle
3. `_custom_hero.scss` — Hero section: gradient, badge, cluster animation, CTA buttons
4. `_custom_sections.scss` — Feature grid, scenarios, timeline, CTA, footer
5. `_custom_docs.scss` — Documentation pages: sidebar, content, TOC, alerts, code blocks
6. `_custom_pages.scss` — Blog & community page styles

### CSS Conventions

- BEM naming: `.block__element--modifier` (e.g., `.krkn-navbar__link--active`)
- Namespace custom classes with `krkn-` prefix
- Use Sass `Min()` (capital M) for CSS `min()` to avoid Sass/CSS function conflicts
- Prefer CSS custom properties over Sass variables for anything that changes at runtime (themes)
- `!important` is acceptable to override Docsy/Bootstrap compiled defaults

## Layout Overrides

**CRITICAL:** Docsy v0.12.0 uses `layouts/_partials/` (with underscore prefix) for its partials. To override a Docsy partial, place the file in **`layouts/_partials/`**, not `layouts/partials/`.

Key custom layouts:

| File | Purpose |
|------|---------|
| `layouts/index.html` | Custom homepage (hero, features, scenarios, Krkn AI, CTA) |
| `layouts/_partials/navbar.html` | Custom Apple-style glass-morphism navbar |
| `layouts/_partials/footer.html` | Custom 4-column footer |
| `layouts/_partials/chatbot.html` | AI chatbot widget |
| `layouts/_partials/hooks/head-end.html` | Theme init script (prevents FOUC) |
| `layouts/_partials/hooks/body-end.html` | Scroll animations, chatbot inject, tab hash sync |
| `layouts/blog/baseof.html` | Blog baseof (removes Docsy sidebar/taxonomy chrome) |
| `layouts/blog/list.html` | Custom blog page with card grid |
| `layouts/community/baseof.html` | Community baseof (removes Docsy default layout) |
| `layouts/community/list.html` | Custom community page with cards and resources |
| `layouts/shortcodes/notice.html` | Alert box shortcode (info, warning, danger, etc.) |
| `layouts/shortcodes/include.html` | Remote content include shortcode |

## Adding a New Chaos Scenario

When adding a new scenario to the documentation, you MUST update all of the following locations to keep the website consistent. Follow each step in order.

### Step 1: Create the scenario content directory

Create a new folder under `content/en/docs/scenarios/<scenario-slug>/` with these files:

```
content/en/docs/scenarios/<scenario-slug>/
├── _index.md          # Main scenario page (front matter + content)
├── _tab-krkn.md       # Tab content for "Krkn" method (no front matter)
├── _tab-krkn-hub.md   # Tab content for "Krkn-hub" method (no front matter)
└── _tab-krknctl.md    # Tab content for "Krknctl" method (no front matter)
```

**`_index.md` front matter:**

```yaml
---
title: <Scenario Display Name>
description:
date: 2017-01-04
weight: 3
---
```

**`_index.md` must include the tabpane block** for the "How to Run" section:

```
{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" lang="krkn-hub" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}
```

**Important:** The `_tab-*.md` files must NOT have front matter. They are included via `readfile` and are excluded from Hugo page building by the `ignoreFiles` rule in `hugo.yaml`.

### Step 2: Add scenario card to Scenarios landing page

**File:** `content/en/docs/scenarios/_index.md`

Add a `scenario-card` div inside the appropriate category `scenario-grid`:

```html
<div class="scenario-card">
<h3><a href="<scenario-slug>/">Scenario Display Name</a></h3>
<span class="scenario-badge">scenario_type_identifier</span>
<p class="scenario-description">Brief one-line description of what this scenario does</p>
</div>
```

If the scenario supports specific cloud providers, add cloud badges:

```html
<div class="cloud-badges">
<span class="cloud-badge">AWS</span>
<span class="cloud-badge">Azure</span>
<span class="cloud-badge">GCP</span>
</div>
```

Existing categories (in order):

1. Pod & Container Disruptions
2. Node & Cluster Failures
3. Network
4. Application & Service
5. Storage & Data
6. System & Time

If the scenario doesn't fit an existing category, create a new `### Category Name` heading with its own `<div class="scenario-grid">` block.

### Step 3: Add scenario to Homepage categories

**File:** `layouts/index.html`

Find the `<!-- SCENARIOS SECTION -->` block. Add a list item to the correct category:

```html
<li><a href="/docs/scenarios/<scenario-slug>/">Scenario Display Name</a></li>
```

The homepage categories are: Pod & Container, Node & Cluster, Network, Application & Service, Resource & Storage.

Also update the heading count if it changes (currently "20+ Chaos Scenarios").

### Step 4: Update scenario counts (if applicable)

If the total number of scenarios crosses a new threshold, update these counts:

- **Homepage title:** `layouts/index.html` — search for "20+ Chaos Scenarios"
- **Docs landing page:** `content/en/docs/_index.md` — search for "15+ chaos scenarios"

### Step 5: Sidebar navigation

No manual action needed. The sidebar auto-generates from the content directory structure. Once `content/en/docs/scenarios/<scenario-slug>/_index.md` exists, it appears in the sidebar automatically.

### Step 6: Tab URL sharing

Tabs on scenario pages support URL hash linking. When a user clicks a tab, the URL updates automatically (e.g., `#tab-krknctl`). This is handled by the script in `layouts/_partials/hooks/body-end.html`. No per-scenario configuration is needed.

Shareable tab URLs follow this format:

- `/docs/scenarios/<scenario-slug>/#tab-krkn`
- `/docs/scenarios/<scenario-slug>/#tab-krkn-hub`
- `/docs/scenarios/<scenario-slug>/#tab-krknctl`

### Quick Checklist

- [ ] Created `content/en/docs/scenarios/<slug>/_index.md` with front matter and tabpane
- [ ] Created `_tab-krkn.md`, `_tab-krkn-hub.md`, `_tab-krknctl.md` (no front matter)
- [ ] Added scenario card to `content/en/docs/scenarios/_index.md` in the right category
- [ ] Added scenario link to `layouts/index.html` in the right homepage category
- [ ] Updated scenario counts in homepage and docs landing if threshold crossed
- [ ] Verified the page renders correctly in both dark and light themes

## Adding a New Blog Entry

The blog page is a **custom layout** — NOT a standard Hugo blog with individual posts. All content is defined as HTML cards in a single template file.

**File:** `layouts/blog/list.html`

### Blog sections (in order)

1. **Featured** — 3 highlight cards with `krkn-blog__card--featured` class
2. **Articles & Blog Posts** — General article cards
3. **Talks & Videos** — Video/talk cards
4. **Guides** — Internal documentation guides

### Adding a new article card

Find the correct section in `layouts/blog/list.html` and add a card block:

```html
<a href="https://example.com/your-article" target="_blank" rel="noopener" class="krkn-blog__card">
  <span class="krkn-blog__card-badge">Badge Text</span>
  <h3 class="krkn-blog__card-title">Article Title</h3>
  <p class="krkn-blog__card-desc">One or two sentence description of the article.</p>
  <span class="krkn-blog__card-source">Source Name</span>
</a>
```

For featured cards, use class `krkn-blog__card krkn-blog__card--featured`.

### Badge conventions

Use short, descriptive badge text that categorises the content:

| Badge | Use for |
|-------|---------|
| `Announcement` | Major project news (CNCF acceptance, releases) |
| `AI` | AI/ML integration articles |
| `CLI` | krknctl / command-line articles |
| `Introduction` | Getting started / introductory posts |
| `Best Practices` | Methodology and process articles |
| `Case Study` | Real-world findings and results |
| `Dashboard` | UI/dashboard related |
| `Tutorial` | Step-by-step guides |
| `Community` | Community contributions, mentorship experiences |
| `Video` | Talks, demos, recordings |
| `Guide` | Internal documentation guides |

### For internal links

For links to pages within the Krkn site, omit `target="_blank" rel="noopener"` and use a relative path:

```html
<a href="/docs/chaos-testing-guide/" class="krkn-blog__card">
```

### Quick Checklist (Blog)

- [ ] Added card to the correct section in `layouts/blog/list.html`
- [ ] Used the right card class (`krkn-blog__card` or `krkn-blog__card--featured`)
- [ ] Set a descriptive badge, title, description, and source
- [ ] External links have `target="_blank" rel="noopener"`
- [ ] Verified the card renders in both dark and light themes

## Updating the Community Page

The community page is a custom layout in `layouts/community/list.html`. It has three sections:

1. **Get Involved** — 4 action cards (`krkn-community__card`)
2. **Community Resources** — 6 link cards (`krkn-community__link-card`)
3. **Mentorship & Programs** — Callout block (`krkn-community__callout`)

### Adding a new resource link card

In the "Community Resources" section of `layouts/community/list.html`, add:

```html
<a href="https://example.com" target="_blank" rel="noopener" class="krkn-community__link-card">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- SVG icon path -->
  </svg>
  <div>
    <h4>Resource Name</h4>
    <p>Short description</p>
  </div>
</a>
```

### Adding a new "Get Involved" card

```html
<div class="krkn-community__card">
  <div class="krkn-community__card-icon">
    <svg ...><!-- icon --></svg>
  </div>
  <h3>Card Title</h3>
  <p>Description of the action or opportunity.</p>
  <a href="https://example.com" target="_blank" rel="noopener">Link Text →</a>
</div>
```

## Updating the Footer

The footer is defined in `layouts/_partials/footer.html`. It has a 4-column link grid:

| Column | Links |
|--------|-------|
| **Product** | Getting Started, Installation, Scenarios, Cerberus, Krkn AI |
| **Community** | GitHub, Slack, Community page, Issues |
| **Resources** | Blog, Chaos Testing Guide, Contributing, Demos |
| **About** | CNCF Sandbox, Code of Conduct, Security, Trademarks |

To add a new footer link, add an `<li><a>` inside the correct column's `<ul>`:

```html
<li><a href="/docs/new-page/">Link Text</a></li>
```

For external links add `target="_blank" rel="noopener"`.

## Updating the Homepage

The homepage is defined in `layouts/index.html`. Key sections that may need updating:

| Section | What it contains |
|---------|-----------------|
| Hero | Title, subtitle, CTA buttons |
| Why Krkn | Feature description + terminal mockup |
| How It Works | 4-step cards with code examples |
| Scenarios | Category cards (see "Adding a New Chaos Scenario" above) |
| Krkn AI | AI feature showcase with terminal mockup |
| Final CTA | Bottom call-to-action with code block |

The homepage uses a `<style>` block at the top of `layouts/index.html` for page-specific CSS. Global button styles (`.btn-primary-krkn`, `.btn-outline-krkn`) are defined in `assets/scss/_custom_hero.scss`.

## Content Conventions

- Docs landing page: `content/en/docs/_index.md` contains custom HTML layout (Quick Start, Explore, Why Krkn sections)
- Do NOT re-declare `--krkn-*` variables inside content markdown `<style>` blocks — they inherit from the global theme
- Light theme: warm stone palette (not pure white); code blocks stay dark in both themes
- CNCF logo swaps between white SVG (dark) and color PNG (light) via CSS display toggle

## Netlify Deployment

- **Production build:** `npm run build:production` + `node scripts/post-build.js`
- **Preview build:** `npm run build:preview` + `node scripts/post-build.js`
- **Serverless functions:** `netlify/functions/` — chat.js (AI chatbot), health.js, rebuild-index.js, webhook-rebuild.js
- **Environment variables (set in Netlify dashboard):** `LLM_API_KEY`, `LLM_PROVIDER`, `LLM_MODEL`, `DAILY_CHAT_LIMIT`

## CI/CD

- `.github/workflows/rebuild-docs-index.yml` — Rebuilds chatbot doc index when content files change on `main`
- Auto-deploys to Netlify on push to `main`

## Common Pitfalls

1. **Docsy partial paths:** Must use `layouts/_partials/` (underscore) to override Docsy v0.12.0 partials. `layouts/partials/` (no underscore) is ignored.
2. **Sass min() vs CSS min():** Use `Min(320px, 85vw)` not `min(320px, 85vw)` to avoid "Incompatible units" error
3. **Menu duplication:** Define menus only in `hugo.yaml`, not in content front matter
4. **Font loading:** Fonts loaded via `@import url()` in `_styles_project.scss` — ensure this stays at the top of the file
5. **Hugo version:** Docsy v0.12.0 requires Hugo v0.146.0+ extended
6. **Tab content files:** `_tab-*.md` files must NOT have front matter — they are included via `readfile`, not rendered as pages
7. **Tab URL hashes:** The `body-end.html` script in `layouts/_partials/hooks/` handles tab-to-hash sync. Do not duplicate this in `layouts/partials/hooks/` (without underscore)
8. **Prism vs Chroma:** Prism is disabled. We use Hugo's built-in Chroma highlighter with CSS classes. Never re-enable Prism; it conflicts with Chroma.
9. **Blog/Community layouts:** Both sections have custom `baseof.html` + `list.html` that remove Docsy's default sidebar, taxonomy cloud, and "Learn and Connect" chrome. Do not delete these or the pages will revert to the broken Docsy defaults.
10. **Color hardcoding:** Never hardcode hex colors in component styles. Always use `var(--krkn-*)` tokens to support both dark and light themes.

## Before Writing Code

1. Read through the conventions in this file (CLAUDE.md) before making changes
2. Review existing scenario pages as examples before adding new ones
3. Always test in both dark and light themes
4. Use `hugo server --disableFastRender` for development — it catches SCSS errors immediately
5. Verify changes don't break the sidebar navigation or search index
