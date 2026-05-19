---
title: Pod Path Provisioner Scenario
description: Test kind cluster storage resilience by terminating the local-path-provisioner pod
date: 2026-05-19
weight: 47
---

## Overview

The pod path provisioner scenario kills the `local-path-provisioner` pod in kind clusters to test storage provisioner recovery. This is relevant for kind-based CI environments and local development setups that use PVC-backed storage.

## Use Cases

- Validate local-path-provisioner restarts correctly after failure
- Test PVC recovery when the storage provisioner is unavailable
- Check that storage-dependent workloads handle provisioner downtime

## Scenario Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `namespace_pattern` | regex | Yes | - | Regex pattern to match the target namespace |
| `label_selector` | string | Yes | - | Label selector to match target pods |
| `krkn_pod_recovery_time` | integer | No | 120 | Expected pod recovery time in seconds |
| `timeout` | integer | No | 180 | Timeout for pod termination in seconds |
| `kill` | integer | No | 1 | Number of pods to terminate |
| `node_label_selector` | string | No | - | Target pods only on nodes with matching labels |
| `node_names` | list | No | - | List of specific node names to target pods on |

## Examples

### Kill the local-path-provisioner pod

```yaml
- id: kill-path-provisioner
  config:
    namespace_pattern: "local-path-storage"
    label_selector: "app=local-path-provisioner"
    krkn_pod_recovery_time: 20
    kill: 1
```

### Target pods on a specific node

```yaml
- id: kill-path-provisioner-on-node
  config:
    namespace_pattern: "local-path-storage"
    label_selector: "app=local-path-provisioner"
    node_label_selector: "kubernetes.io/hostname=kind-control-plane"
    krkn_pod_recovery_time: 20
    kill: 1
```

## Recovery Expectations

The `krkn_pod_recovery_time` parameter controls how long krkn waits for the pod to recover. Set this based on your kind cluster resources:

- A lightly loaded kind cluster recovers in about 20 seconds
- Increase this value if the cluster is under load or resource-constrained

## Related Scenarios

- [Pod Scenario](/docs/scenarios/pod-scenario/) - Generic pod kill by label for any namespace
- [Custom App Pod](/docs/scenarios/custom-app-pod/) - Kill pods by name pattern

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
