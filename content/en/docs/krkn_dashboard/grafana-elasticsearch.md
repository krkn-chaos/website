---
title: Grafana and Elasticsearch
linkTitle: Grafana and Elasticsearch
description: Optional integrations for run history and metrics.
weight: 11
_build:
  list: never
  render: never
---

## Requirements for Grafana and Elasticsearch

These integrations are **optional**. The dashboard runs and executes chaos scenarios without them.

### Elasticsearch

The dashboard can connect to an Elasticsearch (or OpenSearch) instance to fetch and display past run details. Data is expected in indices with fields such as `timestamp` and scenario metadata (e.g. `scenarios.scenario_type`).

- **What you need**:
  - An Elasticsearch or OpenSearch instance reachable from the machine where the dashboard server runs (host and port, typically 9200).
  - **Index name(s)** that contain your Krkn run data.
  - **Optional:** Username and password if the cluster uses basic auth.
  - **Optional:** TLS/SSL; the dashboard can connect with or without SSL (e.g. `use_ssl` and certificate handling).

### Grafana

Grafana is used only to open pre-built dashboards for a specific chaos run. The dashboard generates URLs that pass variables into Grafana so you can see metrics for that run.

- **What you need**:
  - A **Grafana instance** base URL that the user's browser can reach.
  - A **Grafana datasource** that holds the metrics/logs for your chaos runs. You will need to use the **datasource ID**.
  - A **Dashboard ID** that corresponds to the dashboards imported or created.
