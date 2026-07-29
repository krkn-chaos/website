---
type: "docs/scenarios"
title: VMware Migration Validation
description: Validate VMware-to-OpenShift Virtualization migrations with a 5-step chaos testing process
date: 2017-01-04
weight: 13
---

## Overview

When migrating virtual machines from VMware vSphere to OpenShift Virtualization (CNV), organizations need confidence that the migrated workloads are production-ready. Krkn provides a structured 5-step validation process that systematically tests the resilience of migrated VMs, catching real bugs that have affected production environments.

This validation pack addresses the unique risks of VMware-to-KVM migration: different storage backends, different network stacks, different live migration implementations, and different host resource management. Each step targets a specific failure mode documented in real CNV bug reports.

## Prerequisites

- OpenShift cluster with CNV (OpenShift Virtualization) installed
- VMs migrated from VMware using MTV (Migration Toolkit for Virtualization)
- SSH key-based access to OpenShift worker nodes (user: `core`)
- `stress-ng` installed on worker nodes (for CPU and IO stress steps)
- `kubeconfig` with access to the cluster

## The 5-Step Validation Process

### Step 1: Reboot All Migrated VM Nodes

**What it validates:** VM disk persistence, boot configuration, and basic VM lifecycle after migration.

**Bug reference:** Catches issues like CNV-83327, where Windows VMs had disks go offline after node reboot due to incorrect storage driver mapping during migration.

**Scenario type:** `node_scenarios` with `cloud_type: ssh`

Sample scenario file:
```yaml
node_scenarios:
  - actions:
      - node_reboot_scenario
    cloud_type: ssh
    targets:
      - <WORKER_NODE_1>
      - <WORKER_NODE_2>
    ssh_user: core
    ssh_private_key: ~/.ssh/id_rsa
    runs: 1
    timeout: 600
    kube_check: false
    soft_reboot: true
```

**What to look for:**
- All VMs come back to Running state after node reboot
- VM disks are accessible (not offline or read-only)
- VM network connectivity is restored
- Application inside VM is functioning

### Step 2: Network Chaos on Migrated VM Nodes

**What it validates:** Network resilience of migrated VMs under degraded conditions. VMware and OpenShift use different network stacks (NSX vs OVN-Kubernetes), so network behavior under stress can differ.

**Bug reference:** Catches issues like CNV-90425, where migrated VMs experienced severe performance degradation under network stress that did not occur on VMware.

**Scenario type:** `network_chaos_scenarios`

Sample scenario file:
```yaml
network_chaos:
  targets:
    - <WORKER_NODE_1>
  ssh_user: core
  ssh_private_key: ~/.ssh/id_rsa
  duration: 120
  interfaces: []
  execution: serial
  egress:
    latency: 100ms
```

**What to look for:**
- VM applications remain responsive (within expected latency bounds)
- No VM crashes or unexpected restarts
- Network recovers cleanly after chaos ends

### Step 3: Storage IO Stress

**What it validates:** Storage subsystem resilience. VMware VMDK storage and OpenShift PV-backed storage have fundamentally different IO paths. This step ensures the new storage backend handles IO pressure.

**Bug reference:** Catches issues like CNV-79002, where IO burst caused VMI crashes due to storage timeout misconfigurations in the migrated environment.

**Scenario type:** `vm_storage_chaos_scenarios` with action `io_burst`

Sample scenario file:
```yaml
vm_storage_chaos:
  action: io_burst
  storage_targets:
    - host: <WORKER_NODE_1>
      path: /var/lib/containers
  ssh_user: core
  ssh_private_key: ~/.ssh/id_rsa
  duration: 300
  io_workers: 4
  io_bytes: 1G
```

{{% alert title="Note" %}}The `verify_vm_recovery` and `recovery_timeout` parameters are parsed by the plugin but are not yet implemented. They are reserved for future use to automatically verify VM recovery after storage disruption.{{% /alert %}}

**What to look for:**
- VMs remain running during IO stress
- No storage timeouts or PV disconnections
- VM applications remain responsive (may be slower, but not crashed)
- Storage recovers cleanly after stress ends

### Step 4: Host CPU Stress

**What it validates:** Host resource contention handling. When host CPUs are saturated, virt-handler health checks and kubelet liveness probes can fail, potentially causing unnecessary VM evictions.

**Bug reference:** Catches issues like CNV-89810, where virt-handler liveness probe timeouts under CPU stress caused the virt-handler pod to restart, triggering cascading failures.

**Scenario type:** `hog_scenarios`

Sample scenario file:
```yaml
hog-type: cpu
targets:
  - <WORKER_NODE_1>
ssh_user: core
ssh_private_key: ~/.ssh/id_rsa
node-selector: ""
duration: 300
workers: 0
cpu-load-percentage: 90
```

**What to look for:**
- VMs remain running (not evicted by resource pressure)
- virt-handler pods remain healthy
- Kubelet does not restart
- VMs recover normal performance after stress ends

### Step 5: Live Migration Under Network Stress

**What it validates:** Live migration correctness under adverse conditions. This is the most critical test — live migration moves VM memory and state between hosts, and network disruptions during this process can cause data corruption.

**Bug reference:** Catches issues like CNV-89391, where network disruption during live migration left two virt-launcher pods running simultaneously (one on source, one on target), risking VM disk corruption.

**Scenario type:** `vm_migration_chaos_scenarios`

Sample scenario file:
```yaml
vm_migration_chaos:
  vm_name: <MIGRATED_VM_NAME>
  vm_namespace: <NAMESPACE>
  migration_action: trigger_and_disrupt
  fault_type: network_latency
  fault_params:
    latency: 200ms
    interface: br-ex
    duration: 30
  ssh_user: core
  ssh_private_key: ~/.ssh/id_rsa
  verify_no_dual_pods: true
  timeout: 600
```

**What to look for:**
- Migration completes successfully (or fails cleanly)
- No dual virt-launcher pods after migration (the `verify_no_dual_pods` check)
- VM is running on the target node and accessible
- No data corruption in VM disks

{{% alert title="Note" %}}The `verify_no_dual_pods: true` setting is critical. If two virt-launcher pods are running for the same VM, this indicates a serious bug that can lead to disk corruption. Krkn will fail the scenario and log a clear error referencing CNV-89391.{{% /alert %}}

## Running the Full Validation

Choose your preferred method to run the full validation:

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

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | All validation steps passed |
| 1 | One or more steps failed (check logs for which step and specific failure) |

## Summary of Bugs Caught

| Step | Bug Reference | Failure Mode |
|------|---------------|-------------|
| 1 — Node Reboot | CNV-83327 | Windows VM disks go offline after reboot |
| 2 — Network Chaos | CNV-90425 | Performance degradation differs from VMware |
| 3 — Storage IO | CNV-79002 | IO burst crashes VMI |
| 4 — CPU Stress | CNV-89810 | virt-handler liveness probe timeout |
| 5 — Migration | CNV-89391 | Dual virt-launcher pods, disk corruption risk |
