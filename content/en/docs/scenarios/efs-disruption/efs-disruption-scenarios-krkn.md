---
title: EFS Disruption Scenarios using Krkn
description: 
date: 2017-01-04
weight: 1
---
This scenario creates an outgoing firewall rule on specific nodes in your cluster, chosen by node name or a selector. This rule blocks connections to AWS EFS, leading to a temporary failure of any EFS volumes mounted on those affected nodes.


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

### Run 

```bash
python run_kraken.py --config config/config.yaml
```
