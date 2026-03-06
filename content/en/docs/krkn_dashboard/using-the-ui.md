---
title: Using the UI
linkTitle: Using the UI
description: How to run scenarios and use the dashboard once it is running.
weight: 10
---

## Using the UI

Once the dashboard is running, open **http://localhost:3000** (or the port shown in the terminal) in your browser. Then:

1. **Pick a scenario** — Choose the chaos scenario you want to run.
2. **Set parameters** — Configure the scenario options in the form.
3. **Provide kubeconfig** — Point to your kubeconfig path on the host or upload a kubeconfig file so the dashboard can target your cluster.
4. **Start a run** — The dashboard uses the local Podman (or Docker) to start the krkn-hub container and run the scenario. Use the real-time logs in the UI to watch progress and spot any issues.
