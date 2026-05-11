
This scenario blocks a pod's outgoing MySQL and PostgreSQL traffic, effectively preventing it from connecting to any AWS Aurora SQL engine. It works just as well for standard MySQL and PostgreSQL connections too.

Example scenario file: [aurora_disruption.yml](https://github.com/krkn-chaos/scenarios-hub)

##### Scenario config
```yaml
- id: pod_network_filter
  wait_duration: 0
  test_duration: 60
  label_selector: ''
  service_account: ''
  namespace: 'default'
  instance_count: 1
  execution: parallel
  ingress: false
  egress: true
  target: node
  interfaces: []
  ports: [3306,5432]
  taints: []
  protocols:
    - tcp
  image: quay.io/krkn-chaos/krkn-network-chaos:latest
```

### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/aurora-disruption-1.yaml
            - scenarios/aurora-disruption-2.yaml
            - scenarios/aurora-disruption-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/aurora-disruption.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - container_scenarios:
            - scenarios/container-kill.yaml
        - network_chaos_ng_scenarios:  # Same type can appear multiple times
            - scenarios/aurora-disruption-2.yaml
```
{{% /alert %}}

### Run 

```bash
python run_kraken.py --config config/config.yaml
```
