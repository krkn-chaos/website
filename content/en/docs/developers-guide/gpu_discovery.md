---
title: NVIDIA GPU discovery with krkn-lib
description: Discover GPU inventory and retrieve fresh measurements from Kubernetes clusters
categories: [Developers Guide]
tags: [gpu, krkn-lib, docs]
weight: 2
---

# NVIDIA GPU discovery with krkn-lib

`NvidiaGpuInspector` helps scenario code identify NVIDIA GPUs in a Kubernetes cluster and read current measurements. It reports Kubernetes GPU resources, physical GPUs, MIG partitions, sharing configuration, installed GPU components, topology, and measurement availability.

The inspector uses read-only `nvidia-smi` queries in an existing Pod, or local NVML when explicitly configured. It does not create Pods, change GPU settings, or require Prometheus or DCGM.

## Before you start

Use a krkn-lib installation that includes `krkn_lib.gpu`. You need:

- A kubeconfig file stored outside the repository.
- Permission to read Nodes and Pods and to execute commands in the selected access Pod.
- A running GPU Operator driver Pod on each selected node, or an existing access Pod that contains `nvidia-smi`.

Find the context name for your cluster:

```bash
kubectl --kubeconfig /absolute/path/to/kube_config.yaml config get-contexts
```

Keep the kubeconfig readable only by its owner. Replace the path, context, and namespace in the examples below with your own values.

## Discover GPU inventory

```python
from krkn_lib.gpu import Availability, NvidiaGpuInspector

inspector = NvidiaGpuInspector.from_kubeconfig(
    "/absolute/path/to/kube_config.yaml",
    context="your-context",
    operator_namespace="nvidia-gpu-operator",
)

inventory = inspector.discover_inventory(timeout_seconds=30)

for node in inventory.nodes:
    print(node.name, node.status.value)

    for resource in node.resources:
        print(resource.name, resource.capacity, resource.allocatable)

    for gpu in node.physical_gpus:
        print(gpu.uuid, gpu.model, gpu.pci_bus_id)

    for partition in node.mig_partitions:
        print(partition.uuid, partition.parent_uuid, partition.profile)
```

Each node also has `sharing`, `stack`, `topology`, and `capabilities` records. Physical GPUs and MIG partitions are separate lists: a MIG partition is not an additional physical card. Kubernetes `allocatable` is not a count of currently unused GPUs.

Use `discover_inventory(node_names=["gpu-node"])` to inspect named nodes. If a later discovery cannot read a previously found node, pass `known_inventory=inventory` to retain its known identity and report the new failure.

## Retrieve fresh measurements

A snapshot reads measurements again; it does not reuse values from the inventory.

```python
import json

gpu_nodes = [
    node.name
    for node in inventory.nodes
    if node.physical_gpus or node.mig_partitions
]

if gpu_nodes:
    snapshot = inspector.snapshot(
        inventory,
        node_names=gpu_nodes,
        fields=[
            "memory_used_bytes",
            "gpu_utilization_percent",
            "sm_clock_mhz",
            "power_draw_w",
            "pcie_replay_count",
        ],
        timeout_seconds=30,
    )
    print(json.dumps(snapshot.to_dict(), indent=2))
```

Select exactly one of `node_names`, `device_uuids`, or `workload` for each snapshot. Select only the fields your scenario needs. Inventory and snapshots provide `to_dict()` for JSON serialization.

Every measurement includes its device UUID, scope, value, unit, type, source, observation time, status, and a reason when needed. Check `inventory.errors` and `snapshot.errors` alongside the returned records.

## Identify devices visible to a workload

Query a running container to find the GPU or MIG device it can see:

```python
mapping = inspector.resolve_container(
    namespace="my-test-namespace",
    pod_name="my-running-gpu-pod",
    container_name="gpu-test",
)

if mapping.status == Availability.AVAILABLE:
    snapshot = inspector.snapshot(
        inventory,
        workload=mapping,
        fields=["memory_used_bytes", "gpu_utilization_percent"],
    )
else:
    print(mapping.reason)
```

The container must be running and contain `nvidia-smi`. `visible_device_uuids` contains MIG UUIDs when MIG is active; `parent_gpu_uuids` lists their physical parents separately. Visibility does not establish per-container usage attribution under time-slicing.

## Other access paths

If GPU Operator is not installed, provide an existing running access Pod for each selected node:

```python
from krkn_lib.gpu import AccessPod

inspector = NvidiaGpuInspector.from_kubeconfig(
    "/absolute/path/to/kube_config.yaml",
    context="your-context",
    access_pods={
        "gpu-node-name": AccessPod(
            "existing-namespace",
            "existing-access-pod",
            "container-with-nvidia-smi",
        )
    },
)
```

If the Python process itself runs on a selected GPU node, install the optional `gpu` extra (`poetry install -E gpu` in a krkn-lib checkout) and pass `local_node_name="gpu-node-name"` to `from_kubeconfig()`. Do not set `local_node_name` when running on a laptop or another node.

## Interpret availability

| Status | Meaning |
|---|---|
| `available` | The source returned a meaningful value, including a real zero. |
| `unsupported` | The source explicitly reported that the field is unsupported, such as `N/A`. |
| `unavailable` | The query failed, timed out, or the device could not be reached. |
| `unknown` | The source omitted the field or did not provide enough evidence. |

Some Xid, NVLink, and MIG measurements may remain `unknown` because the selected source does not expose them. Driver-supported CUDA compatibility does not identify the CUDA toolkit installed in a workload image.

Physical GPU capabilities include `power_limit_control` and `clock_control`. An `available` status means a read-only source reported an allowed power range or supported clock pair. It does **not** establish permission to change a setting.

A timed-out local NVML query returns an unavailable result by the requested deadline. The native call may continue in the background; later local reads remain unavailable until it finishes.

## Kubernetes permissions

| Operation | Required access |
|---|---|
| Discover inventory | `get` and `list` Nodes; `get` and `list` Pods where the driver or access Pod runs |
| Query devices and measurements | `create` on the `pods/exec` subresource in that Pod's namespace |
| Map a workload | `get` Pods and `create` `pods/exec` in the workload namespace |

If `operator_namespace` is omitted, Pod discovery lists across all namespaces. Kubernetes uses the RBAC verb `create` for `pods/exec`; the inspector does not create a Pod.