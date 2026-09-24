---
title: Explanations
description: Understand chaos engineering concepts and Krkn's design
type: "docs/scenarios"
weight: 5
---

## Deepen Your Understanding

Explanations clarify concepts, provide context, and help you understand *why* things work the way they do. Unlike tutorials or how-to guides, these articles focus on understanding rather than doing.

{{% alert title="Want to Do Something?" color="info" %}}
If you're looking for step-by-step instructions, try [Tutorials](../tutorials/) or [How-To Guides](../how-to/) instead. Explanations are for when you want to understand the concepts.
{{% /alert %}}

## Chaos Engineering Foundations

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="../chaos-testing-guide/">Chaos Testing Guide</a></h3>
<p class="scenario-description">Understanding the discipline, principles, and methodology behind chaos engineering</p>
</div>

<div class="scenario-card">
<h3><a href="../overview/">Why Chaos Testing?</a></h3>
<p class="scenario-description">The business case for chaos testing and when to invest in it</p>
</div>

<div class="scenario-card">
<h3>Chaos Engineering Principles</h3>
<p class="scenario-description">Coming soon - see <a href="../chaos-testing-guide/">Chaos Testing Guide</a> for now</p>
</div>

<div class="scenario-card">
<h3>Building Resilient Systems</h3>
<p class="scenario-description">Coming soon - see <a href="../krkn/">Krkn Overview</a> for design patterns</p>
</div>

</div>

## Krkn Architecture & Design

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="what-is-krkn/">What is Krkn?</a></h3>
<p class="scenario-description">High-level overview of Krkn's purpose, target users, and use cases</p>
</div>

<div class="scenario-card">
<h3>Krkn Architecture</h3>
<p class="scenario-description">Coming soon - see <a href="what-is-krkn/">What is Krkn?</a> for architecture overview</p>
</div>

<div class="scenario-card">
<h3>Krkn vs Alternatives</h3>
<p class="scenario-description">Coming soon - see <a href="what-is-krkn/">What is Krkn?</a> for comparisons</p>
</div>

<div class="scenario-card">
<h3>Why Run Outside the Cluster?</h3>
<p class="scenario-description">See <a href="what-is-krkn/">What is Krkn?</a> for design decisions and tradeoffs</p>
</div>

</div>

## Krkn Components & Features

<div class="scenario-grid">

<div class="scenario-card">
<h3>krkn vs krkn-hub vs krknctl</h3>
<p class="scenario-description">See <a href="what-is-krkn/">What is Krkn?</a> for interface comparison</p>
</div>

<div class="scenario-card">
<h3><a href="../cerberus/">How Cerberus Works</a></h3>
<p class="scenario-description">The cluster health monitoring system and its integration with Krkn</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/telemetry/">How Telemetry Works</a></h3>
<p class="scenario-description">Data collection, storage, and the telemetry schema</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/signal/">How Signaling Works</a></h3>
<p class="scenario-description">External control of chaos runs via pause/stop signals</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/SLOs_validation/">How SLO Validation Works</a></h3>
<p class="scenario-description">Prometheus metrics evaluation and pass/fail criteria</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/health-checks/">How Health Checks Work</a></h3>
<p class="scenario-description">Application availability monitoring during chaos</p>
</div>

</div>

## Scenario Deep Dives

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="../scenarios/pod-scenario/">Pod Scenarios</a></h3>
<p class="scenario-description">See scenario documentation for mechanics of pod deletion and recovery</p>
</div>

<div class="scenario-card">
<h3><a href="../scenarios/network-chaos-scenario/">Network Chaos</a></h3>
<p class="scenario-description">See scenario documentation for traffic control implementation details</p>
</div>

<div class="scenario-card">
<h3><a href="../scenarios/node-scenarios/">Node Scenarios</a></h3>
<p class="scenario-description">See scenario documentation for cloud provider API usage</p>
</div>

<div class="scenario-card">
<h3><a href="../rollback-scenarios/">Understanding Rollback Scenarios</a></h3>
<p class="scenario-description">How rollback testing validates recovery procedures</p>
</div>

</div>

## Advanced Topics

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="../managedcluster_scenarios/">Managed Cluster Chaos</a></h3>
<p class="scenario-description">ACM/OCM integration for multi-cluster environments</p>
</div>

<div class="scenario-card">
<h3><a href="../chaos-recommender/">Understanding Chaos Recommender</a></h3>
<p class="scenario-description">AI-powered scenario selection based on service profiling</p>
</div>

<div class="scenario-card">
<h3><a href="../performance_dashboards/">Performance Impact Analysis</a></h3>
<p class="scenario-description">How chaos affects cluster performance (see dashboards guide)</p>
</div>

<div class="scenario-card">
<h3><a href="../security/">Security Considerations</a></h3>
<p class="scenario-description">Threat model, RBAC requirements, and security best practices</p>
</div>

</div>

## What Makes an Explanation?

Explanations are **understanding-oriented**. They:

- ✅ Clarify concepts and provide context
- ✅ Explain "why" and "how it works"
- ✅ Make connections between topics
- ✅ Discuss alternatives and tradeoffs
- ✅ Can be read in any order
- ✅ Deepen understanding

Explanations are **not**:
- ❌ Step-by-step instructions (see [How-To Guides](../how-to/))
- ❌ Learning experiences (see [Tutorials](../tutorials/))
- ❌ Technical specifications (see [Reference](../reference/))

## Need Something Else?

- **Learning by doing?** → [Tutorials](../tutorials/)
- **Solving a problem?** → [How-To Guides](../how-to/)
- **Looking up details?** → [Reference](../reference/)
- **Contributing code?** → [Developer's Guide](../developers-guide/)
