

Example scenario file: [pod-network-filter.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/kubernetes/pod-network-filter.yml)

### Configuration

```yaml
- id: pod_network_filter
  wait_duration: 300
  test_duration: 100
  label_selector: "app=label"
  instance_count: 1
  execution: parallel
  namespace: 'default'
  # scenario specific settings
  ingress: false
  egress: true
  target: 'pod-name'
  interfaces: []
  protocols:
    - tcp
  ports:
    - 80
  taints: []
```

for the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `ingress`: filters the incoming traffic on one or more ports. If set one or more network interfaces must be specified
- `egress` : filters the outgoing traffic on one or more ports.
- `target`: the pod name (if label_selector not set)
- `interfaces`: a list of network interfaces where the incoming traffic will be filtered
- `ports`: the list of ports that will be filtered
- `protocols`: the ip protocols to filter (tcp and udp)
- `taints` : List of taints for which tolerations need to be created. Example: ["node-role.kubernetes.io/master:NoSchedule"]

### Usage

To enable hog scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the `hog.yaml` file.
```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/pod-network-filter.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/pod-network-filter-1.yml
            - scenarios/kube/pod-network-filter-2.yml
            - scenarios/kube/pod-network-filter-3.yml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/pod-network-filter.yml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - network_chaos_ng_scenarios:  # Same type can appear multiple times
            - scenarios/kube/pod-network-filter-2.yml
```
{{% /alert %}}

### Examples

Please refer to the [use cases section](docs/getting-started/use-cases.md) for some real usage scenarios.
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
