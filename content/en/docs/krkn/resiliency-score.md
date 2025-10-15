---
title: "Resiliency Scoring"
description: "Resiliency Scoring"
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

### How to Use in Krkn (Default Mode)

Resiliency scoring is enabled by default and requires no extra configuration. After any chaos run, Krkn will automatically evaluate the comprehensive set of SLOs defined in the main `config/alerts.yaml` file.

The results will be embedded in the `kraken.report` file within the `resiliency_report` block.

**Example Telemetry Output:**
```json
{
    "telemetry": {
        "run_uuid": "717c8135-2aa0-47c9-afdf-3a6fe855c535",
        "job_status": false,
        "resiliency_report": {
            "score": 95,
            "breakdown": {
                "total_points": 45,
                "points_lost": 2,
                "passed": 27,
                "failed": 2
            },
            "slo_results": {
                "etcd cluster database is running full.": true,
                "etcd cluster members are down.": false,
                "Critical prometheus alert. {{$labels.alertname}}": false
            }
        }
    }
}
```

### Architecture and Implementation

The feature is orchestrated by a central `Resiliency` class that manages the entire lifecycle.

1.  **Initialization**: After a chaos run, the main Krkn runner initializes the `Resiliency` object, which loads all SLO definitions from `config/alerts.yaml`.
2.  **Evaluation**: The `Resiliency` object iterates through every loaded SLO. For each one, it executes the Prometheus `expr` (query) over the time window of the chaos scenario.
3.  **Result Mapping**: If a query returns a result, it means the failure condition was met, and the SLO is marked as `failed`. If the query returns nothing, the SLO is marked as `passed`.
4.  **Scoring**: The class then applies the weighted scoring algorithm to the pass/fail results to calculate the final score.
5.  **Reporting**: Finally, the class generates a complete report dictionary, which is merged into the main telemetry object before it's written to disk.

### How to Use in krknctl (Custom Profiles)

For more focused testing, you can provide a custom resiliency profile to `krknctl`. This allows you to select a specific subset of SLOs, override the default weights, and add active health checks.

For detailed instructions on creating a `resiliency_profile.yaml` and the exact CLI flags to use, please refer to the **[Krknctl Resiliency Scoring Documentation](/docs/krknctl/resiliency-scoring)**.