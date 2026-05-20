---
title: Storage I/O Throttle
description: Limits read/write IOPS and bandwidth on PVC-backed volumes using Linux cgroup I/O controls
date: 2017-01-04
weight: 3
---

This scenario throttles storage I/O on a PVC-backed volume used by a target pod. It limits **read/write IOPS** and **bandwidth** (bytes per second) using Linux cgroup controllers, allowing you to observe how your application behaves under degraded disk performance.

- **cgroups v2:** writes to `io.max`
- **cgroups v1:** writes to `blkio.throttle.*_device`

The plugin automatically detects the cgroup version, container runtime (CRI-O or containerd), and the block device backing the volume. No manual host configuration is required.

## Why Storage Throttle Scenarios Are Important

Many production incidents stem from slow or saturated storage, not complete outages. Storage I/O throttling lets you simulate realistic degraded-disk conditions and answer critical questions before they happen in production:

- **Database slowdowns:** Will your database handle reduced disk throughput gracefully, or will queries time out and cascade into application-level failures?
- **Write-ahead log (WAL) backpressure:** If writes to a WAL-backed volume slow down, does your system queue correctly or lose data?
- **Logging and monitoring pressure:** When log volumes become slow, do your applications block on writes or degrade silently?
- **Storage class validation:** Verify that your provisioned IOPS and throughput limits match application requirements under real workload conditions.
- **Pod eviction thresholds:** Test whether Kubernetes eviction policies trigger correctly when I/O-bound pods consume disproportionate resources.

## How It Works

The storage throttle scenario follows these steps:

1. **Resolve the target pod** — If `pvc_name` is provided, the plugin looks up which pod has the PVC mounted. Otherwise, it uses the `pod_name` directly.
2. **Find the PVC volume mount** — The plugin identifies the container and mount path for the PVC-backed volume inside the target pod. If `mount_path` is specified, only that specific mount is targeted.
3. **Discover the block device** — The block device `major:minor` is extracted from `/proc/self/mountinfo` inside the target container, which is reliable for CSI-provisioned volumes.
4. **Deploy a privileged helper pod** — A short-lived privileged pod is deployed on the same node as the target workload. It mounts the host root filesystem and uses `chroot` to access host cgroup files.
5. **Detect the cgroup version** — The helper pod checks whether the node uses cgroups v1 or v2.
6. **Discover the cgroup path** — The plugin finds the real host cgroup path for the target container by its container ID, excluding CRI-O conmon (container monitor) paths.
7. **Apply I/O throttle** — IOPS and/or bandwidth limits are written to the appropriate cgroup files.
8. **Hold for duration** — The throttle remains active for the configured duration, with progress logged every 30 seconds.
9. **Remove throttle** — Limits are reset to their default (unlimited) values.
10. **Cleanup** — The privileged helper pod is deleted.

{{% alert title="Note" %}}
**Rollback safety:** A rollback handler is registered before limits are applied. If the scenario fails or is interrupted, the throttle is automatically removed and the helper pod is cleaned up.
{{% /alert %}}

## Configuration Parameters

| Parameter | Description | Type | Default |
|-----------|-------------|------|---------|
| `pvc_name` | Target PVC name. If set, the pod is auto-resolved from the PVC. | string | `""` |
| `pod_name` | Target pod name. Ignored if `pvc_name` is set. | string | `""` |
| `namespace` | Namespace of the target PVC or pod. **Required.** | string | `""` |
| `mount_path` | Specific mount path to throttle. If empty, the first PVC mount is used. | string | `""` |
| `throttle_type` | Type of throttle to apply: `iops`, `bandwidth`, or `both`. | string | `bandwidth` |
| `read_iops` | Maximum read IOPS. Used when `throttle_type` is `iops` or `both`. | integer | `100` |
| `write_iops` | Maximum write IOPS. Used when `throttle_type` is `iops` or `both`. | integer | `50` |
| `read_bps` | Maximum read bytes per second. Used when `throttle_type` is `bandwidth` or `both`. Supports [unit suffixes](#supported-unit-suffixes). | string/integer | `1Mi` (1,048,576) |
| `write_bps` | Maximum write bytes per second. Used when `throttle_type` is `bandwidth` or `both`. Supports [unit suffixes](#supported-unit-suffixes). | string/integer | `512Ki` (524,288) |
| `duration` | How long to hold the throttle. Supports [duration suffixes](#supported-unit-suffixes). | string/integer | `60` (seconds) |
| `image` | Container image for the privileged helper pod. | string | `quay.io/krkn-chaos/krkn:tools` |

### Parameter Dependencies

- **`pvc_name` vs `pod_name`:** At least one is required. If both are set, `pvc_name` takes precedence and the pod is auto-resolved from the PVC.
- **`throttle_type` controls which limits apply:**
  - `iops` — only `read_iops` and `write_iops` are applied
  - `bandwidth` — only `read_bps` and `write_bps` are applied
  - `both` — all four limits are applied simultaneously

### Supported Unit Suffixes

**Byte values** (`read_bps`, `write_bps`) accept Kubernetes-style unit suffixes:

| Suffix | Type | Multiplier | Example |
|--------|------|------------|---------|
| `Ki` | Binary (kibibyte) | 1,024 | `512Ki` = 524,288 bytes/s |
| `Mi` | Binary (mebibyte) | 1,048,576 | `1Mi` = 1,048,576 bytes/s |
| `Gi` | Binary (gibibyte) | 1,073,741,824 | `1Gi` = 1,073,741,824 bytes/s |
| `K` | Decimal (kilobyte) | 1,000 | `500K` = 500,000 bytes/s |
| `M` | Decimal (megabyte) | 1,000,000 | `5M` = 5,000,000 bytes/s |
| `G` | Decimal (gigabyte) | 1,000,000,000 | `1G` = 1,000,000,000 bytes/s |
| *(none)* | Raw bytes | 1 | `1048576` = 1,048,576 bytes/s |

**Duration values** (`duration`) accept time suffixes:

| Suffix | Unit | Example |
|--------|------|---------|
| `s` | Seconds | `30s` = 30 seconds |
| `m` | Minutes | `2m` = 120 seconds |
| `h` | Hours | `1h` = 3,600 seconds |
| *(none)* | Seconds | `120` = 120 seconds |

## Prerequisites

- The target PVC must be in `Bound` state and mounted to a running pod.
- The privileged helper image (`quay.io/krkn-chaos/krkn:tools` by default) must be pullable on worker nodes.
- The cluster must allow privileged pods (required for writing to host cgroup files).
- Supported container runtimes: **CRI-O** and **containerd**.
- Supported cgroup versions: **v1** and **v2**.

## How to Run Storage I/O Throttle Scenarios

Choose your preferred method to run storage I/O throttle scenarios:

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
