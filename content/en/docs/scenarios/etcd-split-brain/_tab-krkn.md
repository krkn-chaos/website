

This scenario isolates an etcd node by blocking its network traffic. This action forces an etcd leader re-election. Once the scenario concludes, the cluster should temporarily exhibit a split-brain condition, with two etcd leaders active simultaneously. This is particularly useful for testing the etcd cluster’s resilience under such a challenging state.

Example scenario file: [etcd_split_brain.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/etcd_split_brain.yml)

To run

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
  ports: [2379, 2380]
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

### Run 

```bash
python run_kraken.py --config config/config.yaml
```

{{< notice type="danger" >}} This scenario carries a significant risk: it **might break the cluster API**, making it impossible to automatically revert the applied network rules. The `iptables` rules will be printed to the console, allowing for manual reversal via a shell on the affected node. This scenario is **best suited for disposable clusters** and should be **used at your own risk**. {{< /notice >}}