
Example scenario file: [node-network-filter.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/kubernetes/node-network-filter.yml)

### Configuration

```yaml
- id: node_network_filter
  wait_duration: 300
  test_duration: 100
  label_selector: "kubernetes.io/hostname=ip-10-0-39-182.us-east-2.compute.internal"
  instance_count: 1
  execution: parallel
  namespace: 'default'
  # scenario specific settings
  ingress: false
  egress: true
  target: node-name
  interfaces: []
  protocols:
   - tcp
  ports:
    - 2049
  taints: []
  service_account: ""
```

for the common module settings please refer to the [documentation](/docs/scenarios/network-chaos-ng-scenarios/network-chaos-ng-scenario-api/#basenetworkchaosconfig-base-module-configuration).

- `ingress`: filters incoming traffic on one or more ports
- `egress`: filters outgoing traffic on one or more ports
- `target`: the node name (if `label_selector` is not set)
- `interfaces`: network interfaces used for **outgoing** traffic when `egress` is enabled (same semantics as krknctl and krkn-hub)
- `ports`: ports that incoming and/or outgoing filtering applies to (depending on `ingress` / `egress`)
- `protocols`: the IP protocols to filter (`tcp` and `udp`)
- `taints`: list of taints for which tolerations are created. Example: `["node-role.kubernetes.io/master:NoSchedule"]`
- `service_account`: optional service account for the scenario workload (empty string uses the default)

### Usage

To enable hog scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the `hog.yaml` file.
```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/node-network-filter.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/node-network-filter-1.yml
            - scenarios/kube/node-network-filter-2.yml
            - scenarios/kube/node-network-filter-3.yml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/kube/node-network-filter.yml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - network_chaos_ng_scenarios:  # Same type can appear multiple times
            - scenarios/kube/node-network-filter-2.yml
```
{{% /alert %}}


### Examples

Please refer to the [use cases section](docs/getting-started/use-cases.md) for some real usage scenarios.
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
