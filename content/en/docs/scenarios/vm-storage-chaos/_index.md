---
type: "docs/scenarios"
title: VM Storage Chaos
description: Storage disruption scenarios for OpenShift Virtualization environments
date: 2017-01-04
weight: 14
---

## Overview

The VM Storage Chaos scenarios target storage subsystems in OpenShift Virtualization (CNV) environments. These scenarios inject storage-layer faults — killing NFS/storage services, generating IO bursts, and filling storage volumes — to validate that VMs and their storage backends handle disruptions gracefully.

These scenarios are particularly valuable for:
- Validating NFS failover and recovery behavior
- Testing VM resilience under IO pressure
- Verifying storage capacity management and alerts
- Catching storage-related bugs in CNV environments

**Scenario type:** `vm_storage_chaos_scenarios`

## Bug References

| Bug | Description | Scenario |
|-----|-------------|----------|
| CNV-83991 | NFS server crash causes permanent VM disk disconnect | `kill_storage_service` |
| CNV-79002 | IO burst on host storage crashes VMI | `io_burst` |

## Prerequisites

- OpenShift cluster with CNV installed
- SSH key-based access to storage hosts and worker nodes
- `stress-ng` installed on target hosts (for IO burst scenarios)
- root or sudo access on target hosts

## Actions

### kill_storage_service

Stops a storage service (e.g., NFS server, Ceph OSD) on the target host for a specified duration, then restarts it. Tests whether VMs reconnect to storage after service recovery.

Sample scenario file:
```yaml
vm_storage_chaos:
  action: kill_storage_service
  storage_targets:
    - host: 192.168.1.50
      service: nfs-server
  ssh_user: root
  ssh_private_key: ~/.ssh/id_rsa
  duration: 300
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `storage_targets[].host` | string | required | IP or hostname of the storage server |
| `storage_targets[].service` | string | `nfs-server` | systemd service name to stop |
| `duration` | int | `300` | Seconds to keep the service stopped |

{{% alert title="Note" %}}This scenario catches CNV-83991, where NFS server crashes caused permanent VM disk disconnection that did not self-heal even after the NFS server recovered. Validating this is critical for any environment using shared storage for VM disks.{{% /alert %}}

### io_burst

Generates heavy IO load on the storage path using `stress-ng`, simulating IO contention from noisy neighbors or bulk data operations.

Sample scenario file:
```yaml
vm_storage_chaos:
  action: io_burst
  storage_targets:
    - host: 192.168.1.100
      path: /var/lib/containers
  ssh_user: root
  ssh_private_key: ~/.ssh/id_rsa
  duration: 300
  io_workers: 4
  io_bytes: 1G
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `storage_targets[].host` | string | required | IP or hostname of the target host |
| `storage_targets[].path` | string | `/var/lib/containers` | Path to stress with IO |
| `io_workers` | int | `4` | Number of IO worker threads |
| `io_bytes` | string | `1G` | Amount of data each worker processes |
| `duration` | int | `300` | Duration of the IO burst in seconds |

{{% alert title="Note" %}}This scenario catches CNV-79002, where IO bursts on the host storage path caused VMI crashes due to storage timeout misconfigurations.{{% /alert %}}

### fill_storage

Fills a storage path to a specified percentage using `fallocate`, simulating disk space exhaustion. Cleans up after the duration expires.

Sample scenario file:
```yaml
vm_storage_chaos:
  action: fill_storage
  storage_targets:
    - host: 192.168.1.100
      path: /var/lib/containers
  ssh_user: root
  ssh_private_key: ~/.ssh/id_rsa
  fill_percentage: 95
  duration: 300
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `storage_targets[].host` | string | required | IP or hostname of the target host |
| `storage_targets[].path` | string | `/var/lib/containers` | Path to fill |
| `fill_percentage` | int | `90` | Target disk usage percentage |
| `duration` | int | `300` | Seconds to keep the fill active |

## Common SSH Parameters

All VM Storage Chaos scenarios share these SSH configuration parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ssh_user` | string | `root` | SSH username |
| `ssh_private_key` | string | `~/.ssh/id_rsa` | Path to SSH private key |
| `ssh_port` | int | `22` | SSH port |

## Optional Parameters

The following parameters are parsed by the plugin but are **not yet implemented**. They are reserved for future use:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `verify_vm_recovery` | bool | `true` | (Not yet implemented) Will verify VM recovery after storage disruption |
| `recovery_timeout` | int | `600` | (Not yet implemented) Timeout in seconds for VM recovery verification |

## How to Run VM Storage Chaos Scenarios

Choose your preferred method to run VM storage chaos scenarios:

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
