

### Configuration

```yaml
- id: node_network_chaos
  wait_duration: 300
  test_duration: 60
  label_selector: "node-role.kubernetes.io/worker="
  instance_count: 1
  execution: serial
  namespace: 'default'
  # scenario specific settings
  target: ''
  interfaces: []
  ingress: false
  egress: true
  latency: 200ms
  loss: 2
  bandwidth: 100mbit
  force: false
```

For the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `target`: the node name to target (used when `label_selector` is not set)
- `interfaces`: a list of network interfaces to apply chaos to. Leave empty to auto-detect the node's default interface
- `ingress`: apply chaos to incoming traffic
- `egress`: apply chaos to outgoing traffic
- `latency`: network delay to inject (e.g. `100us`, `200ms`, `1s`)
- `loss`: packet loss percentage as a whole number without `%` (e.g. `2` means 2% loss)
- `bandwidth`: bandwidth restriction (e.g. `100mbit`, `1gbit`)
- `force`: override existing tc rules on the interface. When `true`, a 10-second warning delay is added before proceeding

#### Validation Rules

| Field | Format | Valid Examples | Invalid Examples |
|-------|--------|----------------|------------------|
| `latency` | `<number>(us\|ms\|s)` | `100us`, `200ms`, `1s` | `200`, `1sec` |
| `bandwidth` | `<number>(bit\|kbit\|mbit\|gbit\|tbit)` | `100mbit`, `1gbit` | `100mbps` |
| `loss` | digits only (no `%`) | `2`, `50` | `2%`, `0.5` |

### Usage

To enable node network chaos scenarios, edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the scenario yaml file.

```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/node-network-chaos.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/node-network-chaos-1.yml
            - scenarios/kube/node-network-chaos-2.yml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/node-network-chaos.yml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
```
{{% /alert %}}

### Run 

```bash
python run_kraken.py --config config/config.yaml
```
