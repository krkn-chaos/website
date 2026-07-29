---
type: "docs/scenarios"
title: VM Migration Chaos
description: Test live migration resilience in OpenShift Virtualization environments
date: 2017-01-04
weight: 15
---

## Overview

The VM Migration Chaos scenarios test the resilience of KubeVirt/OpenShift Virtualization live migration under adverse conditions. Live migration is one of the most complex operations in a virtualization platform -- it moves an active VM's memory, CPU state, and device state from one host to another while the VM continues running. Network disruptions, CPU pressure, or storage issues during this process can cause data corruption or VM outages.

These scenarios are critical for:
- Validating live migration correctness under network stress
- Testing node drain and evacuation behavior
- Detecting dual virt-launcher pod bugs (VM corruption risk)
- Ensuring migration completes or fails cleanly (no partial state)

**Scenario type:** `vm_migration_chaos_scenarios`

## Bug References

| Bug | Description | Scenario |
|-----|-------------|----------|
| CNV-89391 | Network disruption during migration leaves two virt-launcher pods (disk corruption risk) | `trigger_and_disrupt` |
| CNV-81533 | VM not evacuated during node drain, stuck in migrating state | `drain_node` |

## Prerequisites

- OpenShift cluster with CNV (OpenShift Virtualization) installed
- Target VM must be running and managed by a VirtualMachine resource
- SSH key-based access to worker nodes (for fault injection)
- `kubeconfig` with permissions to create VirtualMachineInstanceMigration objects
- VM must have a `LiveMigrate` eviction strategy configured

## Actions

### trigger_and_disrupt

Triggers a live migration for the specified VM and simultaneously injects a fault on the source node. This tests whether migration completes correctly under adverse conditions.

The sequence is:
1. Identify the source node where the VM is running
2. Create a VirtualMachineInstanceMigration (VMIM) object to trigger migration
3. Wait 5 seconds for migration to start
4. Inject the specified fault on the source node (runs in a background thread)
5. Wait for migration to complete or fail
6. Check for dual virt-launcher pods (if `verify_no_dual_pods: true`)
7. Clean up the VMIM object

Sample scenario file:
```yaml
vm_migration_chaos:
  vm_name: my-vm
  vm_namespace: default
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

#### Fault Types

| Fault Type | Description | Parameters |
|------------|-------------|------------|
| `network_latency` | Adds network latency using `tc netem` | `latency` (e.g., `200ms`), `interface` (e.g., `br-ex`), `duration` |
| `network_partition` | Blocks traffic to a specific IP using iptables | `target_ip`, `duration` |
| `node_cpu_stress` | Saturates CPU using `stress-ng` | `duration` |

{{% alert title="Note" %}}The `verify_no_dual_pods: true` setting is critical for detecting CNV-89391. When a network disruption occurs during migration, the migration controller may lose track of the source pod, leaving two virt-launcher pods running for the same VM. This can cause disk corruption as both pods may write to the same storage volume.{{% /alert %}}

### drain_node

Cordons and drains the node where the VM is running, forcing an evacuation-triggered migration. This tests whether the VM migrates correctly when a node is taken out of service for maintenance.

Sample scenario file:
```yaml
vm_migration_chaos:
  vm_name: my-vm
  vm_namespace: default
  migration_action: drain_node
  timeout: 600
  verify_no_dual_pods: true
```

{{% alert title="Note" %}}This scenario catches CNV-81533, where VMs with certain configurations would get stuck in a "Migrating" state during node drain and never complete the migration. The node drain would also hang, blocking maintenance operations.{{% /alert %}}

The sequence is:
1. Identify the node where the VM is running
2. Cordon the node (prevent new pod scheduling)
3. Drain the node (evict all pods, triggering VM migration)
4. Wait for migration to complete
5. Uncordon the node (restore scheduling)

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `vm_name` | string | required | Name of the VirtualMachineInstance to migrate |
| `vm_namespace` | string | `default` | Namespace of the VM |
| `migration_action` | string | `trigger_and_disrupt` | Action: `trigger_and_disrupt` or `drain_node` |
| `fault_type` | string | `network_latency` | Type of fault to inject (for `trigger_and_disrupt` only) |
| `fault_params` | dict | `{}` | Fault-specific parameters |
| `timeout` | int | `600` | Maximum seconds to wait for migration |
| `verify_no_dual_pods` | bool | `true` | Check for duplicate virt-launcher pods after migration |
| `ssh_user` | string | `core` | SSH username for fault injection |
| `ssh_private_key` | string | `~/.ssh/id_rsa` | Path to SSH private key |
| `ssh_port` | int | `22` | SSH port |

## Telemetry

Migration scenarios report affected node telemetry with the following statuses:
- `migrated` -- Migration completed successfully
- `migration_failed` -- Migration did not complete within the timeout
- `evacuated` -- VM was successfully evacuated during node drain
- `evacuation_failed` -- VM was not evacuated (stuck in migrating state)

Recovery time is measured from the start of the migration trigger to the VM being fully running on the target node.

## How to Run VM Migration Chaos Scenarios

Choose your preferred method to run VM migration chaos scenarios:

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
