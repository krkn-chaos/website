---
title: Grafana and Elasticsearch
linkTitle: Grafana and Elasticsearch
description: Optional integrations for run history and metrics.
weight: 11
---

## Requirements for Grafana and Elasticsearch

These integrations are **optional**. The dashboard runs and executes chaos scenarios without them.

### Elasticsearch

The dashboard can connect to an Elasticsearch (or OpenSearch) instance to fetch and display past run details.

- **What you need**:
  - An Elasticsearch or OpenSearch instance reachable from the machine where the dashboard server runs.
  - **Index name(s)** that contain your Krkn run data.
  - **Credentials:** Username and password if the cluster uses basic auth.

Once connected to your instance, you can filter your runs by several different parameters. Clicking a run displays analytics including cluster configurations, node summary information, pod recovery analytics, and object counts.

### Grafana

Grafana is used to open pre-built dashboards for a specific chaos run. Grafana dashboards are routed through [krkn visualize](https://github.com/krkn-chaos/visualize). The Krkn dashboard uses the parameters of each run to generate a link which returns a Grafana dashboard with a breakdown of that scenario's data.

- **What you need**:
  - A Grafana instance **base URL**, connected through krkn visualize.
