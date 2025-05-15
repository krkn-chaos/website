---
title: Syn Flood Scenario using Krknctl
description: 
date: 2017-01-04
weight: 2
---

```bash
krknctl run syn-flood (optional: --<parameter>:<value> ) | 
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md) 


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
~-~-packet-size | The size in bytes of the SYN packet |number | 120 |
~-~-window-size | The TCP window size between packets in bytes | number | 64 | 
~-~-chaos-duration | The number of seconds the chaos will last | number | 120 | 
~-~-namespace | The namespace containing the target service and where the attacker pods will be deployed | string | default | 
~-~-target-service | The service name (or the hostname/IP address in case an external target will be hit) that will be affected by the attack.Must be empty if TARGET_SERVICE_LABEL will be set  | string |
~-~-target-port | The TCP port that will be targeted by the attack  | number |
~-~-target-service-label | The label that will be used to select one or more services.Must be left empty if TARGET_SERVICE variable is set  | string |
~-~-number-of-pods | The number of attacker pods that will be deployed | number | 2 | 
~-~-image | The container image that will be used to perform the scenario | string | quay.io/krkn-chaos/krkn-syn-flood:latest | 
~-~-node-selectors | The node selectors are used to guide the cluster on where to deploy attacker pods. You can specify one or more labels in the format key=value;key=value2 (even using the same key) to choose one or more node categories. If left empty, the pods will be scheduled on any available node, depending on the cluster s capacity.  | string |



To see all available scenario options 
```bash
krknctl run syn-flood --help 
```