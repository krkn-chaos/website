---
title: Jobs
description: Monitor and inspect chaos experiment execution
weight: 1
---

# Jobs <a href="/docs/krkn-operator/#permission-view"><span class="krkn-badge krkn-badge--view">View</span></a> <a href="/docs/krkn-operator/#permission-delete"><span class="krkn-badge krkn-badge--delete">Delete</span></a>

The Jobs list is the home screen of the platform. It displays all scenario executions for your group, with real-time status updates and access to logs and results.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/BFLJtRIgoU4" title="Jobs & Execution Monitoring Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Run Types

### Single Run

A single scenario execution on one or more target clusters. For each run you can inspect:

- **Execution outcome** (success, failure)
- **Console logs** of the krkn pod that executed the scenario

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
- Deleting jobs requires <a href="/docs/krkn-operator/#permission-delete"><span class="krkn-badge krkn-badge--delete">Delete</span></a> permission

![Jobs Dashboard](/images/krkn-operator/main-screen.png)

![Scenario Run Detail](/images/krkn-operator/scenario-running-detail.png)
