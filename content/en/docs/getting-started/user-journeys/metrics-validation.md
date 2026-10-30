---
title: "Metrics Validation"
description: Run chaos and automatically evaluate Prometheus metrics for a clear pass or fail without manual inspection.
weight: 2
categories: [Getting Started]
tags: [docs]
---

**Goal:** Run chaos and automatically evaluate Prometheus metrics — getting a clear pass or fail without manual inspection.

This journey is well suited to CI/CD pipelines where you cannot watch the cluster in real time.

## What you need

- Everything from the [Getting Started guide](../../) (install krknctl, create a test workload, and run a first scenario)
- A Prometheus instance accessible from where Krkn runs (auto-detected on OpenShift; set via scenario flags on Kubernetes) — for Kubernetes installation, follow the [kube-prometheus-stack Helm instructions](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack#usage).
- krknctl installed

## Steps

1. **Install krknctl** — follow the [installation guide](../../installation/krknctl.md).

2. **Create your alerts profile** at `config/alerts.yaml`. This defines the PromQL expressions Krkn evaluates after each scenario:

   ```yaml
   - expr: avg_over_time(histogram_quantile(0.99, rate(etcd_disk_wal_fsync_duration_seconds_bucket[2m]))[5m:]) > 0.01
     description: "etcd fsync latency too high: {{$value}}"
     severity: error

   - expr: sum(kube_pod_status_phase{phase="Failed"}) > 5
     description: "Too many failed pods: {{$value}}"
     severity: error
   ```

   Queries with `severity: error` cause Krkn to exit with a non-zero code. Queries with `severity: info` are logged only.

3. **Run a scenario** with the alerts profile mounted:

   ```bash
   krknctl run pod-scenarios --alerts-profile config/alerts.yaml
   ```

   Krkn evaluates the alert profile at the end of each scenario and reports pass or fail.

## Reference docs

- [SLO Validation](../../krkn/SLOs_validation.md) — full details on alert profiles and PromQL configuration
- [krknctl usage](../../krknctl/_index.md) — full flag reference for `run`
- [Prometheus Helm installation](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack#usage) — chart prerequisites and installation commands for Kubernetes

## Next steps

To persist metrics long-term for regression analysis across releases, continue to [Long-Term Storage](../long-term-storage/).
