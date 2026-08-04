---
title: Chaos Studio
description: Design visual chaos workflows with serial and parallel execution
weight: 4
---

# Chaos Studio <a href="/docs/krkn-operator/#permission-run"><span class="krkn-badge krkn-badge--run">Run</span></a>

A visual drag-and-drop editor for designing complex chaos workflows. Build graphs of scenarios that execute in series or parallel, and measure application resilience with the Resiliency Score.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/zlbXnIdRexc" title="Chaos Studio Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Visual Editor

- **Nodes** represent individual krkn scenarios
- **Arrows** define execution order — connect nodes to create dependencies
- **Serial execution**: chain nodes sequentially with single arrows
- **Parallel execution**: branch from one node to multiple targets
- Drag and drop to arrange the workflow visually

---

## Node Configuration

Each node is configured exactly like a [single scenario](../run-scenarios/): select a registry, choose a scenario, set mandatory/optional/global parameters, and mount files.

**Clone**: duplicate a configured node to repeat the same scenario multiple times within the workflow.

---

## Validation

The editor validates the workflow before execution:

- **Configured nodes**: green arrows and connections — ready to execute
- **Unconfigured nodes**: red arrows and red node border — must be configured before the workflow can run

Only fully configured nodes can be connected and executed.

---

## Resiliency Score

{{% notice info %}}
**Resiliency Score** quantifies how well your application withstood a chaos workflow. Instead of a simple pass/fail, you get a numeric score based on real application metrics.
{{% /notice %}}

Enable the Resiliency Score on a workflow to measure application resilience:

1. **Enable** the resiliency score option on the workflow
2. **Mount a PromQL file** — a special file containing PromQL queries uploaded via [File Management](../file-management/)
3. **Queries execute** during the workflow and their results contribute to the final score
4. **View the score** in the [Jobs](../jobs/) page alongside the graph run results

The PromQL file defines which metrics to evaluate (latency, error rate, throughput, etc.) and their expected thresholds. The score reflects how closely the application maintained its expected behavior under chaos.
