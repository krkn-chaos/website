
# VMI Outage Scenario in Kraken

The `vmi_outage` scenario in Kraken enables users to simulate VM-level disruptions by deleting a Virtual Machine Instance (VMI) to test resilience and recovery capabilities.

Example scenario file: [vmi-outage.yaml](https://github.com/krkn-chaos/scenarios-hub/blob/main/cnv/snapshot_creation_disruption.yaml)

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
  - name: "vmi outage"
    scenario: vmi_outage
    parameters:
      vm_name: <my-application-vm>
      namespace: <vm-workloads>
      timeout: 60
      disable_auto_restart: false
      kill_count: 3
      # Optional: Running → first guest ICMP ping MTTR
      wait_for_guest_ping: false
```

## Detailed Parameters

| Parameter | Description | Required | Default | Example Values |
|-----------|-------------|----------|---------|----------------|
| vm_name | The name of the VMI to delete | Yes* | N/A | "database-vm", "web-server-vm" |
| label_selector | Label selector to target VMIs; optional if `vm_name` is set | Yes* | N/A | "app=myvm" |
| namespace | The namespace where the VMI is located | No | "default" | "openshift-cnv", "vm-workloads" |
| timeout | How long to wait (in seconds) for VMI to become running before attempting recovery | No | 60 | 30, 120, 300 |
| disable_auto_restart | When set to true, patches spec.running=False on the VM so it does not auto-restart after deletion. | No | false | true, false |
| kill_count | How many VMI's to kill serially | No | 1 | 3 |
| wait_for_guest_ping | After VMI is Running, wait until the guest answers ICMP ping (default) and record `guest_reachable_time` | No | false | true, false |
| guest_ping_timeout | Seconds to wait for first guest ping success after VMI Running | No | 300 | 120, 300 |
| guest_ping_interval | Seconds between guest ping probes | No | 2 | 1, 2, 5 |
| guest_ping_method | Reachability probe: `icmp` (default; needs `NET_RAW`) or `tcp` | No | icmp | icmp, tcp |
| guest_ping_port | TCP port when `guest_ping_method=tcp` (ignored for icmp) | No | 22 | 22, 3389 |
| guest_ping_namespace | Namespace for the helper probe pod; empty defaults to the VMI namespace | No | scenario namespace | "default" |
| guest_ping_pod | Leave empty for icmp (ephemeral helper with `NET_RAW`). For tcp, optionally reuse `CI/templates/guest-ping-diagnosis-pod.yaml` | No | empty | krkn-guest-ping-diagnosis |
| guest_ping_image | Helper image for the ephemeral probe pod (must include ping/nc). Override for disconnected / mirrored registries | No | quay.io/krkn-chaos/krkn-hub-multiarch:workload-krkn-tools | registry.local/krkn-tools:latest |
| guest_ping_settle_seconds | Seconds to sleep after the helper probe pod is Ready, before deleting the VMI | No | 5 | 0, 5 |

\* Either `vm_name` or `label_selector` is required.

## Execution Flow

When executed, the scenario follows this process:

1. **Initialization**: Validates KubeVirt is installed and configures the KubeVirt client
2. **VMI Validation**: Checks if the target VMI exists and is in Running state
3. **State Preservation**: Saves the initial state of the VMI
4. **Probe prep (optional)**: If `wait_for_guest_ping` is true, creates or reuses an in-cluster helper pod and settles before chaos (create/pull stay off the MTTR path)
5. **Chaos Injection**: Deletes the VMI using the KubeVirt API
6. **Wait for Running**: Waits for VMI to become running again, up to the timeout specified
7. **Guest reachability (optional)**: Polls ICMP (default) or TCP until the guest answers; sets `guest_reachable_time`
8. **Recovery Monitoring**: Checks if the VMI is automatically restored
9. **Manual Recovery**: If automatic recovery doesn't occur, manually recreates the VMI
10. **Validation**: Confirms the VMI is running correctly


## Sample Configuration

Here's an example configuration for using the `vmi_outage` scenario:

```yaml
scenarios:
  - name: "vmi outage test"
    scenario: vmi_outage
    parameters:
      vm_name: my-vm
      namespace: kubevirt
      timeout: 60
      disable_auto_restart: false
      kill_count: 3
      # Optional guest MTTR (off by default). ICMP needs NET_RAW (not
      # OpenShift restricted-v2). For restricted SCC use method: tcp.
      # wait_for_guest_ping: true
      # guest_ping_method: icmp
      # guest_ping_timeout: 300
```

For multiple VMs in different namespaces:

```yaml
scenarios:
  - name: "kubevirt outage test - app VM"
    scenario: vmi_outage
    parameters:
      vm_name: app-vm
      namespace: application
      timeout: 120
      disable_auto_restart: false
      kill_count: 1
  
  - name: "kubevirt outage test - database VM"
    scenario: vmi_outage
    parameters:
      vm_name: db-vm
      namespace: database
      timeout: 180
      disable_auto_restart: false
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
        -  vmi_outage:
               - scenarios/kubevirt/vmi-outage.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - vmi_outage:
            - scenarios/kubevirt/vmi-outage-1.yaml
            - scenarios/kubevirt/vmi-outage-2.yaml
            - scenarios/kubevirt/vmi-outage-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - vmi_outage:
            - scenarios/kubevirt/vmi-outage.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - vmi_outage:  # Same type can appear multiple times
            - scenarios/kubevirt/vmi-outage-2.yaml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
