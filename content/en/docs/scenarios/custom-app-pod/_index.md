---
title: Custom App Pod Scenario
description: Test application resilience by terminating specific application pods using pattern matching
date: 2024-05-19
weight: 45
---

## Overview

The custom app pod scenario tests how your application responds when specific pods are terminated. Unlike generic pod kill scenarios, this scenario lets you target pods by name pattern, making it useful for testing behavior when specific components fail.

## Use Cases

- Test deployment rollout when specific pod instances are killed
- Verify application logic that depends on pod naming conventions
- Test multi-replica applications with specialized pod roles
- Validate monitoring and alerting for specific pod failures

## Scenario Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `namespace_pattern` | regex | Yes | - | Regex pattern to match target namespace |
| `name_pattern` | regex | Yes | - | Regex pattern to match pod names |
| `krkn_pod_recovery_time` | integer | No | 120 | Expected pod recovery time in seconds |
| `timeout` | integer | No | 180 | Timeout for pod termination operation in seconds |
| `kill` | integer | No | 1 | Number of pods to terminate matching the criteria |
| `node_label_selector` | string | No | - | Optional: Target pods only on nodes with matching labels |
| `node_names` | list | No | - | List of specific node names to target pods on |

## Examples

### Target coredns pods in kube-system

This example terminates coredns pods to test DNS resilience:

```yaml
- id: kill-coredns
  config:
    namespace_pattern: "^kube-system$"
    name_pattern: "coredns.*"
    krkn_pod_recovery_time: 120
    timeout: 180
    kill: 1
```

### Target custom application pods

Target application-specific pods:

```yaml
- id: kill-app-pods
  config:
    namespace_pattern: "^my-app$"
    name_pattern: "my-app-worker-.*"
    krkn_pod_recovery_time: 60
    kill: 2
```

### Target pods on specific nodes

Combine with node label selector:

```yaml
- id: kill-app-worker-nodes
  config:
    namespace_pattern: "my-app"
    name_pattern: "worker.*"
    node_label_selector: "node-role.kubernetes.io/worker="
    krkn_pod_recovery_time: 90
```

## Pattern Matching

Both `namespace_pattern` and `name_pattern` use regex syntax:

- `.` - matches any character
- `.*` - matches any characters (zero or more)
- `^` - matches start of string
- `$` - matches end of string
- `|` - matches either pattern

Examples:
- `^kube-system$` - exactly matches "kube-system"
- `coredns.*` - matches "coredns" followed by anything
- `worker-[0-9]` - matches "worker-" followed by a digit

## Recovery Expectations

The `krkn_pod_recovery_time` parameter tells krkn how long to wait for pods to recover. Set this based on your deployment configuration:

- Pods with `imagePullPolicy: Always` need more time
- Deployments with multiple replicas recover faster
- Stateful services may have longer recovery times

## Related Scenarios

- [Pod Scenario](/docs/scenarios/pod-scenario/) - Kill pods without pattern matching
- [Node Scenarios](/docs/scenarios/node-scenarios/) - Disrupt entire nodes

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" lang="krkn-hub" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}
