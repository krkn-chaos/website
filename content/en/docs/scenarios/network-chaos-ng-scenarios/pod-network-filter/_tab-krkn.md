

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
- `taints` : List of taints for which tolerations need to created. Example: ["node-role.kubernetes.io/master:NoSchedule"]

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

### Examples

Please refer to the [use cases section](docs/getting-started/use-cases.md) for some real usage scenarios.
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
