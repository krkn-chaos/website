---
title: "Long-Term Storage"
description: Persist metrics from every chaos run into Elasticsearch to compare behavior across releases, dates, or cluster configurations.
weight: 3
categories: [Getting Started]
tags: [docs]
---

**Goal:** Persist metrics from every chaos run into Elasticsearch so you can compare behavior across releases, dates, or cluster configurations.

This journey enables regression analysis — for example, detecting that API server latency during a node failure has increased between software versions.

## What you need

- Everything from [Metrics Validation](../metrics-validation/)
- An Elasticsearch instance (self-hosted or managed) — need to set one up? See [installing Elasticsearch on a kind cluster](../../developers-guide/testing-changes.md#elasticsearch)
- krknctl installed

## Steps

1. **Complete [Metrics Validation](../metrics-validation/)** first to confirm Prometheus evaluation is working.

2. **Define your metrics profile** at `config/metrics.yaml`. This controls which Prometheus metrics are snapshotted and stored per run:

   ```yaml
   - query: irate(apiserver_request_total{verb="POST"}[2m])
     metricName: apiserverRequestRate

   - query: histogram_quantile(0.99, rate(etcd_disk_wal_fsync_duration_seconds_bucket[2m]))
     metricName: etcdFsyncLatencyP99
   ```

3. **Run a scenario** with both profiles mounted:

   ```bash
   krknctl run pod-scenarios \
     --metrics-profile config/metrics.yaml \
     --alerts-profile config/alerts.yaml
   ```

   After each scenario, metrics snapshots are stored alongside run metadata (scenario type, duration, cluster version, exit status).

4. **Deploy krkn-visualize** to query your data through pre-built Grafana dashboards for API performance, etcd health, node and pod scenarios, and more:

   ```bash
   krknctl visualize \
     --es-url https://elasticsearch.example.com \
     --es-username elastic \
     --es-password <your-password> \
     --prometheus-url https://prometheus.example.com \
     --prometheus-bearer-token <your-token> \
     --grafana-password <grafana-admin-password>
   ```

   This deploys [krkn-visualize](../../krkn-visualize.md) to your cluster and wires it to both Elasticsearch and Prometheus. To tear it down later:

   ```bash
   krknctl visualize --delete
   ```

## Reference docs

- [krknctl usage](../../krknctl/_index.md) — full flag reference for `run` and `visualize`
- [Performance Dashboards](../../krkn-visualize.md) — krkn-visualize dashboards and manual deploy script
- [Telemetry](../../krkn/telemetry.md) — understanding the data Krkn captures and stores per run
- [Installing Elasticsearch on a kind cluster](../../developers-guide/testing-changes.md#elasticsearch) — Helm-based setup for local testing

## Next steps

To generate a numerical resilience score on top of your Prometheus data, continue to [Resilience Score](../resilience-score/).
