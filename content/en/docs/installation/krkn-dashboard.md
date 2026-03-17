---
title: Krkn Dashboard
description: How to install and run the Krkn Dashboard (local or containerized).
tags: [docs, dashboard]
weight: 5
---

The Krkn Dashboard is a web UI for running and observing Krkn chaos scenarios. You can run it **locally** (Node.js on your machine) or **containerized** (Podman/Docker).

---

## Prerequisites (both methods)

- **Kubernetes cluster** — You need a cluster and a kubeconfig so that the dashboard can target it for chaos runs. If you don't have one, see [Kubernetes](https://kubernetes.io/docs/setup/), [minikube](https://minikube.sigs.k8s.io/docs/start/), [K3s](https://rancher.com/docs/k3s/latest/en/quick-start/), or [OpenShift](https://docs.openshift.com/container-platform/latest/welcome/index.html).
- **Podman or Docker** — The dashboard starts chaos runs by launching krkn-hub containers; the host must have Podman (or Docker) installed and available.

---

## Local installation

Run the dashboard on your machine with Node.js.

### Prerequisites for local run

- **Node.js** — Install from [nodejs.org](https://nodejs.org).

### Clone and run locally

1. Clone the Krkn Dashboard repository:

   ```bash
   git clone https://github.com/krkn-chaos/krkn-dashboard.git
   cd krkn-dashboard
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the application:

   ```bash
   npm run dev
   ```

The application runs at **http://localhost:3000** (or the port shown in the terminal).

---

## Container installation

Build and run the dashboard in a container. The container uses Podman (or Docker) on the host to start krkn-hub chaos containers.

### Get the source (choose one method)

Check available releases at [krkn-dashboard releases](https://github.com/krkn-chaos/krkn-dashboard/releases).

**Method 1: Clone a specific release (recommended)**

```bash
# Replace <RELEASE_TAG> with your desired version (e.g., v1.0.0)
git clone --branch <RELEASE_TAG> --single-branch https://github.com/krkn-chaos/krkn-dashboard.git
cd krkn-dashboard
```

**Method 2: Download release tarball**

```bash
wget https://github.com/krkn-chaos/krkn-dashboard/archive/refs/tags/<RELEASE_TAG>.tar.gz
# Extract and cd into the directory
```

**Method 3: Clone latest release**

```bash
LATEST_TAG=$(curl -s https://api.github.com/repos/krkn-chaos/krkn-dashboard/releases/latest | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/')
git clone --branch $LATEST_TAG --single-branch https://github.com/krkn-chaos/krkn-dashboard.git
cd krkn-dashboard
echo "Cloned release: $LATEST_TAG"
```

### Build the image

Replace `<image-name>` with the image name and tag you want (e.g. `krkn-dashboard:latest`).

```bash
cd krkn-dashboard
podman build -t <image-name> -f containers/Dockerfile .
```

(Use `docker build` instead of `podman build` if you use Docker.)

### Run the container

1. Prepare a directory for assets (e.g. kubeconfig) in the git folder:

   ```bash
   export CHAOS_ASSETS=$(pwd)/src/assets
   ```

   Copy your kubeconfig into `$CHAOS_ASSETS` as `kubeconfig` (so the dashboard inside the container can target your cluster).

2. Run the container (as root or with permissions for the Podman socket). Replace `<container-name>` with the name you want for the container, and `<image-name>` with the image you built in the previous step.

   ```bash
   podman run --env CHAOS_ASSETS \
     -v $CHAOS_ASSETS:/usr/src/chaos-dashboard/src/assets:z \
     -v "$(pwd)/database:/data:z" \
     -v /run/podman/podman.sock:/run/podman/podman.sock \
     -p 3000:3000 -p 8000:8000 \
     --net=host -d --name <container-name> <image-name>
   ```

   For Docker, use `-v /var/run/docker.sock:/var/run/docker.sock` instead of the Podman socket path, and ensure the container can reach the Docker daemon.

3. Open **http://localhost:3000** in your browser to use the dashboard and trigger Krkn scenarios.

{{% alert title="Tip" %}}Ensure the kubeconfig inside `CHAOS_ASSETS` is readable by the user running the dashboard process in the container. For permission issues: `kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig`, then copy or mount that file as `$CHAOS_ASSETS/kubeconfig`.{{% /alert %}}

