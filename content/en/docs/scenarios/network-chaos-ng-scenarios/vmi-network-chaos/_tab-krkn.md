### Configuration

```yaml
- id: vmi_network_chaos
  image: "quay.io/krkn-chaos/krkn-network-chaos:latest"
  wait_duration: 300
  test_duration: 120
  label_selector: ""
  service_account: ""
  taints: []
  namespace: "default"
  instance_count: 1
  execution: serial
  # scenario specific settings
  target: ".*"        # regex matching VMI names in the specified namespace
  interfaces: []      # leave empty to auto-detect the tap interface
  ingress: true
  egress: true
  latency: "100ms"    # empty string to skip; or e.g. 100ms (units: us, ms, s)
  loss: 10            # percentage (no % symbol)
  bandwidth: "100mbit" # supported units: bit, kbit, mbit, gbit, tbit
```

For the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `namespace`: **required** — the Kubernetes namespace where the target VMIs are running. Unlike other network chaos modules, this field cannot be empty.
- `target`: regex pattern matching VMI names within the specified namespace. Defaults to `.*` (all VMIs in the namespace).
- `latency`: network latency to inject. Format: integer followed by `us` (microseconds), `ms` (milliseconds), or `s` (seconds). Example: `100ms`. Set to empty string to skip.
- `loss`: packet loss percentage as a plain integer (no `%` symbol). Example: `10` means 10% packet loss. Set to empty string to skip.
- `bandwidth`: bandwidth limit. Format: integer followed by `bit`, `kbit`, `mbit`, `gbit`, or `tbit`. Example: `100mbit`. Set to empty string to skip.
- `interfaces`: list of tap interface names to target inside the virt-launcher network namespace. Leave empty to auto-detect the VMI's tap interface.
- `ingress`: apply rules to incoming traffic (default: `true`)
- `egress`: apply rules to outgoing traffic (default: `true`)
- `execution`: `serial` (default for VMI scenarios) or `parallel`. Use `serial` when targeting multiple VMIs to avoid resource contention on shared nodes.

### Usage

To enable VMI network chaos scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the scenario yaml file.

```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network_chaos.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network_chaos-1.yaml
            - scenarios/openshift/virt_network_chaos-2.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network_chaos.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
```
{{% /alert %}}

{{% alert title="Warning" color="warning" %}}
The VMI must be in `Running` phase and its `virt-launcher` pod must have an active `compute` container before the scenario runs. The scenario will abort if the VMI is not schedulable or if the compute container is not ready.
{{% /alert %}}

### Run

```bash
python run_kraken.py --config config/config.yaml
```
