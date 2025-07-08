---
title: Pod Scenarios using Krkn
description: 
date: 2017-01-04
weight: 2
---
##### Sample scenario config (using a plugin)
```yaml
- id: pod_network_outage
  config:
    namespace: openshift-console   # Required - Namespace of the pod to which filter need to be applied
    direction:                     # Optional - List of directions to apply filters
        - ingress                  # Blocks ingress traffic, Default both egress and ingress
    ingress_ports:                 # Optional - List of ports to block traffic on
        - 8443                     # Blocks 8443, Default [], i.e. all ports.
    label_selector: 'component=ui' # Blocks access to openshift console
    exclude_label: 'critical=true' # Optional - Pods matching this label will be excluded from the chaos
```
### Pod Network shaping
Scenario to introduce network latency, packet loss, and bandwidth restriction in the Pod's network interface. The purpose of this scenario is to observe faults caused by random variations in the network.

##### Sample scenario config for egress traffic shaping (using plugin)
```yaml
- id: pod_egress_shaping
  config:
    namespace: openshift-console   # Required - Namespace of the pod to which filter need to be applied.
    label_selector: 'component=ui' # Applies traffic shaping to access openshift console.
    exclude_label: 'critical=true' # Optional - Pods matching this label will be excluded from the chaos
    network_params:
        latency: 500ms             # Add 500ms latency to egress traffic from the pod.
```
##### Sample scenario config for ingress traffic shaping (using plugin)
```yaml
- id: pod_ingress_shaping
  config:
    namespace: openshift-console   # Required - Namespace of the pod to which filter need to be applied.
    label_selector: 'component=ui' # Applies traffic shaping to access openshift console.
    exclude_label: 'critical=true' # Optional - Pods matching this label will be excluded from the chaos
    network_params:
        latency: 500ms             # Add 500ms latency to egress traffic from the pod.
```

##### Steps
 - Pick the pods to introduce the network anomaly either from label_selector or pod_name.
 - Identify the pod interface name on the node.
 - Set traffic shaping config on pod's interface using tc and netem.
 - Wait for the duration time.
 - Remove traffic shaping config on pod's interface.
 - Remove the job that spawned the pod.