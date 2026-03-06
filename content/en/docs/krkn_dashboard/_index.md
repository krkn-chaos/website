---
title: Krkn Dashboard
linkTitle: Krkn Dashboard
description: >
  Web-based UI to run and observe Krkn chaos scenarios, with Elasticsearch and Grafana integration.
weight: 3
---

Krkn Dashboard is the **visualization and control component** of [krkn-hub](https://github.com/krkn-chaos/krkn-hub). It provides a user-friendly web interface to run chaos experiments, watch runs in real time, and—when configured—inspect historical runs and metrics via Elasticsearch and Grafana. Instead of using the CLI or editing config files, you can trigger and monitor Krkn scenarios from your browser.

---

## What is Krkn Dashboard?

Krkn Dashboard is a web application that sits on top of [krkn-hub](/docs/installation/krkn-hub). The dashboard offers:

{{< slider-window >}}

---

## Features

### Run chaos scenarios from the UI

You can run the same chaos scenarios that [krkn-hub](/docs/installation/krkn-hub) supports, but by choosing a scenario and filling in the form in the dashboard:

1. **Choose a scenario** — e.g. pod-scenarios, container-scenarios, node-cpu-hog, node-io-hog, node-memory-hog, pvc-scenarios, node-scenarios, time-scenarios.
2. **Set parameters** — Namespace, label selectors, disruption count, timeouts, and other scenario-specific options (the UI fields map to the environment variables used by krkn-hub).
3. **Provide cluster access** — If running locally, either enter the path to your kubeconfig or upload a kubeconfig file. When running from a container, the dashboard uses a kubeconfig mounted at a fixed path.
4. **Start the run** — The dashboard starts the corresponding krkn-hub container (via Podman/Docker). You can then:
   - See the container in the list of running chaos runs.
   - Stream logs in real time in the UI.
   - Download logs or inspect run status until the container exits.

### Save and load configurations

You can save the current scenario and parameters and load them later. This avoids re-entering the same values and helps you recreate a specific test or share settings. Storage is in the browser (local storage/cookies).

### View past runs

If you use Elasticsearch to store Krkn run data, you can connect the dashboard to your Elasticsearch instance. After connecting, you can:

- Query run details by date range and filters.
- See historical chaos runs and their metadata in the dashboard.

This is optional. The dashboard works without Elasticsearch for running and monitoring live scenarios.

### Link to Grafana dashboards

When Elasticsearch is connected and you have configured Grafana, the dashboard can generate links to Grafana dashboards for a given run (e.g. by run UUID and other variables). That lets you jump from a run in the dashboard to the corresponding metrics and visualizations in Grafana. Grafana configuration is optional.

---

## Getting Started

Follow the [installation steps](/docs/installation/krkn-dashboard/) (local or containerized) to run the dashboard.
