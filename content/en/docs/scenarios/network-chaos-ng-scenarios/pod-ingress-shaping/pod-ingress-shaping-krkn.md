---
title: Pod Network Ingress Network Shaping using Krkn 
description: 
date: 2025-08-18
weight: 1
---
##### Sample scenario config for ingress traffic shaping
```yaml
- id: pod_ingress_shaping
  image: docker.io/fedora/tools       # scenario workload image
  wait_duration: <time_duration>      # Default is 300. Ensure that it is at least about twice of test_duration
  test_duration: <time_duration>      # Default is 120
  label_selector: <label_selector>    # When pod_name is not specified, pod with matching label_selector is selected for chaos scenario
  execution: <serial/parallel>        # used to specify wheter you want to apply filters on multiple targets
  namespace: <namespace>              # Required - Namespace of the pod to which traffic shaping need to be applied
  instance_count: <number>            # Number of pods to perform action/select that match the label selector
  target: <pod name>                # When label_selector is not specified, pod matching the name will be selected for the chaos scenario
  service_account: ""
  taints: [ ] # example ["node-role.kubernetes.io/master:NoSchedule"]

  # latency, loss and bandwidth are the three supported network parameters to alter for the chaos test
  latency: <time>                 # Value is a string. For example : 50ms
  loss: <fraction>                # Loss is a fraction between 0 and 1. It has to be enclosed in quotes to treat it as a string. For example, '0.02%' (not 0.02%)
  bandwidth: <rate>               # Value is a string. For example: 100mbit
  network_shaping_execution: <serial/parallel> # Used to specify whether you want to apply filters on interfaces one at a time or all at once. Default is 'parallel'
```

Note: For ingress traffic shaping, ensure that your node doesn't have any [IFB](https://wiki.linuxfoundation.org/networking/ifb) interfaces already present. The scenario relies on creating IFBs to do the shaping, and they are deleted at the end of the scenario.


##### Steps
 - Pick the pods to introduce the network anomaly either from label_selector or target.
 - Identify the pod interface name on the node.
 - Set traffic shaping config on pod's interface using tc and netem.
 - Wait for the duration time.
 - Remove traffic shaping config on pod's interface.
 - Remove the job that spawned the pod.

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