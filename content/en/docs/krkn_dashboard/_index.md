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

Krkn Dashboard is a web application that sits on top of [krkn-hub](/docs/installation/krkn-hub). Krkn-hub supplies the container images and environment-variable–driven execution for [Krkn](https://github.com/krkn-chaos/krkn) chaos scenarios. The dashboard adds:

- **A graphical UI** — Select scenarios, set parameters, and start runs without using the command line.
- **Real-time visibility** — See running chaos containers and stream logs as scenarios execute.
- **Saved configurations** — Store and reuse scenario parameters (stored in your browser).
- **Optional integration** with Elasticsearch (to query and display past run details) and Grafana (to link to dashboards for a specific run).

The dashboard uses local browser storage and cookies for preferences and saved configs. It is built with PatternFly and runs as a Node.js server that talks to Podman (or Docker) to launch krkn-hub containers.

---

## Features

### Run chaos scenarios from the UI

You can run the same chaos scenarios that [krkn-hub](/docs/installation/krkn-hub) supports, but by choosing a scenario and filling in the form in the dashboard:

1. **Choose a scenario** — e.g. pod-scenarios, container-scenarios, node-cpu-hog, node-io-hog, node-memory-hog, pvc-scenarios, node-scenarios, time-scenarios.
2. **Set parameters** — Namespace, label selectors, disruption count, timeouts, and other scenario-specific options (the UI fields map to the environment variables used by krkn-hub).
3. **Provide cluster access** — Either enter the path to your kubeconfig or upload a kubeconfig file (standalone); in containerized mode, the dashboard uses a kubeconfig mounted at a fixed path.
4. **Start the run** — The dashboard starts the corresponding krkn-hub container (via Podman/Docker). You can then:
   - See the container in the list of running chaos runs.
   - Stream logs in real time in the UI.
   - Download logs or inspect run status until the container exits.

So in practice: select scenario → fill form → start → watch logs and status.

### Save and load configurations

You can save the current scenario and parameters and load them later. This avoids re-entering the same values and helps you recreate a specific test or share settings (e.g. by exporting/backing up as needed). Storage is in the browser (local storage/cookies).

### View past runs

If you use Elasticsearch to store Krkn run data, you can connect the dashboard to your Elasticsearch instance. After connecting, you can:

- Query run details by date range and filters.
- See historical chaos runs and their metadata in the dashboard.

This is optional. The dashboard works without Elasticsearch for running and monitoring live scenarios.

### Link to Grafana dashboards (optional)

When Elasticsearch is connected and you have configured **Grafana** (base URL and datasource), the dashboard can generate links to Grafana dashboards for a given run (e.g. by run UUID and other variables). That lets you jump from a run in the dashboard to the corresponding metrics and visualizations in Grafana. Grafana configuration is optional and only needed if you want these links.

---

## Benefits of using the dashboard

| Benefit | What it means for you |
|--------|------------------------|
| **Central space for visualization and collaboration** | One place to view runs, share configurations, and collaborate with your team—see status, logs, and history in a single UI instead of scattered terminals or configs. |
| **Same scenarios as krkn-hub** | You get the same reliability and behavior as running krkn-hub manually, with a consistent, repeatable way to set parameters. |
| **Point-and-click chaos** | Useful for demos, ad-hoc tests, and anyone who prefers a GUI over editing YAML or typing commands. |
| **Real-time logs** | See what’s happening during a run without opening a terminal or tracking container IDs. Spot failures and deficiencies as they happen so you can locate and fix issues faster. |
| **Reusable configs** | Save and load configurations to recreate a test or standardize runs across your team. |
| **Analyze run history** | With Elasticsearch, you can search and inspect past runs. With Grafana, you can deep-dive into metrics for a specific run. |

**When to use the dashboard** — Use it when you want a visual, form-driven way to run Krkn chaos (e.g. on a shared machine, for demos, or for teams that prefer a UI). For automation and CI/CD, [krkn-hub](/docs/installation/krkn-hub) or [krknctl](/docs/installation/krknctl.md) in scripts or pipelines is usually better.

---

## Getting Started with Krkn Dashboard

You can run the dashboard **standalone** (on your laptop or a server) or **containerized** (as its own container that uses Podman to start krkn-hub containers).

### Prerequisites and Instructions

- **Kubernetes cluster** — You need a cluster and a kubeconfig so that the krkn-hub containers started by the dashboard can target it. If you don’t have one, see [Kubernetes](https://kubernetes.io/docs/setup/), [minikube](https://minikube.sigs.k8s.io/docs/start/), [K3s](https://rancher.com/docs/k3s/latest/en/quick-start/), or [OpenShift](https://docs.openshift.com/container-platform/latest/welcome/index.html).
- **Podman (or Docker)** — The dashboard starts chaos runs by launching krkn-hub containers. The host where the dashboard runs must have Podman (or Docker) installed and available.

**Option 1: Locally** — For full steps to run the dashboard on your machine, see the [krkn-dashboard README — local setup](https://github.com/khandrew-redhat/krkn-dashboard/blob/main/docs/installation.md).

**Option 2: Containerized** — For full steps to run the dashboard in a container, see the [krkn-dashboard README — containerized setup](https://github.com/khandrew-redhat/krkn-dashboard/blob/main/containers/build_own_image-README.md).

### Using the UI

Once the dashboard is running, open **http://localhost:3000** (or the port shown in the terminal) in your browser. Then:

1. **Pick a scenario** — Choose the chaos scenario you want to run.
2. **Set parameters** — Configure the scenario options in the form.
3. **Provide kubeconfig** — Point to your kubeconfig path on the host or upload a kubeconfig file so the dashboard can target your cluster.
4. **Start a run** — The dashboard uses the local Podman (or Docker) to start the krkn-hub container and run the scenario. Use the real-time logs in the UI to watch progress and spot any issues.

---

## Requirements for Grafana and Elasticsearch

These integrations are **optional**. The dashboard runs and executes chaos scenarios without them.

### Elasticsearch (run history and search)

dashboard can connect to an Elasticsearch (or OpenSearch) instance to fetch and display past run details. Data is expected in indices with fields such as `timestamp` and scenario metadata (e.g. `scenarios.scenario_type`).
- **What you need**:
  - An Elasticsearch or OpenSearch instance reachable from the machine where the dashboard server runs (host and port, typically 9200).
  - **Index name(s)** that contain your Krkn run data.
  - **Optional:** Username and password if the cluster uses basic auth.
  - **Optional:** TLS/SSL; the dashboard can connect with or without SSL (e.g. `use_ssl` and certificate handling).


### Grafana (links to dashboards)

Grafana is used only to open pre-built dashboards for a specific chaos run. The dashboard generates URLs that pass variables into Grafana so you can see metrics for that run.
- **What you need**:
  - A **Grafana instance** base URL that the user’s browser can reach.
  - A **Grafana datasource** that holds the metrics/logs for your chaos runs. You will need to use the **datasource ID**.
  - A **Dashboard ID** that corresponds to the dashboards imported or created.