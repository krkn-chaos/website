---
title: Krkn-Chaos
description: Krkn-Chaos Org Explanations
linkTitle: Krkn-Chaos
type: "docs/scenarios"
---

<style>
/* ---------------------------------------------------------------------------
   Docs Landing Page
   Inherits --krkn-* variables from the global theme (dark or light).
   No local overrides -- the theme toggle controls everything.
   --------------------------------------------------------------------------- */

.docs-landing .docs-hero {
  position: relative;
  background: var(--krkn-bg);
  padding: 4rem 0 5rem;
  text-align: center;
}

.docs-landing .docs-hero__bg {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at center, var(--krkn-border-subtle) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
  opacity: 0.4;
}

.docs-landing .docs-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.docs-landing .docs-hero__title {
  font-family: 'Satoshi', sans-serif;
  font-size: clamp(2.25rem, 4vw, 3.25rem);
  font-weight: 700;
  color: var(--krkn-text);
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.docs-landing .docs-hero__subtitle {
  font-size: 1.25rem;
  color: var(--krkn-text-muted);
  line-height: 1.6;
  margin: 0;
}

/* Quick Start - 3 cards */
.docs-landing .docs-quick-start {
  background: var(--krkn-surface);
  padding: 4rem 0 5rem;
}

.docs-landing .docs-quick-start__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2.5rem;
}

@media (max-width: 768px) {
  .docs-landing .docs-quick-start__grid {
    grid-template-columns: 1fr;
  }
}

/* Explore - 6 cards */
.docs-landing .docs-explore {
  background: var(--krkn-bg);
  padding: 4rem 0 5rem;
}

.docs-landing .docs-explore__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2.5rem;
}

@media (max-width: 992px) {
  .docs-landing .docs-explore__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .docs-landing .docs-explore__grid {
    grid-template-columns: 1fr;
  }
}

/* Why Krkn */
.docs-landing .docs-why {
  background: var(--krkn-surface);
  padding: 4rem 0 5rem;
}

.docs-landing .docs-why__content {
  max-width: 720px;
  margin: 0 auto;
}

.docs-landing .docs-why__text {
  color: var(--krkn-text-muted);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.docs-landing .docs-why__text strong {
  color: var(--krkn-text);
}

.docs-landing .docs-why__flowchart {
  margin-top: 2.5rem;
  text-align: center;
}

.docs-landing .docs-why__flowchart img {
  max-width: 100%;
  width: 900px;
  height: auto;
  aspect-ratio: 20/9;
  object-fit: contain;
  border-radius: 0.75rem;
  border: 1px solid var(--krkn-border-subtle);
}

.docs-landing .docs-why__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--krkn-primary);
  font-weight: 600;
  text-decoration: none;
  margin-top: 1.5rem;
  transition: color 0.2s ease;
}

.docs-landing .docs-why__link:hover {
  color: var(--krkn-secondary);
}

/* Card links - full card clickable */
.docs-landing .feature-card {
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
}

.docs-landing .feature-card:hover .feature-card__title {
  color: var(--krkn-primary);
}
</style>

<div class="docs-landing">

  <!-- Hero -->
  <section class="docs-hero">
    <div class="docs-hero__bg" aria-hidden="true"></div>
    <div class="docs-hero__inner">
      <h1 class="docs-hero__title">Krkn Documentation</h1>
      <p class="docs-hero__subtitle">Everything you need to get started with chaos engineering on Kubernetes.</p>
    </div>
  </section>

  <!-- Quick Start -->
  <section class="docs-quick-start">
    <div class="container">
      <h2 class="section-title">Quick Start</h2>
      <p class="section-subtitle">Get up and running in minutes</p>
      <div class="docs-quick-start__grid">
        <a href="/docs/getting-started/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12 12 0 0 1 22 2c0 2.5-.5 7.5-3 10a12 12 0 0 1-3.05 2"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>
          </div>
          <h3 class="feature-card__title">New to Krkn?</h3>
          <p class="feature-card__desc">Follow our guided quickstart to run your first chaos scenario.</p>
        </a>
        <a href="/docs/installation/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          </div>
          <h3 class="feature-card__title">Install Krkn</h3>
          <p class="feature-card__desc">Set up krkn, krknctl, or krkn-hub on your cluster.</p>
        </a>
        <a href="/docs/scenarios/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
          </div>
          <h3 class="feature-card__title">Browse Scenarios</h3>
          <p class="feature-card__desc">Explore 15+ chaos scenarios for pods, nodes, network, and more.</p>
        </a>
      </div>
    </div>
  </section>

  <!-- Explore -->
  <section class="docs-explore">
    <div class="container">
      <h2 class="section-title">Explore</h2>
      <p class="section-subtitle">Dive deeper into Krkn’s components and guides</p>
      <div class="docs-explore__grid">
        <a href="/docs/krkn/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
          </div>
          <h3 class="feature-card__title">What is Krkn?</h3>
          <p class="feature-card__desc">Core concepts, architecture, and configuration.</p>
        </a>
        <a href="/docs/krknctl/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
          </div>
          <h3 class="feature-card__title">krknctl</h3>
          <p class="feature-card__desc">CLI tool to run and orchestrate chaos scenarios.</p>
        </a>
        <a href="/docs/cerberus/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <h3 class="feature-card__title">Cerberus</h3>
          <p class="feature-card__desc">Cluster health monitoring during chaos.</p>
        </a>
        <a href="/docs/krkn_ai/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </div>
          <h3 class="feature-card__title">Krkn AI</h3>
          <p class="feature-card__desc">AI-powered chaos recommendations.</p>
        </a>
        <a href="/docs/chaos-testing-guide/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
          </div>
          <h3 class="feature-card__title">Chaos Testing Guide</h3>
          <p class="feature-card__desc">Best practices and methodology.</p>
        </a>
        <a href="/docs/developers-guide/" class="feature-card">
          <div class="feature-card__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-6l-2-2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z"/></svg>
          </div>
          <h3 class="feature-card__title">Developers Guide</h3>
          <p class="feature-card__desc">Contributing and extending Krkn.</p>
        </a>
      </div>
    </div>
  </section>

  <!-- Why Krkn -->
  <section class="docs-why">
    <div class="container">
      <h2 class="section-title">Why Krkn?</h2>
      <p class="section-subtitle">Purpose-built for real-world chaos engineering</p>
      <div class="docs-why__content">
        <p class="docs-why__text">
          <strong>Why Chaos?</strong> Distributed systems often assume the network is reliable, latency is zero, and resources are always available — yet these assumptions lead to outages. <strong>Chaos testing</strong> helps uncover weaknesses before they impact production.
        </p>
        <p class="docs-why__text">
          <strong>Why Krkn?</strong> We built Krkn to be lightweight (runs outside the cluster), support both cloud and Kubernetes scenarios, perform metric checks during and after chaos, and validate resilience with post-scenario alerts. <a href="/docs/krkn/">Learn more about Krkn</a>.
        </p>
        <div class="docs-why__flowchart">
          <a href="/docs/overview/" class="docs-why__link">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            Read the full story — Why Chaos, Why Krkn, and Repository Ecosystem →
          </a>
          <img src="https://raw.githubusercontent.com/krkn-chaos/website/refs/heads/main/assets/images/krkn-repo-flowchart.png" alt="Krkn repository flowchart" class="contain" />
        </div>
      </div>
    </div>
  </section>

</div>
