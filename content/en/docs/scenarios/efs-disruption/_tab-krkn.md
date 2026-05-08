This scenario creates an outgoing firewall rule on specific nodes in your cluster, chosen by node name or a selector. This rule blocks connections to AWS EFS, leading to a temporary failure of any EFS volumes mounted on those affected nodes.

Example scenario file: [efs_disruption.yml](https://github.com/krkn-chaos/scenarios-hub)

##### Sample scenario config
```yaml
- id: node_network_filter
  wait_duration: 0
  test_duration: 60
  label_selector: ''
  service_account: ''
  namespace: 'default'
  instance_count: 1
  execution: parallel
  ingress: false
  egress: true
  target: '<NODE_NAME>'
  interfaces: []
  ports: [2049]
  taints: []
  protocols:
    - tcp
    - udp
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
            - scenarios/efs-disruption-1.yaml
            - scenarios/efs-disruption-2.yaml
            - scenarios/efs-disruption-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/efs-disruption.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - network_chaos_ng_scenarios:  # Same type can appear multiple times
            - scenarios/efs-disruption-2.yaml
```
{{% /alert %}}

### Run 

```bash
python run_kraken.py --config config/config.yaml
```
