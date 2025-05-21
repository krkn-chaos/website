---
title: KubeVirt VM Outage Scenario - Kraken
description: Detailed implementation of the KubeVirt VM Outage Scenario in Kraken
date: 2025-05-17
---

# KubeVirt VM Outage Scenario in Kraken

The `kubevirt_vm_outage` scenario in Kraken enables users to simulate VM-level disruptions by deleting a Virtual Machine Instance (VMI) to test resilience and recovery capabilities.

## Implementation

This scenario is implemented in Kraken's core repository, with the following key functionality:

1. Finding and validating the target VMI
2. Deleting the VMI using the KubeVirt API
3. Monitoring the recovery process
4. Implementing fallback recovery if needed

## Usage

You can use this scenario in your Kraken configuration file as follows:

```yaml
scenarios:
  - name: "kubevirt vm outage"
    scenario: kubevirt_vm_outage
    parameters:
      vm_name: <my-application-vm>
      namespace: <vm-workloads>
      duration: 60
```

## Detailed Parameters

| Parameter | Description | Required | Default | Example Values |
|-----------|-------------|----------|---------|----------------|
| vm_name | The name of the VMI to delete | Yes | N/A | "database-vm", "web-server-vm" |
| namespace | The namespace where the VMI is located | No | "default" | "openshift-cnv", "vm-workloads" |
| duration | How long to wait (in seconds) before attempting recovery | No | 60 | 30, 120, 300 |

## Execution Flow

When executed, the scenario follows this process:

1. **Initialization**: Validates KubeVirt is installed and configures the KubeVirt client
2. **VMI Validation**: Checks if the target VMI exists and is in Running state
3. **State Preservation**: Saves the initial state of the VMI
4. **Chaos Injection**: Deletes the VMI using the KubeVirt API
5. **Wait Period**: Waits for the specified duration
6. **Recovery Monitoring**: Checks if the VMI is automatically restored
7. **Manual Recovery**: If automatic recovery doesn't occur, manually recreates the VMI
8. **Validation**: Confirms the VMI is running correctly

## Integration with KubeVirt API

The scenario utilizes the KubeVirt Python client to interact with the KubeVirt API. Key API operations include:

- Reading VMI objects: `kubevirt_api.read_namespaced_virtual_machine_instance()`
- Deleting VMI objects: `kubevirt_api.delete_namespaced_virtual_machine_instance()`
- Creating VMI objects: `kubevirt_api.create_namespaced_virtual_machine_instance()`

## Advanced Use Cases

### Testing High Availability VM Configurations

This scenario is particularly useful for testing high availability configurations, such as:

- Clustered applications running across multiple VMs
- VMs with automatic restart policies
- Applications with cross-VM resilience mechanisms

### Combining with Other Scenarios

For more comprehensive testing, you can combine this scenario with other Kraken scenarios:

```yaml
scenarios:
  - name: "node outage with vm recovery test"
    scenario: node_stop_start_scenario
    parameters:
      # Node scenario parameters
  
  - name: "vm outage during node recovery"
    scenario: kubevirt_vm_outage
    parameters:
      vm_name: <critical-vm>
      namespace: <production>
      duration: 120
```
