Example scenario file: [dns_outage.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/dns_outage.yml)

##### Sample scenario config
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
  target: <pod_name>
  interfaces: []
  ports: [53]
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

### Run 

```bash
python run_kraken.py --config config/config.yaml
```
