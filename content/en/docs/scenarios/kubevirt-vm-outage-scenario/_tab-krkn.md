
# KubeVirt VM Outage Scenario in Kraken

The `kubevirt_vm_outage` scenario in Kraken enables users to simulate VM-level disruptions by deleting a Virtual Machine Instance (VMI) to test resilience and recovery capabilities.

Example scenario file: [kubevirt-vm-outage.yaml](https://github.com/krkn-chaos/scenarios-hub/blob/main/kubevirt/kubevirt-vm-outage.yaml)

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
      timeout: 60
      kill_count: 3
```

## Detailed Parameters

| Parameter | Description | Required | Default | Example Values |
|-----------|-------------|----------|---------|----------------|
| vm_name | The name of the VMI to delete | Yes | N/A | "database-vm", "web-server-vm" |
| namespace | The namespace where the VMI is located | No | "default" | "openshift-cnv", "vm-workloads" |
| timeout | How long to wait (in seconds) for VMI to become running before attempting recovery | No | 60 | 30, 120, 300 |
| kill_count | How many VMI's to kill serially | No | 1 | 3 |

## Execution Flow

When executed, the scenario follows this process:

1. **Initialization**: Validates KubeVirt is installed and configures the KubeVirt client
2. **VMI Validation**: Checks if the target VMI exists and is in Running state
3. **State Preservation**: Saves the initial state of the VMI
4. **Chaos Injection**: Deletes the VMI using the KubeVirt API
5. **Wait for Running**: Waits for VMI to become running again, up to the timeout specified
6. **Recovery Monitoring**: Checks if the VMI is automatically restored
7. **Manual Recovery**: If automatic recovery doesn't occur, manually recreates the VMI
8. **Validation**: Confirms the VMI is running correctly


## Sample Configuration

Here's an example configuration for using the `kubevirt_vm_outage` scenario:

```yaml
scenarios:
  - name: "kubevirt outage test"
    scenario: kubevirt_vm_outage
    parameters:
      vm_name: my-vm
      namespace: kubevirt
      duration: 60
      kill_count: 3
```

For multiple VMs in different namespaces:

```yaml
scenarios:
  - name: "kubevirt outage test - app VM"
    scenario: kubevirt_vm_outage
    parameters:
      vm_name: app-vm
      namespace: application
      duration: 120
      kill_count: 1
  
  - name: "kubevirt outage test - database VM"
    scenario: kubevirt_vm_outage
    parameters:
      vm_name: db-vm
      namespace: database
      duration: 180
      kill_count: 2
```

### Combining with Other Scenarios

For more comprehensive testing, you can combine this scenario with other Kraken scenarios in the list of chaos_scenarios in the config file:

```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ...
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/cpu-hog.yml
        -  kubevirt_vm_outage:
               - scenarios/kubevirt/kubevirt-vm-outage.yaml
```
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
