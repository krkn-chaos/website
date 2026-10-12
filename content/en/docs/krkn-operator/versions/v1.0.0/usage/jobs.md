---
title: Jobs
description: Monitor and inspect chaos experiment execution
weight: 1
operator_docs_version: v1.0.0
operator_docs_page_key: usage/jobs
---

# Jobs <a href="/docs/krkn-operator/versions/v1.0.0/#permission-view"><span class="krkn-badge krkn-badge--view">View</span></a> <a href="/docs/krkn-operator/versions/v1.0.0/#permission-cancel"><span class="krkn-badge krkn-badge--cancel">Cancel</span></a>

The Jobs list is the home screen of the platform. It displays all scenario executions for your group, with real-time status updates and access to logs and results.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/BFLJtRIgoU4" title="Jobs & Execution Monitoring Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<p class="krkn-operator-docs-video-caption">This walkthrough is retained with v1.0.0 documentation and may show an earlier interface.</p>
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

![Replay Run](/operator-docs/v1.0.0/images/krkn-operator/replay.png)



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
- Cancelling or removing jobs requires <a href="/docs/krkn-operator/versions/v1.0.0/#permission-cancel"><span class="krkn-badge krkn-badge--cancel">Cancel</span></a> permission

![Jobs Dashboard](/operator-docs/v1.0.0/images/krkn-operator/main-screen.png)

![Scenario Run Detail](/operator-docs/v1.0.0/images/krkn-operator/scenario-running-detail.png)
