### Configuration

```yaml
- id: pod_network_chaos
  image: "quay.io/krkn-chaos/krkn-network-chaos:latest"
  wait_duration: 1
  test_duration: 60
  label_selector: ""
  service_account: ""
  instance_count: 1
  execution: parallel
  namespace: default
  # scenario specific settings
  target: "<pod_name>"
  interfaces: []
  ingress: true
  egress: true
  latency: ""         # empty string to skip; or e.g. 100ms (units: us, ms, s)
  loss: 10           # percentage (no % symbol)
  bandwidth: 1gbit   # supported units: bit, kbit, mbit, gbit, tbit
  taints: []
```

For the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `latency`: network latency to inject. Format: integer followed by `us` (microseconds), `ms` (milliseconds), or `s` (seconds). Example: `100ms`. Set to empty string to skip.
- `loss`: packet loss percentage as a plain integer (no `%` symbol). Example: `10` means 10% packet loss. Set to empty string to skip.
- `bandwidth`: bandwidth limit. Format: integer followed by `bit`, `kbit`, `mbit`, `gbit`, or `tbit`. Example: `100mbit`. Set to empty string to skip.
- `interfaces`: list of network interface names to target. Leave empty to auto-detect the pod's default interface.
- `ingress`: apply rules to incoming traffic (default: `true`)
- `egress`: apply rules to outgoing traffic (default: `true`)
- `target`: the pod name to target (used when `label_selector` is not set)

### Usage

To enable pod network chaos scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the scenario yaml file.

```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/pod-network-chaos.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/pod-network-chaos-1.yml
            - scenarios/kube/pod-network-chaos-2.yml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/pod-network-chaos.yml
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
