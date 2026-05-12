### Configuration

```yaml
- id: node_network_chaos
  image: "quay.io/krkn-chaos/krkn-network-chaos:latest"
  wait_duration: 1
  test_duration: 60
  label_selector: ""
  service_account: ""
  instance_count: 1
  execution: parallel
  namespace: default
  # scenario specific settings
  target: "<node_name>"
  interfaces: []
  ingress: true
  egress: true
  latency: 0s        # supported units: us (microseconds), ms, s
  loss: 10           # percentage (no % symbol)
  bandwidth: 1gbit   # supported units: bit, kbit, mbit, gbit, tbit
  force: false
  taints: []
```

For the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `latency`: network latency to inject. Format: integer followed by `us` (microseconds), `ms` (milliseconds), or `s` (seconds). Example: `100ms`. Set to empty string to skip.
- `loss`: packet loss percentage as a plain integer (no `%` symbol). Example: `10` means 10% packet loss. Set to empty string to skip.
- `bandwidth`: bandwidth limit. Format: integer followed by `bit`, `kbit`, `mbit`, `gbit`, or `tbit`. Example: `100mbit`. Set to empty string to skip.
- `interfaces`: list of network interface names to target. Leave empty to auto-detect the node's default interface.
- `ingress`: apply rules to incoming traffic (default: `true`)
- `egress`: apply rules to outgoing traffic (default: `true`)
- `target`: the node name to target (used when `label_selector` is not set)
- `force`: by default (`false`), if the target node already has `tc` rules configured, the scenario aborts with a warning to avoid damaging cluster networking. Set to `true` to override existing rules. A 10-second warning delay is inserted before proceeding. Use with caution.

### Usage

To enable node network chaos scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
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

{{% alert title="Warning" color="warning" %}}
When `force` is set to `false` (default), the scenario will check if the target node already has complex `tc` queueing disciplines configured. If existing rules are detected, the scenario aborts to prevent damaging cluster networking. Only set `force: true` if you understand the implications of overriding existing traffic control rules.
{{% /alert %}}

### Run

```bash
python run_kraken.py --config config/config.yaml
```
