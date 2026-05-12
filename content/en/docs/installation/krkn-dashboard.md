---
title: Krkn Dashboard
description: How to install and run the Krkn Dashboard (local, containerized, or via krknctl).
tags: [docs, dashboard]
weight: 5
---

The Krkn Dashboard is a web UI for running and observing Krkn chaos scenarios. You can run it **locally** (Node.js on your machine), **containerized** (Podman/Docker), or via **krknctl**. 

---

## Prerequisites (all methods)

- **Kubernetes cluster** — You need a cluster and a kubeconfig so that the dashboard can target it for chaos runs. If you don't have one, see [Kubernetes](https://kubernetes.io/docs/setup/), [minikube](https://minikube.sigs.k8s.io/docs/start/), [K3s](https://rancher.com/docs/k3s/latest/en/quick-start/), or [OpenShift](https://docs.openshift.com/container-platform/latest/welcome/index.html).
- **Podman or Docker** — The dashboard starts chaos runs by launching krkn-hub containers; the host must have Podman (or Docker) installed and available.

---

## Local installation

Run the dashboard on your machine with Node.js.

1. **Install Node.js** — Install from [nodejs.org](https://nodejs.org)

2. **Clone the repository.**

   ```bash
   git clone https://github.com/krkn-chaos/krkn-dashboard.git
   cd krkn-dashboard
   ```

3. **Install dependencies.**

   ```bash
   npm install
   ```

4. **Start the application.**

   ```bash
   npm run dev
   ```

---

## Container installation

Run the dashboard in a container on your host. The container uses Podman on the host to start krkn-hub chaos containers.

1. **Clone the repository.**

   ```bash
   git clone https://github.com/krkn-chaos/krkn-dashboard.git
   cd krkn-dashboard
   ```

   **NOTE:** You can optionally point the script at your local kubeconfig by exporting **`KUBECONFIG_PATH`** before you run it:

   ```bash
   export KUBECONFIG_PATH=<path/to/kubeconfig>
   ```

   If you do not set `KUBECONFIG_PATH`, the script uses **`<path/to/dashboard>/src/assets/kubeconfig`** by default. If using the default, you can copy your kubeconfig to that location.
   
   *In all cases, you can skip this configuration and upload a different kubeconfig from the dashboard UI.*

2. **Start the container.** From the `krkn-dashboard` repository root, run:

   ```bash
   bash containers/podman-run.sh
   ```

---

## Run with krknctl

You can start the Krkn Dashboard using **krknctl** instead of cloning the repository or building a container image.

1. **Install krknctl** — Follow the steps in [install krknctl](/docs/installation/krknctl/).

2. **Launch the dashboard** — The **`--kubeconfig`** flag **is required**. Pass the path to the kubeconfig for the cluster you want to target:

   ```bash
   krknctl dashboard --kubeconfig <path/to/kubeconfig>
   ```

   Replace `<path/to/kubeconfig>` with the path to your kubeconfig file. Optional flags can be viewed with `krknctl dashboard --help` or `krknctl dashboard -h`.

---

## Open the dashboard 

When the dashboard is running, open **http://localhost:3000** in your browser. Use the dashboard to trigger Krkn scenarios.

---

## Documentation

- [Krkn Dashboard overview and features](/docs/krkn_dashboard/) — what is krkn dashboard and how it fits with krkn-hub.
- [Using the UI](/docs/krkn_dashboard/using-the-ui/) — navigating the dashboard.

