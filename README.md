<p align="center">
  <img src="./static/img/readme-banner.svg" alt="Krkn - Chaos Engineering for Kubernetes" width="100%"/>
</p>

<p align="center">
  <a href="https://github.com/krkn-chaos/website/releases"><img src="https://img.shields.io/github/v/release/krkn-chaos/website?style=flat-square&color=0E58A0&label=release" alt="Release"></a>
  <a href="https://github.com/krkn-chaos/website/stargazers"><img src="https://img.shields.io/github/stars/krkn-chaos/website?style=flat-square&color=EC1C24" alt="Stars"></a>
  <a href="https://github.com/krkn-chaos/website/network/members"><img src="https://img.shields.io/github/forks/krkn-chaos/website?style=flat-square&color=334155" alt="Forks"></a>
  <a href="https://github.com/krkn-chaos/website/blob/main/LICENSE"><img src="https://img.shields.io/github/license/krkn-chaos/website?style=flat-square&color=0E58A0" alt="License"></a>
  <a href="https://krkn-chaos.dev"><img src="https://img.shields.io/badge/docs-krkn--chaos.dev-3B82F6?style=flat-square" alt="Documentation"></a>
  <a href="https://kubernetes.slack.com/archives/C05SFMHRWK1"><img src="https://img.shields.io/badge/slack-%23krkn-4A154B?style=flat-square&logo=slack&logoColor=white" alt="Slack"></a>
</p>

---

# Krkn Website

The official documentation and marketing website for [Krkn](https://github.com/krkn-chaos/krkn) — a chaos engineering tool for Kubernetes/OpenShift clusters. Live at **[krkn-chaos.dev](https://krkn-chaos.dev)**.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx hugo server --disableFastRender

# Production build
npm run build:production
```

## Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Hugo](https://gohugo.io) | v0.146.0+ (extended) | Static site generator |
| [Docsy](https://www.docsy.dev) | v0.12.0 | Documentation theme |
| [Netlify](https://netlify.com) | — | Deployment & serverless functions |
| [Lunr.js](https://lunrjs.com) | — | Offline search |

## Project Structure

```
├── content/en/          # Markdown content (docs, blog, community)
│   └── docs/scenarios/  # 20+ chaos scenario pages
├── layouts/             # Hugo template overrides
├── assets/scss/         # Custom SCSS (dark/light theme)
├── static/              # Static assets (images, JS, CSS)
├── scripts/             # Build & utility scripts
├── netlify/functions/   # Serverless functions (AI chatbot, etc.)
└── hugo.yaml            # Hugo configuration
```

## Contributing

We welcome contributions! Whether it's fixing a typo, adding a new scenario, or improving the design — every contribution matters.

- **Adding a scenario?** Follow the step-by-step guide in [CLAUDE.md](CLAUDE.md#adding-a-new-chaos-scenario)
- **General contributions:** See [CONTRIBUTING.md](CONTRIBUTING.md)
- **Found a bug?** [Open an issue](https://github.com/krkn-chaos/website/issues/new)

## Community

<p>
  <a href="https://kubernetes.slack.com/archives/C05SFMHRWK1"><strong>#krkn</strong> on Kubernetes Slack</a> · 
  <a href="https://github.com/krkn-chaos/">GitHub Organization</a> · 
  <a href="https://krkn-chaos.dev/community/">Community Page</a>
</p>

## License

This project is licensed under the [Apache License 2.0](LICENSE).

<p align="center">
  <br/>
  <a href="https://www.cncf.io/sandbox-projects/">
    <img src="static/img/cncf-color.png" alt="CNCF Sandbox" width="200"/>
  </a>
  <br/>
  <sub>Krkn is a <a href="https://www.cncf.io/sandbox-projects/">Cloud Native Computing Foundation</a> Sandbox project.</sub>
</p>
