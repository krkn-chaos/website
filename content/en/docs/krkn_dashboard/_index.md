---
title: Kraken Dashboard
linkTitle: Kraken Dashboard
description: >
  Web-based UI to run and observe Krkn chaos scenarios, with optional Elasticsearch and Grafana integration.
weight: 3
---

Kraken Dashboard is the **visualization and control component** of [krkn-hub](https://github.com/krkn-chaos/krkn-hub). It provides a user-friendly web interface to run chaos experiments, watch runs in real time, and—when configured—inspect historical runs and metrics via Elasticsearch and Grafana. Instead of using the CLI or editing config files, you can trigger and monitor Krkn scenarios from your browser.

---

## What is Kraken Dashboard?

Kraken Dashboard is a web application that sits on top of [krkn-hub](/docs/installation/krkn-hub). Krkn-hub supplies the container images and environment-variable–driven execution for [Krkn](https://github.com/krkn-chaos/krkn) chaos scenarios. The dashboard adds:

- **A graphical UI** — Select scenarios, set parameters, and start runs without using the command line.
- **Real-time visibility** — See running chaos containers and stream logs as scenarios execute.
- **Saved configurations** — Store and reuse scenario parameters (stored in your browser).
- **Optional integration** with Elasticsearch (to query and display past run details) and Grafana (to link to dashboards for a specific run).

The dashboard uses local browser storage and cookies for preferences and saved configs. It is built with PatternFly and runs as a Node.js server that talks to Podman (or Docker) to launch krkn-hub containers.

---

## What can it do, and how do I do it?

### Run chaos scenarios from the UI

You can run the same chaos scenarios that [krkn-hub](/docs/installation/krkn-hub) supports, but by choosing a scenario and filling in the form in the dashboard:

1. **Choose a scenario** — e.g. pod-scenarios, container-scenarios, node-cpu-hog, node-io-hog, node-memory-hog, pvc-scenarios, node-scenarios, time-scenarios.
2. **Set parameters** — Namespace, label selectors, disruption count, timeouts, and other scenario-specific options (the UI fields map to the environment variables used by krkn-hub).
3. **Provide cluster access** — Either enter the path to your kubeconfig or upload a kubeconfig file (standalone); in containerized mode, the dashboard uses a kubeconfig mounted at a fixed path).
4. **Start the run** — The dashboard starts the corresponding krkn-hub container (via Podman/Docker). You can then:
   - See the container in the list of running chaos runs.
   - Stream logs in real time in the UI.
   - Download logs or inspect run status until the container exits.

So in practice: select scenario → fill form → start → watch logs and status.

### Save and load configurations

You can save the current scenario and parameters (e.g. under a name) and load them later. This avoids re-entering the same values and helps you recreate a specific test or share settings (e.g. by exporting/backing up as needed). Storage is in the browser (local storage/cookies).

### View past runs (optional — Elasticsearch)

If you use Elasticsearch to store Krkn run data, you can connect the dashboard to your Elasticsearch instance (host, index, optional username/password, SSL). After connecting, you can:

- Query run details by date range and filters.
- See historical chaos runs and their metadata (e.g. scenario type, cluster version, node count) in the dashboard.

This is optional; the dashboard works without Elasticsearch for running and monitoring live scenarios.

### Link to Grafana dashboards (optional)

When Elasticsearch is connected and you have configured **Grafana** (base URL and datasource), the dashboard can generate links to Grafana dashboards for a given run (e.g. by run UUID and other variables). That lets you jump from a run in the dashboard to the corresponding metrics and visualizations in Grafana. Grafana configuration is optional and only needed if you want these links.

---

## Purpose and benefits of using the dashboard

| Benefit | What it means for you |
|--------|------------------------|
| **No CLI or Python** | Run chaos without installing Krkn locally or using krknctl; the UI drives krkn-hub containers for you. |
| **Same scenarios as krkn-hub** | You get the same reliability and behavior as running krkn-hub manually, with a consistent, repeatable way to set parameters. |
| **Point-and-click chaos** | Useful for demos, ad-hoc tests, and anyone who prefers a GUI over editing YAML or typing commands. |
| **Real-time logs** | See what’s happening during a run without opening a terminal or tracking container IDs. |
| **Reusable configs** | Save and load configurations to recreate a test or standardize runs across your team. |
| **Optional run history** | With Elasticsearch, you can search and inspect past runs; with Grafana, you can drill into metrics for a specific run. |

**When to use the dashboard** — Use it when you want a visual, form-driven way to run Krkn chaos (e.g. on a shared machine, for demos, or for teams that prefer a UI). For automation and CI/CD, [krkn-hub](/docs/installation/krkn-hub) or [krknctl](/docs/installation/krknctl.md) in scripts or pipelines is usually better.

---

## How to set up Kraken Dashboard

You can run the dashboard **standalone** (on your laptop or a server) or **containerized** (as its own container that uses Podman to start krkn-hub containers).

### Prerequisites (both methods)

- **Kubernetes cluster** — You need a cluster and a kubeconfig so that the krkn-hub containers started by the dashboard can target it. If you don’t have one, see [Kubernetes](https://kubernetes.io/docs/setup/), [minikube](https://minikube.sigs.k8s.io/docs/start/), [K3s](https://rancher.com/docs/k3s/latest/en/quick-start/), or [OpenShift](https://docs.openshift.com/container-platform/latest/welcome/index.html).
- **Podman (or Docker)** — The dashboard starts chaos runs by launching krkn-hub containers; the host where the dashboard runs must have Podman (or Docker) installed and available.

### Option 1: Standalone (local development or server)

1. **Install Node.js**  
   Install a current LTS version from [nodejs.org](https://nodejs.org).

2. **Clone the dashboard**  
   ```bash
   git clone https://github.com/krkn-chaos/krkn-dashboard.git
   cd krkn-dashboard
   ```

3. **Install dependencies and run**  
   ```bash
   npm install
   npm run dev
   ```  
   The app is served at **http://localhost:3000** (or the port shown in the terminal). The backend API runs on port 8000 by default.

4. **Use the UI** — Open the URL in your browser, pick a scenario, set parameters, and either point to your kubeconfig path or upload a kubeconfig. Then start a run; the dashboard will use the local Podman (or Docker) to run the krkn-hub container.

{{% alert title="Note" %}}For standalone runs, the dashboard expects Podman (or the container runtime you use) to be available on the same machine. Ensure your user can run `podman` (or `docker`) and that the kubeconfig you provide is valid for your cluster.{{% /alert %}}

### Option 2: Containerized (run the dashboard in a container)

This runs the dashboard itself inside a container; that container then starts krkn-hub chaos containers via Podman (e.g. via a mounted Podman socket).

1. **Clone a specific release (recommended)**  
   ```bash
   git clone --branch <RELEASE_TAG> --single-branch https://github.com/krkn-chaos/krkn-dashboard.git
   cd krkn-dashboard
   ```  
   Replace `<RELEASE_TAG>` with a tag from [krkn-dashboard releases](https://github.com/krkn-chaos/krkn-dashboard/releases).

2. **Build the image**  
   ```bash
   podman build -t krkn-dashboard:latest -f containers/Dockerfile .
   ```

3. **Prepare assets and kubeconfig**  
   ```bash
   export CHAOS_ASSETS=/var/tmp/chaos
   mkdir -p $CHAOS_ASSETS
   ```  
   Copy your kubeconfig into `$CHAOS_ASSETS` as `kubeconfig` (or mount it there when running the container).

4. **Run the container**  
   As root (or with appropriate permissions for the Podman socket):  
   ```bash
   podman run --env CHAOS_ASSETS \
     -v $CHAOS_ASSETS:/usr/src/chaos-dashboard/src/assets:z \
     -v /run/podman/podman.sock:/run/podman/podman.sock \
     --net=host -d --name krkn-dashboard krkn-dashboard:latest
   ```

5. **Open the dashboard** — In your browser, go to **http://localhost:3000**. The dashboard inside the container will use the mounted `CHAOS_ASSETS` for kubeconfig and the Podman socket to start krkn-hub containers.

{{% alert title="Tip" %}}Ensure the kubeconfig inside `CHAOS_ASSETS` is readable by the user running the dashboard process inside the container. For permission issues, flatten and fix permissions:  
`kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig`  
then copy or mount that file as `$CHAOS_ASSETS/kubeconfig`.{{% /alert %}}

---

## Requirements for Grafana and Elasticsearch

These integrations are **optional**. The dashboard runs and executes chaos scenarios without them.

### Elasticsearch (optional — run history and search)

- **Role** — The dashboard can connect to an Elasticsearch (or OpenSearch) instance to fetch and display past run details. Data is expected in indices with fields such as `timestamp` and scenario metadata (e.g. `scenarios.scenario_type`).
- **What you need**:
  - An Elasticsearch or OpenSearch instance reachable from the machine where the dashboard server runs (host and port, typically 9200).
  - **Index name(s)** that contain your Krkn run data.
  - **Optional:** Username and password if the cluster uses basic auth.
  - **Optional:** TLS/SSL; the dashboard can connect with or without SSL (e.g. `use_ssl` and certificate handling).
- **No specific version** is documented as required; a recent stable Elasticsearch or OpenSearch 2.x is typically compatible. The dashboard uses the OpenSearch/Elasticsearch client and queries by date range and filters.

### Grafana (optional — links to dashboards)

- **Role** — Grafana is used only to open pre-built dashboards for a specific chaos run. The dashboard generates URLs that pass variables (e.g. run UUID, datasource, platform, node count) into Grafana so you can see metrics for that run.
- **What you need**:
  - A **Grafana instance** (base URL) that the user’s browser can reach.
  - A **Grafana datasource** (e.g. Prometheus or Elasticsearch) that holds the metrics/logs for your chaos runs; you need the **datasource ID** (or name, depending on how the link is built).
  - **Dashboard IDs** — The dashboard code references specific dashboard IDs for different scenario types (e.g. pod vs node). Your Grafana should have the corresponding dashboards imported or created; the exact IDs can be configured or match the ones shipped with the project.
- **No specific Grafana version** is mandated; a recent stable release that supports the variable and URL format used by the dashboard is sufficient.

**Summary:** You do **not** need Grafana or Elasticsearch to run chaos from the dashboard. Add them only if you want to search past runs (Elasticsearch) or link from the dashboard to Grafana for per-run metrics (Grafana base URL + datasource + dashboards).

---

## What's next?

- **[Install krkn-hub](/docs/installation/krkn-hub)** — Understand how the container images and env vars work, which the dashboard uses under the hood.
- **[Browse scenarios](/docs/scenarios/)** — See which chaos scenarios are available and what parameters they expect; the dashboard forms map to these.
- **[Getting started](/docs/getting-started/)** — Run your first chaos test; you can do it from the dashboard once it’s set up.
