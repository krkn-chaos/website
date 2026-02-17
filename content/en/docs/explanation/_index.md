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
<h3><a href="what-is-chaos-engineering/">What is Chaos Engineering?</a></h3>
<p class="scenario-description">Understanding the discipline, principles, and methodology behind chaos engineering</p>
</div>

<div class="scenario-card">
<h3><a href="why-chaos-testing/">Why Chaos Testing?</a></h3>
<p class="scenario-description">The business case for chaos testing and when to invest in it</p>
</div>

<div class="scenario-card">
<h3><a href="chaos-engineering-principles/">Chaos Engineering Principles</a></h3>
<p class="scenario-description">The foundational principles: steady state, hypotheses, real-world events, and automation</p>
</div>

<div class="scenario-card">
<h3><a href="building-resilience/">Building Resilient Systems</a></h3>
<p class="scenario-description">Design patterns and architecture decisions that improve system resilience</p>
</div>

</div>

## Krkn Architecture & Design

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="what-is-krkn/">What is Krkn?</a></h3>
<p class="scenario-description">High-level overview of Krkn's purpose, target users, and use cases</p>
</div>

<div class="scenario-card">
<h3><a href="architecture/">Krkn Architecture</a></h3>
<p class="scenario-description">How Krkn components work together: scenarios, cerberus, telemetry, and the core engine</p>
</div>

<div class="scenario-card">
<h3><a href="krkn-vs-alternatives/">Krkn vs Alternatives</a></h3>
<p class="scenario-description">How Krkn compares to LitmusChaos, ChaosMesh, Gremlin, and other tools</p>
</div>

<div class="scenario-card">
<h3><a href="why-run-outside-cluster/">Why Run Outside the Cluster?</a></h3>
<p class="scenario-description">Design decision to run Krkn externally and the tradeoffs involved</p>
</div>

</div>

## Krkn Components & Features

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="krkn-vs-krkn-hub-vs-krknctl/">krkn vs krkn-hub vs krknctl</a></h3>
<p class="scenario-description">Understanding the three interfaces and when to use each one</p>
</div>

<div class="scenario-card">
<h3><a href="how-cerberus-works/">How Cerberus Works</a></h3>
<p class="scenario-description">The cluster health monitoring system and its integration with Krkn</p>
</div>

<div class="scenario-card">
<h3><a href="how-telemetry-works/">How Telemetry Works</a></h3>
<p class="scenario-description">Data collection, storage, and the telemetry schema</p>
</div>

<div class="scenario-card">
<h3><a href="how-signaling-works/">How Signaling Works</a></h3>
<p class="scenario-description">External control of chaos runs via pause/stop signals</p>
</div>

<div class="scenario-card">
<h3><a href="how-slo-validation-works/">How SLO Validation Works</a></h3>
<p class="scenario-description">Prometheus metrics evaluation and pass/fail criteria</p>
</div>

<div class="scenario-card">
<h3><a href="how-health-checks-work/">How Health Checks Work</a></h3>
<p class="scenario-description">Application availability monitoring during chaos</p>
</div>

</div>

## Scenario Deep Dives

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="how-pod-scenarios-work/">How Pod Scenarios Work</a></h3>
<p class="scenario-description">The mechanics of pod deletion and Kubernetes recovery</p>
</div>

<div class="scenario-card">
<h3><a href="how-network-chaos-works/">How Network Chaos Works</a></h3>
<p class="scenario-description">Traffic control, eBPF, and network filtering implementations</p>
</div>

<div class="scenario-card">
<h3><a href="how-node-scenarios-work/">How Node Scenarios Work</a></h3>
<p class="scenario-description">Cloud provider APIs and node lifecycle management</p>
</div>

<div class="scenario-card">
<h3><a href="rollback-scenarios/">Understanding Rollback Scenarios</a></h3>
<p class="scenario-description">How rollback testing validates recovery procedures</p>
</div>

</div>

## Advanced Topics

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="managed-clusters/">Managed Cluster Chaos</a></h3>
<p class="scenario-description">ACM/OCM integration for multi-cluster environments</p>
</div>

<div class="scenario-card">
<h3><a href="chaos-recommender/">Understanding Chaos Recommender</a></h3>
<p class="scenario-description">AI-powered scenario selection based on service profiling</p>
</div>

<div class="scenario-card">
<h3><a href="performance-analysis/">Performance Impact Analysis</a></h3>
<p class="scenario-description">How chaos affects cluster performance and resource usage</p>
</div>

<div class="scenario-card">
<h3><a href="security-considerations/">Security Considerations</a></h3>
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
