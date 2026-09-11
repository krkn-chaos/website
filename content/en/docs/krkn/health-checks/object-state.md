---
title: "Object State Health Checks"
description: "Monitor Kubernetes resource conditions during chaos testing"
weight: 2
---

## Overview

The Object State Health Check plugin allows you to monitor the state of any Kubernetes resource by checking conditions on those objects. This is useful for verifying that critical infrastructure components maintain their desired state during chaos testing.

## Features

- **Flexible Resource Monitoring**: Check any Kubernetes resource type (Pod, Deployment, StatefulSet, DaemonSet, etc.)
- **Condition-Based Checks**: Monitor specific conditions like Ready, Available, Progressing
- **Regex Pattern Matching**: Use regex patterns to match multiple objects with one check
- **Label Selector Support**: Filter objects by labels
- **Run Timing Control**: Use `run_during` to run checks at pre, during, or post chaos stages
- **All Must Pass**: When multiple objects match, ALL must be healthy for the check to pass

## Configuration

### Basic Structure

```yaml
object_state_checks:
    interval: 5                              # Check interval for continuous monitoring
    run_during: "during"                     # When to run: "pre", "during", "post", or ["pre", "post"]
    exit_on_failure: False                   # Fail on unhealthy objects
    config:
        - name: "check-name"                 # Descriptive name
          kind: "Pod"                        # Resource kind
          object_name: "my-pod-.*"          # Name or regex pattern
          namespace: "default"               # Namespace
          label_selector: ""                 # Optional label selector
          condition:
              type: "Ready"                  # Condition type
              status: "True"                 # Expected status
```

## Examples

### Check Pod Readiness

Verify that all etcd pods are Ready:

```yaml
object_state_checks:
    interval: 5
    run_during: ["pre", "during", "post"]
    exit_on_failure: True
    config:
        - name: "etcd-pods-ready"
          kind: "Pod"
          object_name: "etcd-.*"
          namespace: "kube-system"
          condition:
              type: "Ready"
              status: "True"
```

### Check Deployment Availability

Verify a deployment is Available:

```yaml
object_state_checks:
    interval: 10
    run_during: "post"
    exit_on_failure: True
    config:
        - name: "myapp-deployment-available"
          kind: "Deployment"
          object_name: "myapp"
          namespace: "default"
          condition:
              type: "Available"
              status: "True"
```

### Multiple Checks

Monitor different resource types:

```yaml
object_state_checks:
    interval: 5
    run_during: ["pre", "during", "post"]
    exit_on_failure: True
    config:
        - name: "kube-apiserver-ready"
          kind: "Pod"
          object_name: "kube-apiserver-.*"
          namespace: "kube-system"
          condition: {type: "Ready", status: "True"}

        - name: "etcd-ready"
          kind: "Pod"
          object_name: "etcd-.*"
          namespace: "kube-system"
          condition: {type: "Ready", status: "True"}

        - name: "app-deployment-available"
          kind: "Deployment"
          object_name: "my-app"
          namespace: "production"
          condition: {type: "Available", status: "True"}
```

## Multiple Object Behavior

**IMPORTANT**: When multiple objects match the pattern/labels, the health check requires **ALL** of them to pass.

### How It Works

```yaml
- name: "etcd-pods-ready"
  kind: "Pod"
  object_name: "etcd-.*"           # Matches: etcd-0, etcd-1, etcd-2
  namespace: "kube-system"
  condition: {type: "Ready", status: "True"}
```

**Behavior:**
- ✅ **Check PASSES** if: etcd-0 Ready=True AND etcd-1 Ready=True AND etcd-2 Ready=True
- ❌ **Check FAILS** if: ANY pod has Ready=False (e.g., etcd-1 is not ready)

## Common Condition Types

### Pods

| Condition Type | Status | Meaning |
|----------------|--------|---------|
| `Ready` | `True` | All containers are ready |
| `PodScheduled` | `True` | Pod has been scheduled to a node |
| `Initialized` | `True` | Init containers have completed |
| `ContainersReady` | `True` | All containers are ready |

### Deployments

| Condition Type | Status | Meaning |
|----------------|--------|---------|
| `Available` | `True` | Minimum availability requirements met |
| `Progressing` | `True` | Deployment is progressing |

### StatefulSets / DaemonSets

| Condition Type | Status | Meaning |
|----------------|--------|---------|
| `Ready` | `True` | All replicas/pods are ready |
| `Available` | `True` | Resource is available |

## Pattern Matching

### Exact Match
```yaml
object_name: "my-pod"  # Matches only "my-pod"
```

### Regex Pattern
```yaml
object_name: "etcd-.*"         # Matches etcd-0, etcd-1, etcd-2, etc.
object_name: ".*-worker-.*"    # Matches any name containing "-worker-"
object_name: "app-[0-9]+"      # Matches app-1, app-2, app-123, etc.
```

### Label Selectors
```yaml
kind: "Pod"
namespace: "production"
label_selector: "app=myapp,version=v2"
# Checks only pods with both labels
```

## Run Timing Examples

### Pre-Check: Gate Chaos on Healthy State

```yaml
object_state_checks:
    run_during: "pre"
    exit_on_failure: True
    config:
        - name: "control-plane-healthy"
          kind: "Pod"
          namespace: "kube-system"
          label_selector: "tier=control-plane"
          condition: {type: "Ready", status: "True"}
```

### During: Continuous Monitoring

```yaml
object_state_checks:
    interval: 5
    run_during: "during"
    exit_on_failure: False
    config:
        - name: "app-pods-status"
          kind: "Pod"
          namespace: "production"
          label_selector: "app=myapp"
          condition: {type: "Ready", status: "True"}
```

### Post-Check: Verify Recovery

```yaml
object_state_checks:
    run_during: "post"
    exit_on_failure: True
    config:
        - name: "all-deployments-available"
          kind: "Deployment"
          namespace: "production"
          condition: {type: "Available", status: "True"}
```

## Supported Resource Kinds

- Pod
- Deployment
- StatefulSet
- DaemonSet
- ReplicaSet

## See Also

- [Health Check Run Timing](run-during.md) - Control when health checks execute
- [Health Checks Overview](../) - HTTP and VMI health checks
- [Kube Virt Checks](../virt-checks.md) - VMI SSH connectivity checks
