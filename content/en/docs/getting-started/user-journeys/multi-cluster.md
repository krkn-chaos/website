---
title: "Multi-Cluster Orchestration"
description: Run chaos scenarios across multiple clusters or cloud environments from a single control point using krkn-operator.
weight: 5
categories: [Getting Started]
tags: [docs]
---

**Goal:** Run chaos scenarios across multiple clusters or cloud environments from a single control point — useful for validating a multi-region application or comparing cluster configurations.

The recommended approach for multi-cluster orchestration is **krkn-operator**: a Kubernetes operator that runs on a dedicated control plane cluster and dispatches chaos scenarios to any number of registered target clusters, without distributing credentials to individual users.

## How krkn-operator works

- A **control plane cluster** runs the operator and its web console
- **Target clusters** are registered once by an administrator (via kubeconfig, service account token, or username/password)
- Users select one or more targets through the web UI and launch scenarios — they never handle cluster credentials directly
- Scenarios run in parallel across all selected targets

This design preserves the original Krkn architecture (chaos runs from outside the cluster) while adding a secure, centralized orchestration layer.

## What you need

- A Kubernetes or OpenShift cluster to host the operator (the control plane cluster)
- Helm 3.0+
- kubeconfig or service account credentials for each target cluster (held by the admin, not shared with users)

## Steps

1. **Install krkn-operator** on your control plane cluster using Helm:

   ```bash
   helm install krkn-operator oci://quay.io/krkn-chaos/charts/krkn-operator \
     --version <VERSION> \
     --namespace krkn-operator-system \
     --create-namespace
   ```

   For production deployments with HA, external access, and monitoring, see the full [installation guide](../../krkn-operator/installation/_index.md).

2. **Access the web console** — for local testing use port-forwarding; for production expose it via Ingress, Gateway API, or OpenShift Route:

   ```bash
   kubectl port-forward svc/krkn-operator-console 3000:3000 -n krkn-operator-system
   ```

3. **Register target clusters** — as an administrator, open **Admin Settings → Cluster Targets → Add Target** and provide the cluster name and credentials for each cluster you want to target. See [Configuration](../../krkn-operator/configuration/_index.md) for the three supported auth methods (kubeconfig, service account token, username/password).

4. **Run a scenario across multiple clusters** — click **Run Scenario**, select one or more registered target clusters, choose a scenario, configure its parameters, and launch. The operator executes the scenario on all selected targets concurrently.

5. **Monitor in real time** — the home dashboard shows all active runs across all clusters. Click any run to see live log streaming and execution status.

## ACM/OCM integration

If your organization uses [Red Hat Advanced Cluster Management (ACM)](https://www.redhat.com/en/technologies/management/advanced-cluster-management) or [Open Cluster Management (OCM)](https://open-cluster-management.io/), install the operator with ACM integration enabled. It will automatically discover and sync all ACM-managed clusters as chaos targets — no manual credential management required:

```bash
helm install krkn-operator oci://quay.io/krkn-chaos/charts/krkn-operator \
  --version <VERSION> \
  --namespace krkn-operator-system \
  --create-namespace \
  --set acm.enabled=true
```

## Reference docs

- [krkn-operator overview](../../krkn-operator/_index.md) — architecture and security model
- [Installation](../../krkn-operator/installation/_index.md) — Helm values for Kubernetes, OpenShift, and ACM
- [Configuration](../../krkn-operator/configuration/_index.md) — adding target clusters and ACM integration
- [Usage](../../krkn-operator/usage/_index.md) — running and monitoring scenarios via the web console
