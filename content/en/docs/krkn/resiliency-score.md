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

The final score is calculated using a weighted pass/fail model. By default, weights are based on SLO severity, but you can also assign custom weights to individual SLOs for more granular control.

#### SLO Severity and Default Weights

Each SLO is assigned a `severity` of either `warning` or `critical`:
* **Warning:** Represents performance degradation or minor issues. Worth **1 point** by default.
* **Critical:** Represents significant service impairment or outages. Worth **3 points** by default.

#### Custom Weights

In addition to severity-based weighting, you can assign a custom weight to any individual SLO. This allows you to fine-tune the scoring model based on your specific requirements. When a custom weight is specified, it overrides the default severity-based weight for that SLO.

**Use cases for custom weights:**
- Emphasize business-critical SLOs beyond standard severity levels
- De-emphasize less important warnings
- Create custom scoring profiles for different environments or use cases

#### Formula

The score is calculated as a percentage of the total possible points achieved.

`Score % = ((Total Points - Points Lost) / Total Points) * 100`

**Where:**
* **Total Points:** The sum of weights for all evaluated SLOs (either custom weight or severity-based weight).
* **Points Lost:** The sum of weights for all failed SLOs.

**Example Calculation (Severity-based):**
* **Profile:** 5 critical SLOs, 15 warning SLOs.
* **Total Possible Points:** `(5 * 3) + (15 * 1) = 30`.
* **Chaos Outcome:** 1 critical SLO and 4 warning SLOs failed.
* **Points Lost:** `(1 * 3) + (4 * 1) = 7`.
* **Final Score:** `((30 - 7) / 30) * 100 = 76.6%`.

**Example Calculation (With Custom Weights):**
* **Profile:** 3 SLOs with custom weights (10, 5, 2), 2 critical SLOs (default weight 3 each).
* **Total Possible Points:** `10 + 5 + 2 + (2 * 3) = 23`.
* **Chaos Outcome:** The SLO with weight 10 failed, and 1 critical SLO failed.
* **Points Lost:** `10 + 3 = 13`.
* **Final Score:** `((23 - 13) / 23) * 100 = 43.5%`.

### Defining SLOs with Custom Weights

SLOs are defined in the alerts YAML file (typically `config/alerts.yaml`). The format supports both the traditional severity-only format and an extended format with custom weights.

#### Traditional Format (Severity Only)

```yaml
- expr: avg_over_time(histogram_quantile(0.99, rate(etcd_disk_wal_fsync_duration_seconds_bucket[2m]))[10m:]) > 0.01
  description: 10 minutes avg. 99th etcd fsync latency higher than 10ms
  severity: warning

- expr: etcd_server_has_leader{job=~".*etcd.*"} == 0
  description: etcd cluster has no leader
  severity: critical
```

In this format, the weight is automatically determined by severity: `critical` = 3 points, `warning` = 1 point.

#### Extended Format (With Custom Weight)

```yaml
- expr: avg_over_time(histogram_quantile(0.99, rate(etcd_disk_wal_fsync_duration_seconds_bucket[2m]))[10m:]) > 0.01
  description: 10 minutes avg. 99th etcd fsync latency higher than 10ms
  severity: warning
  weight: 5

- expr: etcd_server_has_leader{job=~".*etcd.*"} == 0
  description: etcd cluster has no leader
  severity: critical
  weight: 10
```

In this format, you specify an explicit `weight` value that overrides the default severity-based weight. The severity field is still required for classification purposes.

#### Mixed Format Example

You can mix both formats in the same file:

```yaml
# Business-critical SLO with custom high weight
- expr: up{job="payment-service"} == 0
  description: Payment service is down
  severity: critical
  weight: 15

# Standard critical SLO (uses default weight of 3)
- expr: etcd_server_has_leader{job=~".*etcd.*"} == 0
  description: etcd cluster has no leader
  severity: critical

# Low-priority warning with reduced weight
- expr: node_filesystem_free_bytes{mountpoint="/"} / node_filesystem_size_bytes < 0.1
  description: Root filesystem less than 10% free
  severity: warning
  weight: 0.5

# Standard warning (uses default weight of 1)
- expr: rate(http_requests_total{code="500"}[5m]) > 0.01
  description: High rate of 500 errors
  severity: warning
```

### Configuration

The resiliency scoring system can be configured in your Krkn configuration file (`config/config.yaml`):

```yaml
resiliency:
  resiliency_run_mode: standalone  # Options: standalone, controller, disabled
  resiliency_file: config/alerts.yaml  # Path to SLO definitions
```

**Configuration Options:**

* `resiliency_run_mode`: Determines how resiliency scoring operates
  - `standalone` (default): Calculates score and embeds in telemetry output
  - `controller`: Prints resiliency report to stdout for krknctl integration
  - `disabled`: Disables resiliency scoring

* `resiliency_file`: Path to the YAML file containing SLO definitions. If not specified, defaults to the `alert_profile` setting from `performance_monitoring`, or `config/alerts.yaml` if neither is set.

### Execution Modes

Krkn supports three execution modes:

#### Mode 1: Standalone (Default)

*Uses `config/alerts.yaml` or the file specified in configuration.*

1. Runs the chaos scenario.
2. Loads SLO definitions from the alerts file.
3. Evaluates each SLO against Prometheus over the chaos time window.
4. Calculates the score and embeds the full report in `kraken.report → resiliency_report`.

**Example telemetry snippet:**
```json
{
  "telemetry": {
    "run_uuid": "717c8135-2aa0-47c9-afdf-3a6fe855c535",
    "job_status": false,
    "resiliency_report": {
      "score": 95,
      "breakdown": { "total_points": 45, "points_lost": 2, "passed": 27, "failed": 2 },
      "slo_results": {
        "etcd cluster has no leader": true,
        "10 minutes avg. 99th etcd fsync latency higher than 10ms": false
      }
    }
  }
}
```

#### Mode 2: Custom Profile Override

*Activated when `KRKN_ALERTS_YAML_CONTENT` environment variable is provided.*

1. Overrides the local alerts file with the YAML content passed via the environment variable.
2. Runs exactly like the standalone mode but uses the supplied profile.
3. Writes the report to `kraken.report` (same as standalone). Nothing is printed to stdout.

**Usage:**
```bash
export KRKN_ALERTS_YAML_CONTENT="$(cat custom-alerts.yaml)"
./run_kraken.py --config config/config.yaml
```

#### Mode 3: Controller (`krknctl` integration)

*Activated by setting `resiliency_run_mode: controller` in configuration.*

1. Krkn runs inside a container launched by **krknctl**.
2. After scoring, it prints a detailed JSON report prefixed with `KRKN_RESILIENCY_REPORT_JSON:`.
3. krknctl captures this output and aggregates scores across multiple scenarios.

**Example stdout snippet:**
```bash
2025-11-10 10:30:05 [INFO] Resiliency check complete. Score: 76.6%
KRKN_RESILIENCY_REPORT_JSON:{"scenarios":[{"name":"node-cpu-hog","score":76,"weight":1.0,"breakdown":{"total_points":30,"points_lost":7,"passed":18,"failed":2}}]}
```

For multi-scenario runs with per-scenario weighting and parallel execution, use [**krknctl**](../krknctl/).

### Architecture and Implementation

![Krkn resiliency architecture](images/krkn-resiliency-flow.png)

A single `Resiliency` class in `krkn/resiliency/resiliency.py` manages the entire lifecycle:

1. **Initialization**
   - Loads SLO definitions from the alerts YAML file
   - Parses both traditional (severity-only) and extended (with custom weights) formats
   - Detects the execution mode from configuration

2. **Evaluation**
   - Iterates through each SLO and executes its Prometheus `expr` query over the chaos time window
   - Uses the `evaluate_slos()` function from `krkn/prometheus/collector.py`

3. **Result Mapping**
   - A non-empty query result marks the SLO as **failed**
   - An empty result marks it as **passed**
   - SLOs that return no data from Prometheus are **excluded** from scoring

4. **Scoring**
   - For each SLO, determines the weight: uses custom weight if specified, otherwise uses severity-based weight (critical = 3, warning = 1)
   - Calculates total points and points lost
   - Derives the percentage score using the formula above

5. **Reporting**
   - **Standalone mode:** Embeds the report into telemetry and writes to `kraken.report`
   - **Controller mode:** Serializes the report to JSON and prints with the `KRKN_RESILIENCY_REPORT_JSON:` prefix for krknctl consumption

### Scenario-based Resiliency Scoring

For multi-scenario chaos runs, Krkn supports per-scenario resiliency scoring with weighted aggregation:

- Each scenario gets its own resiliency score calculated over its specific time window
- Each scenario can have a weight assigned (default: 1.0)
- The final resiliency score is a weighted average of all scenario scores

**Weighted Average Formula:**
```
Final Score = Σ(scenario_score × scenario_weight) / Σ(scenario_weight)
```

This allows you to prioritize certain scenarios over others when calculating the overall resiliency score for a chaos run.

### Best Practices

1. **Start with Severity-based Weights:** Use the default severity-based weights (critical=3, warning=1) as a baseline.

2. **Apply Custom Weights Strategically:** Only use custom weights for SLOs that truly warrant special attention:
   - Business-critical services that require higher weight than standard critical SLOs
   - Low-impact warnings that should have minimal effect on the score

3. **Document Your Weighting Decisions:** Add comments in your alerts.yaml to explain why specific custom weights were chosen.

4. **Test Your Scoring Profile:** Run chaos scenarios and review the resulting scores to ensure your weighting model reflects your actual priorities.

5. **Version Control Your Alerts:** Keep your alerts.yaml in version control and track changes to your SLO definitions and weights over time.

6. **Use Consistent Weight Scales:** If using custom weights, maintain a consistent scale (e.g., 1-20) to make weights comparable across SLOs.

### Example: Complete Alerts Profile with Custom Weights

```yaml
# Business-critical: Payment processing must stay available
- expr: up{job="payment-api"} == 0
  description: Payment API is completely down
  severity: critical
  weight: 20

# Business-critical: Core authentication service
- expr: up{job="auth-service"} == 0
  description: Authentication service is down
  severity: critical
  weight: 15

# Standard critical: etcd cluster health (uses default weight of 3)
- expr: etcd_server_has_leader{job=~".*etcd.*"} == 0
  description: etcd cluster has no leader
  severity: critical

# High-priority warning: API latency
- expr: histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
  description: 99th percentile API latency exceeds 1s
  severity: warning
  weight: 5

# Standard warning: Disk space (uses default weight of 1)
- expr: node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes < 0.2
  description: Root filesystem less than 20% free
  severity: warning

# Low-priority informational warning
- expr: rate(http_requests_total{code=~"4.."}[5m]) > 10
  description: High rate of client errors
  severity: warning
  weight: 0.5
```

In this example:
- Payment API downtime has the highest weight (20 points)
- Auth service downtime is also critical but slightly less weighted (15 points)
- Standard etcd health uses the default critical weight (3 points)
- API latency warnings are more important than standard warnings (5 points vs 1 point)
- Client error warnings have reduced impact (0.5 points)

This creates a scoring model that heavily emphasizes business-critical services while still accounting for platform stability and performance issues.
