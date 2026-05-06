---
title: "Basic Run"
description: Run your first chaos scenario against a test workload — no metrics, no scoring, just see what happens when Krkn disrupts a pod.
weight: 1
categories: [Getting Started]
tags: [docs]
---

**Goal:** Run a chaos scenario from start to finish — no metrics, no scoring, no pipeline. This is the fastest way to see Krkn in action and verify your environment is set up correctly before layering in observability.

All other user journeys build on the steps here, so completing this first is recommended.

## What you need

| Requirement | Minimum Version | Check command |
|-------------|-----------------|---------------|
| Kubernetes or OpenShift cluster | 1.21+ | `kubectl version` |
| kubeconfig with cluster-admin access | — | `kubectl get nodes` |
| Docker **or** Podman | Docker 20.10+ / Podman 4.0+ | `docker --version` or `podman --version` |

## Steps

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

This shows all chaos scenarios you can run. For your first test, use `pod-scenarios`.

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

A restarted pod will show a much shorter uptime than its neighbours:

```text
NAMESPACE     NAME                          READY   STATUS    RESTARTS   AGE
chaos-test    nginx-test-7d9f8b6c4-xk2pq   1/1     Running   0          8s
chaos-test    nginx-test-5c6d7f8b9-lm3rt   1/1     Running   0          4d2h
chaos-test    nginx-test-787d4945fb-nqpzj   1/1     Running   0          4d2h
```

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

**What failure looks like:** The pod does not recover within the timeout. The scenario exits with a non-zero code and logs the unrecovered pod.

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

## Reference docs

- [krknctl installation guide](../../installation/krknctl.md) — full setup options including binary download and container image
- [pod-scenarios reference](../../scenarios/pod-scenarios/_index.md) — all flags and configuration for pod disruption
- [Scenario catalog](../../scenarios/) — browse all available chaos scenarios with descriptions

## Next steps

Now that you have verified Krkn can run against your cluster, add observability by continuing to [Metrics Validation](../metrics-validation/) — it shows how to automatically evaluate Prometheus metrics after each run so you get a clear pass or fail without manual inspection.
