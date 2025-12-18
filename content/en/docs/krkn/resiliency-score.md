---
title: "Resiliency Scoring"
description: "Resiliency Scoring Calculation Algorithm and Configuration"
weight: 2
---

### Introduction

**What is the Resiliency Score?**
The Resiliency Score is a percentage (0-100%) that represents the health and stability of your Kubernetes cluster during a chaos scenario. It is calculated by evaluating a set of Service Level Objectives (SLOs) against live Prometheus data.

**Why use it?**
A simple `pass` or `fail` doesn't tell the whole story. A score of **95%** indicates a robust system with minor degradation, while a score of **60%** reveals significant issues that need investigation, even if the chaos scenario technically "passed". This allows you to track resilience improvements over time and make data-driven decisions.

**How does it work?**
After a chaos scenario completes, Krkn evaluates a list of pre-defined SLOs (which are Prometheus alert expressions) over the chaos time window. It counts how many SLOs passed and failed, applies a weighted scoring model, and embeds a detailed report in the final telemetry output.

### The Scoring Algorithm

The final score is calculated using a weighted pass/fail model based on SLO severity. This ensures that critical failures have a significantly higher impact on the score than minor warnings.

#### SLO Severity and Weighting

Each SLO is assigned a `severity` of either `warning` or `critical`:
* **Warning:** Represents performance degradation or minor issues. Worth **1 point**.
* **Critical:** Represents significant service impairment or outages. Worth **3 points** (by default).

#### Formula

The score is calculated as a percentage of the total possible points achieved.

`Score % = ((Total Points - Points Lost) / Total Points) * 100`

**Where:**
* **Total Points:** The maximum possible score, calculated as `(count_critical_slos * 3) + (count_warning_slos * 1)`.
* **Points Lost:** The sum of points for all failed SLOs, calculated as `(failed_critical_slos * 3) + (failed_warning_slos * 1)`.

**Example Calculation:**
* **Profile:** 5 critical SLOs, 15 warning SLOs.
* **Total Possible Points:** `(5 * 3) + (15 * 1) = 30`.
* **Chaos Outcome:** 1 critical SLO and 4 warning SLOs failed.
* **Points Lost:** `(1 * 3) + (4 * 1) = 7`.
* **Final Score:** `((30 - 7) / 30) * 100 = 76.6%`.

### Execution Modes

Krkn supports three execution modes:


#### Mode 1: Default

*Uses `config/alerts.yaml` on disk.*

1. Runs the chaos scenario.
2. Loads SLO definitions from `config/alerts.yaml`.
3. Calculates the score and embeds the full report in `kraken.report → resiliency_report`.

**Example telemetry snippet:**
```json
{
  "telemetry": {
    "run_uuid": "717c8135-2aa0-47c9-afdf-3a6fe855c535",
    "job_status": false,
    "resiliency_report": {
      "score": 95,
      "breakdown": { "total_points": 45, "points_lost": 2, "passed": 27, "failed": 2 },
    }
  }
}
```

#### Mode 2: Custom profile override

*Activated when `KRKN_ALERTS_YAML_CONTENT` is provided.*

1. Overrides the local `config/alerts.yaml` with the YAML passed via the environment variable.
2. Runs exactly like the default mode but uses the supplied profile.
3. Writes the report to `kraken.report` (same as default). Nothing is printed to stdout.

#### Mode 3: Controller (`krknctl` integration)

Activated when **both** environment variables are set:

* `RESILIENCY_ENABLED_MODE=controller` – tells Krkn to print its resiliency report to stdout.
* `KRKN_ALERTS_YAML_CONTENT` – carries the SLO profile (identical to Mode 2).

1. Krkn runs inside a container launched by **krknctl**.
2. After scoring, it prints a *single-line* JSON report prefixed with `KRKN_RESILIENCY_REPORT_JSON:`. krknctl captures this line and aggregates the score across scenarios.

**Example stdout snippet (trimmed):**
```bash
2025-11-10 10:30:05 [INFO] Resiliency check complete. Score: 76.6%
KRKN_RESILIENCY_REPORT_JSON:{"name":"node-cpu-hog","score":76.6,"weight":1.0}
```


### Architecture and Implementation

![Krkn resiliency architecture](images/krkn-resiliency-flow.png)

A single `Resiliency` class manages the entire lifecycle.

<!-- 1. **Initialization**  
   • Detect `RESILIENCY_ENABLED_MODE`.  
   • If `controller`, construct the object from `KRKN_ALERTS_YAML_CONTENT`; otherwise load `config/alerts.yaml`.

2. **Evaluation**  
   Iterate through each SLO and run its Prometheus `expr` over the chaos time window.

3. **Result Mapping**  
   A non-empty query result marks the SLO as **failed**; an empty result marks it as **passed**. If Prometheus returns no data for a specific SLO query, that SLO is **excluded** from the scoring calculation.

4. **Scoring**  
   Apply the weighted algorithm (critical = 3, warning = 1) to derive the percentage score.

5. **Reporting**  
   • Standalone: merge the report into telemetry and write to `kraken.report`.  
   • Controller: serialize the report to JSON and print with the `KRKN_RESILIENCY_REPORT_JSON:` prefix. -->

<!-- #### Multi-scenario runs

No additional weighting is applied—every SLO contributes once per run. If a critical SLO fires during any scenario, its full weight (3) is deducted from the total.

Need independent containers, parallel execution, or per-scenario weighting? Use [**krknctl**](../krknctl/resiliency-score.md). -->