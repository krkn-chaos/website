---
title: Pod Network Ingress Network Shaping using krknctl
description: 
date: 2017-01-04
weight: 3
---

```bash
krknctl run pod-ingress-shaping (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
| ~-~-image |The scenario workload container image | quay.io/krkn-chaos/krkn:tools | 
| ~-~-total-chaos-duration | Duration of the test run  | number |  60 |
| ~-~-pod-selector | When pod_name is not specified, pod matching the label will be selected for the chaos scenario  | string | "" |
| ~-~-execution |Sets the execution mode of the scenario on multiple pods, can be parallel or serial | parallel | 
| ~-~-namespace | Namespace of the pod to which filter need to be applied  | string | default |
| ~-~-instance-count | Targeted instance count matching the label selector  | number |  1 |
| ~-~-pod-name | When label_selector is not specified, pod matching the name will be selected for the chaos scenario  | string | "" |
| ~-~-service-account | The service account that the workload will run with. This is especially useful for privileged workloads, as it can be configured to bypass cluster security restrictions.| "" |
| ~-~-taints | A list of comma sepaerated taints that the node might have that will be transformed on workload tolerations | "" |
| ~-~-latency | Injects IP packet latency on the pod interface,  value is a string eg. 50ms| "" |
| ~-~-loss | Injects a percentage of IP packet loss on the pod interface, value is a string eg. 90% | "" |
| ~-~-bandwidth | Injects a bandwidth restriction on the pod interface, value is a string eg. 1mbps | "" |
| ~-~-network-shaping-execution | sets the execution mode for the three network disruptions available can be serial or parallel | parallel |


To see all available scenario options 
```bash
krknctl run pod-network-chaos --help 
```