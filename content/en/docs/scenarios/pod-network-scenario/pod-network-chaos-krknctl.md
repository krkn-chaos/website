---
title: Pod Network Chaos Scenarios using Krknctl
description: 
date: 2017-01-04
weight: 3
---

```bash
krknctl run pod-network-chaos (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
~-~-namespace | Namespace of the pod to which filter need to be applied  | string |
~-~-image | Image used to disrupt network on a pod  | string |  quay.io/krkn-chaos/krkn:tools | 
~-~-label-selector | When pod_name is not specified, pod matching the label will be selected for the chaos scenario  | string |
~-~-exclude-label | Pods matching this label will be excluded from the chaos even if they match other criteria | "" |
~-~-pod-name | When label_selector is not specified, pod matching the name will be selected for the chaos scenario  | string | 
~-~-instance-count | Targeted instance count matching the label selector  | number |  1 |
~-~-traffic-type | List of directions to apply filters - egress/ingress ( needs to be a list )  | string | "[ingress,egress]" | 
~-~-ingress-ports | Ingress ports to block ( needs to be a list )  | string |   | 
~-~-egress-ports | Egress ports to block ( needs to be a list )  | string |   | 
~-~-wait-duration | Ensure that it is at least about twice of test_duration  | number |  300 | 
~-~-test-duration | Duration of the test run  | number |  120 | 

To see all available scenario options 
```bash
krknctl run pod-network-chaos --help 
```