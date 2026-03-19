
Example scenario file: [node_interface_down.yaml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kube/node_interface_down.yaml)

### Configuration

```yaml
- id: node_interface_down
  image: quay.io/krkn-chaos/krkn-network-chaos:latest
  wait_duration: 0
  test_duration: 60
  label_selector: "node-role.kubernetes.io/worker="
  instance_count: 1
  execution: serial
  namespace: default
  # scenario specific settings
  target: ""
  interfaces: []
  recovery_time: 30
  taints: []
```

For the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `target`: the node name to target (used when `label_selector` is not set)
- `interfaces`: a list of network interface names to bring down (e.g. `["eth0", "bond0"]`). Leave empty to auto-detect the node's default interface
- `recovery_time`: seconds to wait after bringing the interface(s) back up before continuing. Set to `0` to skip the recovery wait

### Usage

To enable node interface down scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the scenario yaml file.

```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/node_interface_down.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/node_interface_down-1.yaml
            - scenarios/openshift/node_interface_down-2.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/node_interface_down.yaml
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
