---
title: "Basic Run"
description: Run a chaos scenario and observe what happens — no metrics, no scoring, no pipeline.
weight: 1
categories: [Getting Started]
tags: [docs]
---

**Goal:** Run a chaos scenario and observe what happens — no metrics, no scoring, no pipeline.

This is the best starting point if you are new to Krkn or want to explore a specific scenario quickly.

## What you need

- A running Kubernetes or OpenShift cluster
- A kubeconfig with cluster access
- krknctl (recommended) or krkn installed

## Steps

1. **Install krknctl** — follow the [installation guide](../../installation/krknctl.md).

2. **List available scenarios** to find one that fits your target:

   ```bash
   krknctl list
   ```

3. **Run a scenario** — for example, to kill pods matching a label:

   ```bash
   krknctl run pod-scenarios
   ```

   krknctl will prompt you for required inputs interactively, or you can pass them as flags.

4. **Observe results** in your cluster using `kubectl` or your existing monitoring tools. Krkn logs pass/fail and recovery status to stdout.

   For pod scenarios specifically, you can confirm the pod was killed and recovered by checking its age. A restarted pod will show a much shorter uptime than its neighbours:

   ```bash
   kubectl get pods -A
   ```

   Example output after a pod scenario targeting the `my-app` namespace:

   ```bash
   NAMESPACE     NAME                          READY   STATUS    RESTARTS   AGE
   my-app        frontend-7d9f8b6c4-xk2pq      1/1     Running   0          8s
   my-app        backend-5c6d7f8b9-lm3rt        1/1     Running   0          4d2h
   kube-system   coredns-787d4945fb-nqpzj       1/1     Running   0          4d2h
   ```

   The `8s` age on `frontend` shows it was recently restarted by the scenario while all other pods remain unaffected.

## Next steps

- Read each [scenario's documentation](../../scenarios/_index.md) to understand what inputs are available.
- When you're ready to add automatic metric evaluation, continue to [Metrics Validation](../metrics-validation/).
