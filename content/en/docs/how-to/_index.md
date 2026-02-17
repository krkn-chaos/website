---
title: How-To Guides
description: Practical solutions for specific tasks
type: "docs/scenarios"
weight: 3
---

## Solve Specific Problems

How-to guides are practical, goal-oriented recipes that help you accomplish specific tasks. Unlike tutorials, they assume you have basic knowledge and just need to know the steps to achieve a particular goal.

{{% alert title="Looking to Learn?" color="info" %}}
If you're new to Krkn, start with [Tutorials](../tutorials/) instead. How-to guides are best used once you understand the basics.
{{% /alert %}}

## Categories

### Installation & Setup

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="installation/krkn/">Install krkn</a></h3>
<p class="scenario-description">Set up the standalone Python program for running multiple scenarios</p>
</div>

<div class="scenario-card">
<h3><a href="installation/krkn-hub/">Install krkn-hub</a></h3>
<p class="scenario-description">Deploy containerized krkn for CI/CD systems</p>
</div>

<div class="scenario-card">
<h3><a href="installation/krknctl/">Install krknctl</a></h3>
<p class="scenario-description">Set up the recommended CLI tool with auto-completion</p>
</div>

<div class="scenario-card">
<h3><a href="installation/disconnected-env/">Install in Disconnected Environments</a></h3>
<p class="scenario-description">Set up Krkn in air-gapped or restricted networks</p>
</div>

</div>

### Running Chaos Scenarios

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="run-pod-chaos/">Run Pod Chaos</a></h3>
<p class="scenario-description">Quick guide to running pod failure tests</p>
</div>

<div class="scenario-card">
<h3><a href="run-network-chaos/">Run Network Chaos</a></h3>
<p class="scenario-description">Inject latency, packet loss, and bandwidth restrictions</p>
</div>

<div class="scenario-card">
<h3><a href="run-node-chaos/">Run Node Chaos</a></h3>
<p class="scenario-description">Test node failures across different cloud providers</p>
</div>

<div class="scenario-card">
<h3><a href="run-multiple-scenarios/">Run Multiple Scenarios</a></h3>
<p class="scenario-description">Execute multiple chaos tests in sequence or parallel</p>
</div>

</div>

### Configuration & Monitoring

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="configure-cerberus/">Configure Cerberus Monitoring</a></h3>
<p class="scenario-description">Set up cluster health monitoring during chaos</p>
</div>

<div class="scenario-card">
<h3><a href="validate-slos/">Validate SLOs</a></h3>
<p class="scenario-description">Check metrics and alerts during chaos runs</p>
</div>

<div class="scenario-card">
<h3><a href="configure-health-checks/">Configure Health Checks</a></h3>
<p class="scenario-description">Monitor application endpoints during chaos</p>
</div>

<div class="scenario-card">
<h3><a href="enable-telemetry/">Enable Telemetry</a></h3>
<p class="scenario-description">Collect and store chaos test results</p>
</div>

</div>

### Advanced Tasks

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="chaos-in-managed-clusters/">Run Chaos in Managed Clusters</a></h3>
<p class="scenario-description">Use ACM/OCM integration for multi-cluster chaos</p>
</div>

<div class="scenario-card">
<h3><a href="integrate-with-ci-cd/">Integrate with CI/CD</a></h3>
<p class="scenario-description">Add chaos testing to your deployment pipeline</p>
</div>

<div class="scenario-card">
<h3><a href="use-chaos-recommender/">Use Chaos Recommender</a></h3>
<p class="scenario-description">Get AI-powered scenario recommendations</p>
</div>

<div class="scenario-card">
<h3><a href="customize-scenarios/">Customize Scenarios</a></h3>
<p class="scenario-description">Modify existing scenarios for your needs</p>
</div>

</div>

### Troubleshooting

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="debug-failures/">Debug Scenario Failures</a></h3>
<p class="scenario-description">Troubleshoot common issues with chaos runs</p>
</div>

<div class="scenario-card">
<h3><a href="troubleshoot-installation/">Troubleshoot Installation</a></h3>
<p class="scenario-description">Fix common installation problems</p>
</div>

<div class="scenario-card">
<h3><a href="handle-timeouts/">Handle Timeouts</a></h3>
<p class="scenario-description">Deal with scenario timeout errors</p>
</div>

</div>

## What Makes a How-To Guide?

How-to guides are **goal-oriented**. They:

- ✅ Start with a specific goal or problem
- ✅ Provide a series of steps to achieve that goal
- ✅ Assume you have basic knowledge
- ✅ Focus on getting results quickly
- ✅ Show one recommended approach (not all possible approaches)

How-to guides are **not**:
- ❌ Learning experiences (see [Tutorials](../tutorials/))
- ❌ Complete technical specifications (see [Reference](../reference/))
- ❌ Conceptual explanations (see [Explanations](../explanation/))

## Need Something Else?

- **Learning Krkn?** → [Tutorials](../tutorials/)
- **Looking up specs?** → [Reference](../reference/)
- **Understanding concepts?** → [Explanations](../explanation/)
- **Contributing?** → [Developer's Guide](../developers-guide/)
