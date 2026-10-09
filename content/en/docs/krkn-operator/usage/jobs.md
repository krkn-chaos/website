---
title: Jobs
description: Monitor and inspect chaos experiment execution
weight: 1
---

# Jobs <a href="/docs/krkn-operator/#permission-view"><span class="krkn-badge krkn-badge--view">View</span></a> <a href="/docs/krkn-operator/#permission-cancel"><span class="krkn-badge krkn-badge--cancel">Cancel</span></a>

The Jobs page is the platform home screen. It lists scenario executions available to your group, with status updates and access to logs and results.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/cgdOzdkMsG0" title="Jobs and Execution Monitoring Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Run Types

### Single Run

A single scenario execution on one or more target clusters. For each run you can inspect:

- **Execution outcome** (success, failure)
- **Console logs** of the krkn pod that executed the scenario

#### Replay & Edit

Single runs can be **replayed** to re-execute the same scenario with the same configuration. You can also **edit the details** before replaying to modify:

- Target cluster(s)
- Scenario parameters
- Configuration values
- Run Name

This allows you to quickly iterate on chaos experiments or run the same test across different environments.

### Graph Run (Chaos Studio)

A workflow execution created through [Chaos Studio](../chaos-studio/). The execution is displayed as a graph where each node represents an individual krkn scenario. For each node you can inspect the outcome and logs independently.

Graph runs can include a **Resiliency Score** — a calculated metric based on PromQL queries executed during the workflow. This score measures how well the target application withstood the chaos experiment.

{{% notice info %}}
**Resiliency Score** is a key differentiating feature of Krkn Operator. It transforms chaos experiments from pass/fail tests into quantitative resilience measurements. See [Chaos Studio](../chaos-studio/) for details on configuring it.
{{% /notice %}}

---

## Visibility & Permissions

- Only jobs from **your own group** are displayed
- A cluster-wide tip shows the **names** of scenarios currently running across all groups (no details)
- Cancelling or removing jobs requires <a href="/docs/krkn-operator/#permission-cancel"><span class="krkn-badge krkn-badge--cancel">Cancel</span></a> permission
