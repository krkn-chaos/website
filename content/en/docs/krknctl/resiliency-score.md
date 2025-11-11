---
title: "Resiliency Scoring"
description: "Aggregating scenario scores into a final Resiliency Score"
weight: 3
---

### Introduction

While the **krkn** engine produces a *per-scenario* Resiliency Score (0-100 %), **krknctl** acts as the orchestrator for multi-scenario test runs. It executes each chaos container, collects its individual score, and then computes a single, weighted Final Resiliency Score.

### The Scoring Algorithm (Final Score)

`Final Score % = Σ(Scenario_Score × Scenario_Weight) / Σ(Scenario_Weight)`

* **Scenario_Score** – the 0-100 % score reported by a krkn container.
* **Scenario_Weight** – a positive number (e.g. `1.0`, `1.5`, `2.0`) defined in **plan.json** that expresses the relative importance of the scenario.

#### Example

* Scenario A (weight 1.5) returns **70 %**.
* Scenario B (weight 1.0) returns **90 %**.

`Final Score = ((70 × 1.5) + (90 × 1.0)) / (1.5 + 1.0) = 78 %`

### How to Use

Add two top-level fields to each scenario in your **plan.json**:

* `resiliencyConfigPath` – path to the SLO profile (YAML) for that scenario.
* `resiliencyWeight` – the weight to use in the final average (defaults to **1.0**).

```json
{
  "graph": ["node-cpu-hog-local-test", "node-memory-hog-local-test"],
  "scenarios": {
    "node-cpu-hog-local-test": {
      "name": "node-cpu-hog",
      "image": "containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-cpu-hog",
      "imagePullPolicy": "Never",
      "resiliencyWeight": 1.5,
      "resiliencyConfigPath": "./my_profile_critical.yaml"
    },
    "node-memory-hog-local-test": {
      "name": "node-memory-hog",
      "image": "containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-memory-hog",
      "imagePullPolicy": "Never",
      "resiliencyWeight": 1.0,
      "resiliencyConfigPath": "./my_profile_standard.yaml",
      "depends_on": "node-cpu-hog-local-test"
    }
  }
}
```

Run the plan:

```bash
./krknctl graph run plan.json
```

### Architecture & Workflow

![Krkn resiliency architecture](images/krkn-resiliency-flow.png)


1. **Parse plan** – krknctl reads *plan.json*.
2. **Prepare environment** – for each scenario it reads the SLO profile from `resiliencyConfigPath`.
3. **Run container** – starts the chaos image with
   `KRKN_RUN_MODE=controller` and `KRKN_ALERTS_YAML_CONTENT` set to the profile content.
4. **Collect score** – waits for the `KRKN_RESILIENCY_REPORT_JSON:` line in stdout and stores the parsed JSON together with the scenario weight.
5. **Aggregate** – after all scenarios finish, compute the weighted average.
6. **Report** – print the summary to the console and dump a detailed `resiliency-report.json` file.

### Example Output

```bash
Detailed resiliency report written to resiliency-report.json
Overall Resiliency Report Summary:
{
  "scenarios": {
    "node-cpu-hog-local-test": 70.0,
    "node-memory-hog-local-test": 90.0
  },
  "ResiliencyScore": 78.0,
  "PassedSlos": 25,
  "TotalSlos": 30
}
```

The **resiliency-report.json** file contains the full per-scenario reports for further analysis.
