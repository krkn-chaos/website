---
title: Krkn Dashboard
linkTitle: Krkn Dashboard
description: >
  Web-based UI to run Krkn chaos scenarios, review past runs and replay on the host, and optionally connect to Elasticsearch and Grafana.
weight: 11
---

Krkn Dashboard is the **visualization and control component** of [krkn-hub](https://github.com/krkn-chaos/krkn-hub). It provides a user-friendly web interface to run chaos experiments, watch runs in real time, and—when configured—inspect historical runs and metrics via Elasticsearch and Grafana. Instead of using the CLI or editing config files, you can trigger and monitor Krkn scenarios from your browser.

---

## What is Krkn Dashboard?

Krkn Dashboard is a web application that sits on top of [krkn-hub](/docs/installation/krkn-hub). The dashboard offers:

{{< slider-window >}}

---

## Features

### Run chaos scenarios from the UI

You can run chaos scenarios from the **Run Kraken** page by choosing a scenario tile and filling in the form:

1. **Choose a scenario** — e.g. pod-scenarios, container-scenarios, node-cpu-hog, node-io-hog, node-memory-hog, pvc-scenarios, node-scenarios, time-scenarios.
2. **Set parameters** — Namespace, selectors, disruption counts, durations, and other scenario-specific options (the fields map to the environment variables used by krkn-hub).
3. **Provide cluster access** — Choose a group and upload or select a kubeconfig the group is allowed to use (see [Users and access](/docs/krkn_dashboard/users-and-access/)).
4. **Start the run** — The dashboard starts the corresponding krkn-hub container (via Podman/Docker). The **Running Kraken containers** table lists containers that are still running. When a run finishes, you can open **Past Runs** to see stored logs, outcomes, and replay options.

### Save and Replay Runs

The **Past Runs** page lists chaos jobs that have completed on the machine where the dashboard server runs. You only see runs for groups you belong to. Selecting a run shows metadata and captured logs.

You can save the current scenario and parameters and load them later. From **Past Runs**, you can open a finished job and use the Replay button to send the same scenario settings back to **Run Kraken**, adjust them if needed, and run the experiment again. Replaying a run by default uses the original run’s group.

This history does not require Elasticsearch.

### Elasticsearch runs

If you use Elasticsearch to store Krkn run data, open **Elastic Runs** and connect to your instance. After connecting, you can:
* Query run details by date range and filters
* View summary charts and graphs
* See historical chaos runs and their metadata in the dashboard
* Montitor alerts on the **Alert Analysis** tab 

You can disconnect and reconnect to a different cluster or index when needed.
Elasticsearch configuration is optional. The dashboard will still work without Elasticsearch for running jobs and using **Past Runs** on the host.

### Link to Grafana dashboards

When Elasticsearch is connected and you supply an optional **Grafana base URL** at connect time, the dashboard can link each run to its corresponding metrics and visualizations in Grafana. Grafana configuration is optional.

### Users, groups, and access control

Every person signs in with their own account. 
* **Platform admins** manage users, groups, kubeconfigs, and policies in **Administration** 
* **Platform users** run experiments and manage kubeconfigs for their groups.

See [Users, groups, and access control](/docs/krkn_dashboard/users-and-access/) for more information on platform roles, group roles, and cluster permissions.

---

## Getting Started

1. Follow the [installation steps](/docs/installation/krkn-dashboard/) to run the dashboard and sign in with the initial admin account.
2. Read [Using the UI](/docs/krkn_dashboard/using-the-ui/) to run scenarios and review past runs.
3. Configure [users and access](/docs/krkn_dashboard/users-and-access/) for your team.
