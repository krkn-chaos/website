---
title: Getting Started with Running Scenarios
description: Getting started with Krkn-chaos
weight : 4
categories: [Best Practices, Placeholders]
tags: [docs]
---

{{% alert title="Not sure where to start?" color="info" %}}
Different teams use Krkn differently — from a quick manual smoke test to a scored resilience pipeline. **[Choose your path →](user-journeys/)** to find the setup that matches your goal.
{{% /alert %}}

## TL;DR

```bash
# 1. Install krknctl
curl -fsSL https://raw.githubusercontent.com/krkn-chaos/krknctl/refs/heads/main/install.sh | bash

# 2. Create a test workload
kubectl create namespace chaos-test
kubectl create deployment nginx-test --image=nginx --replicas=3 -n chaos-test

# 3. Run your first chaos scenario (pod disruption)
krknctl run pod-scenarios --namespace chaos-test --pod-label "app=nginx-test" --disruption-count 1

# 4. Verify pods recovered
kubectl get pods -n chaos-test -l app=nginx-test
```

---

## 5-Minute Quick Start

### Prerequisites

| Requirement | Minimum Version | Check Command |
|-------------|-----------------|---------------|
| Kubernetes or OpenShift cluster | 1.21+ | `kubectl version` |
| kubeconfig with cluster-admin access | — | `kubectl get nodes` |
| Docker **or** Podman | Docker 20.10+ / Podman 4.0+ | `docker --version` or `podman --version` |

### Step 1: Install krknctl

```bash
curl -fsSL https://raw.githubusercontent.com/krkn-chaos/krknctl/refs/heads/main/install.sh | bash
```

Verify the installation:

```bash
krknctl --version
```

{{% alert title="Tip" color="success" %}}
Enable shell auto-completion for the best experience:

**Bash:** `source <(krknctl completion bash)`

**Zsh:** `autoload -Uz compinit && compinit && source <(krknctl completion zsh)`
{{% /alert %}}

### Step 2: Explore available scenarios

```bash
krknctl list available
```

This shows all chaos scenarios you can run. For your first test, we will use `pod-scenarios`.

### Step 3: Run your first scenario

Use the test workload from the TL;DR (or any non-critical namespace):

```bash
krknctl run pod-scenarios \
  --namespace chaos-test \
  --pod-label "app=nginx-test" \
  --disruption-count 1 \
  --kill-timeout 180 \
  --expected-recovery-time 120
```

The scenario will:
1. Find pods matching the label `app=nginx-test` in the `chaos-test` namespace
2. Disrupt 1 pod (delete it)
3. Wait up to 180 seconds for the pod to be removed
4. Monitor recovery for up to 120 seconds

### Step 4: Check the results

While the scenario runs:

```bash
krknctl list running
```

**What success looks like:** The disrupted pod is deleted and Kubernetes recreates it. The new pod reaches `Ready` state within the `--expected-recovery-time` window. The scenario exits with code 0.

**What failure looks like:** The pod does not recover within the timeout. The scenario exits with a non-zero code and logs an error.

---

## Golden Path: Pod Scenario Walkthrough

This is a complete, copy-paste walkthrough using a sample nginx deployment.

### 1. Create a test workload

```bash
kubectl create namespace chaos-test
kubectl create deployment nginx-test --image=nginx --replicas=3 -n chaos-test
kubectl wait --for=condition=Available deployment/nginx-test -n chaos-test --timeout=60s
```

### 2. Verify pods are running

```bash
kubectl get pods -n chaos-test -l app=nginx-test
```

Expected output:
```
NAME                          READY   STATUS    RESTARTS   AGE
nginx-test-6d4cf56db6-abc12   1/1     Running   0          30s
nginx-test-6d4cf56db6-def34   1/1     Running   0          30s
nginx-test-6d4cf56db6-ghi56   1/1     Running   0          30s
```

### 3. Run the chaos scenario

```bash
krknctl run pod-scenarios \
  --namespace chaos-test \
  --pod-label "app=nginx-test" \
  --disruption-count 1
```

### 4. Observe recovery

In a separate terminal, watch the pods:

```bash
kubectl get pods -n chaos-test -l app=nginx-test -w
```

You should see one pod terminate and a replacement come up automatically. The scenario logs confirm success when the new pod reaches `Ready`.

### 5. Clean up

```bash
kubectl delete namespace chaos-test
krknctl clean
```

---

## Alternative Methods

### Krkn-hub (Containerized)

Krkn-hub runs scenarios as container images — ideal for CI/CD pipelines. Each scenario is a pre-built image on `quay.io/krkn-chaos/krkn-hub`.

```bash
podman run --net=host \
  -v ~/.kube/config:/home/krkn/.kube/config:Z \
  -e NAMESPACE=default \
  -e POD_LABEL="app=my-app" \
  -d quay.io/krkn-chaos/krkn-hub:pod-scenarios
```

See the [krkn-hub installation guide](../installation/krkn-hub.md) for full setup instructions.

**Note:** Krkn-hub runs one scenario type at a time per container.

### Krkn (Standalone Python)

Krkn is the core chaos engine — a Python program that can run multiple scenario types in a single execution using config files.

See the [krkn installation guide](../installation/krkn.md) and [configuration hints](getting-started-krkn.md) to get started.

**Note:** Krkn allows running multiple different scenario types and scenario files in one execution, unlike krkn-hub and krknctl.

---

## Next Steps

- **[Scenario Catalog](../scenarios/)** — Browse all available chaos scenarios with tags and descriptions
- **[Installation Options](../installation/)** — Detailed setup for krknctl, krkn-hub, and krkn
- **[Chaos Testing Guide](../chaos-testing-guide/)** — Best practices for chaos engineering
- **[Debugging Tips](../debugging/)** — Common errors and how to fix them
