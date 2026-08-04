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

4. **Optional: set initial admin credentials** — You may preset your initial username and password through exporting the following environement variables in your terminal:

   ```bash
   export DASHBOARD_ADMIN_USERNAME=<admin>
   export DASHBOARD_ADMIN_PASSWORD=your-secure-password
   ```

   {{< notice type="warning" >}}
   Initial admin environment variables apply **only** when the user table is empty. If you omit these variables, the server generates a random username and password automatically.
   {{< /notice >}}

5. **Start the application.**

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

2. **Optional: set initial admin credentials** — You may preset your initial username and password through exporting the following environement variables in your terminal:

   ```bash
   export DASHBOARD_ADMIN_USERNAME=<admin>
   export DASHBOARD_ADMIN_PASSWORD=your-secure-password
   ```

   {{< notice type="warning" >}}
   Initial admin environment variables apply **only** when the user table is empty. If you omit these variables, the server generates a random username and password automatically.
   {{< /notice >}}

3. **Start the container.** From the `krkn-dashboard` repository root, run:

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

When the dashboard is running, open **http://localhost:3000** in your browser. You are redirected to sign in if you are not already authenticated. Use the 
dashboard to trigger Krkn scenarios.

---

## First-time setup: initial admin account

When the dashboard is first run with no database setup, it creates an initial **platform admin** account in **`default-group`**. The username and password for this account can either be **automatically generated**, or they can be set by exporting **`DASHBOARD_ADMIN_USERNAME`** and **`DASHBOARD_ADMIN_PASSWORD`** (see the optional steps under [local](#local-installation) or [container](#container-installation) installation above).

Use this initial admin account to add users and group memberships in the **Administration** tab. For platform roles, groups, group roles, and cluster permissions, see [Users, groups, and access control](/docs/krkn_dashboard/users-and-access/).

---

## Documentation

- [Krkn Dashboard overview and features](/docs/krkn_dashboard/) — what is krkn dashboard and how it fits with krkn-hub.
- [Users, groups, and access control](/docs/krkn_dashboard/users-and-access/) — platform roles, groups, and cluster policies.
- [Using the UI](/docs/krkn_dashboard/using-the-ui/) — navigating the dashboard.

