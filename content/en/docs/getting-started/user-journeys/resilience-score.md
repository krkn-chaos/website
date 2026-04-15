---
title: "Resilience Score"
description: Generate a numerical score (0–100%) that represents how well your environment held up during chaos.
weight: 4
categories: [Getting Started]
tags: [docs]
---

**Goal:** Generate a numerical score (0–100%) that represents how well your environment held up during chaos — giving you more signal than a binary pass/fail.

A resilience score lets you track improvement over time, compare environments, and set score thresholds as release gates.

{{% alert title="Beta Feature" color="warning" %}}
Resiliency Scoring is currently in Beta. The configuration format and scoring behavior may change in future releases.
{{% /alert %}}

## What you need

- Everything from [Metrics Validation](../metrics-validation/)
- krknctl installed

## How scoring works

After a chaos scenario completes, Krkn evaluates a set of SLOs (defined as PromQL expressions) over the chaos time window. Each SLO is [weighted by severity](../../krkn/resiliency-score.md#the-scoring-algorithm):

- **Warning SLOs** — 1 point each
- **Critical SLOs** — 3 points each

The final score is `(points passed / total possible points) × 100`. A score of 95% indicates a robust system with minor degradation; 60% signals significant issues that need investigation even if the scenario technically passed.

When running via krknctl, resiliency scoring runs automatically in [controller mode](../../krkn/resiliency-score.md#execution-modes) — per-scenario scores are captured and aggregated across all scenarios in the run.

## Steps

1. **Complete [Metrics Validation](../metrics-validation/)** to confirm Prometheus evaluation is working.

2. **Define your SLOs** in `config/alerts.yaml`. Add a `severity` to each entry — scoring [weights them automatically](../../krkn/resiliency-score.md#defining-slos-with-custom-weights):

   ```yaml
   - expr: avg_over_time(histogram_quantile(0.99, rate(etcd_disk_wal_fsync_duration_seconds_bucket[2m]))[5m:]) > 0.01
     description: "etcd fsync latency above 10ms"
     severity: critical        # 3 points

   - expr: sum(kube_pod_status_phase{phase="Failed"}) > 0
     description: "any pods in Failed phase"
     severity: warning         # 1 point

   - expr: increase(apiserver_request_total{code=~"5.."}[5m]) > 10
     description: "API server 5xx errors during chaos"
     severity: critical        # 3 points
   ```

   You can also set a custom `weight:` on any entry to override the severity default — see [custom weights](../../krkn/resiliency-score.md#defining-slos-with-custom-weights) and a [complete example profile](../../krkn/resiliency-score.md#example-complete-alerts-profile-with-custom-weights).

3. **Run a scenario** with the alerts profile mounted:

   ```bash
   krknctl run pod-scenarios -–resiliency-file config/alerts.yaml
   ```

   The resiliency score is printed at the end of the run and written to `kraken.report` and `resiliency-report.json`.

   ```
   Resiliency Score: 87% (13/15 SLOs passed)
   ```

4. **Use the score as a gate** — in CI, check the exit code and parse the score from the output to enforce a minimum threshold before promoting a build.

## Reference docs

- [Resiliency Scoring](../../krkn/resiliency-score.md) — full algorithm, custom weights, and configuration reference
- [SLO Validation](../../krkn/SLOs_validation.md) — PromQL alert configuration that feeds into scoring
- [krknctl usage](../../krknctl/_index.md) — full flag reference for `run`

## Next steps

To orchestrate chaos across multiple clusters from a single control point, continue to [Multi-Cluster Orchestration](../multi-cluster/).
