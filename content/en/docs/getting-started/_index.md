---
title: Getting Started
description: Getting started with Krkn-chaos
weight: 2
categories: [Best Practices]
tags: [docs]
---

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

## What you need

| Requirement | Minimum Version | Check Command |
|-------------|-----------------|---------------|
| Kubernetes or OpenShift cluster | 1.21+ | `kubectl version` |
| kubeconfig with cluster-admin access | — | `kubectl get nodes` |
| Docker **or** Podman | Docker 20.10+ / Podman 4.0+ | `docker --version` or `podman --version` |

---

## Basic Run

This is the best starting point if you are new to Krkn or want to explore a specific scenario quickly. No metrics, no scoring, no pipeline — just run a scenario and see what happens.

### 1. Install krknctl

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

### 2. Create a test workload

```bash
kubectl create namespace chaos-test
kubectl create deployment nginx-test --image=nginx --replicas=3 -n chaos-test
kubectl wait --for=condition=Available deployment/nginx-test -n chaos-test --timeout=60s
```

### 3. List available scenarios

```bash
krknctl list
```

This shows all chaos scenarios you can run. For your first test, we will use `pod-scenarios`.

### 4. Run a scenario

```bash
krknctl run pod-scenarios \
  --namespace chaos-test \
  --pod-label "app=nginx-test" \
  --disruption-count 1 \
  --kill-timeout 180 \
  --expected-recovery-time 120
```

krknctl will prompt you for required inputs interactively, or you can pass them as flags.

The scenario will:
1. Find pods matching the label `app=nginx-test` in the `chaos-test` namespace
2. Disrupt 1 pod (delete it)
3. Wait up to 180 seconds for the pod to be removed
4. Monitor recovery for up to 120 seconds

### 5. Observe results

In a separate terminal, watch the pods recover:

```bash
kubectl get pods -n chaos-test -l app=nginx-test -w
```

You can confirm the pod was killed and recovered by checking its age. A restarted pod will show a much shorter uptime than its neighbours:

```bash
NAMESPACE     NAME                          READY   STATUS    RESTARTS   AGE
chaos-test    nginx-test-7d9f8b6c4-xk2pq   1/1     Running   0          8s
chaos-test    nginx-test-5c6d7f8b9-lm3rt   1/1     Running   0          4d2h
chaos-test    nginx-test-787d4945fb-nqpzj   1/1     Running   0          4d2h
```

The `8s` age shows the pod was recently restarted by the scenario while the others remain unaffected.

**What success looks like:** The disrupted pod is deleted and Kubernetes recreates it. The new pod reaches `Ready` state within the `--expected-recovery-time` window. The scenario exits with code 0.
```json
{
  "recovered": [
    {
      "pod_name": "nginx-test-7d9f8b6c4-xk2pq",
      "namespace": "chaos-test",
      "pod_rescheduling_time": 2.3,
      "pod_readiness_time": 5.7,
      "total_recovery_time": 8.0
    }
  ],
  "unrecovered": []
}
```

**What failure looks like:** The pod does not recover within the timeout. The scenario exits with a non-zero code and logs an error.

```json
{
  "recovered": [],
  "unrecovered": [
    {
      "pod_name": "nginx-test-7d9f8b6c4-xk2pq",
      "namespace": "chaos-test",
      "pod_rescheduling_time": 0.0,
      "pod_readiness_time": 0.0,
      "total_recovery_time": 0.0
    }
  ]
}
```

### 6. Clean up

```bash
kubectl delete namespace chaos-test
krknctl clean
```

---

## Where to go next

Whether you're running your first scenario or building a production resilience pipeline, pick the journey that matches your goals:

| Journey | I want to... | Experience level | Tools needed |
|---|---|---|---|
| [Metrics Validation](user-journeys/metrics-validation/) | Automatically pass/fail based on Prometheus metrics | Intermediate | krknctl + Prometheus |
| [Resilience Score](user-journeys/resilience-score/) | Generate a scored report to validate an environment | Intermediate | krknctl + Prometheus |
| [Long-Term Storage](user-journeys/long-term-storage/) | Store metrics across runs for regression analysis | Advanced | krknctl + Prometheus + Elasticsearch |
| [Multi-Cluster Orchestration](user-journeys/multi-cluster/) | Run chaos across multiple clusters or clouds | Advanced | krkn-operator |

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

## Further Reading

- **[Scenario Catalog](../scenarios/)** — Browse all available chaos scenarios with tags and descriptions
- **[Installation Options](../installation/)** — Detailed setup for krknctl, krkn-hub, and krkn
- **[Chaos Testing Guide](../chaos-testing-guide/)** — Best practices for chaos engineering
- **[Debugging Tips](../debugging/)** — Common errors and how to fix them

---

## Analyzing Results

After a run completes, Krkn generates a `kraken.report` log and a `resiliency-report.json` with scored SLO results. See [Analyzing the Kraken Report](analyzing-report.md) for a full guide on interpreting the output.
