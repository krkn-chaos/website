---
title: Kubevirt Outage Scenarios using Krknctl
description: 
date: 2017-01-04
weight: 2
---

```bash
krknctl run kubevirt-outage (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:  (be sure to scroll to right)
| Parameter      | Description    | Type      |  Default | Possible Values | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | :----------------:  | 
~-~-namespace | VMI Namespace to target | string | node-role.kubernetes.io/worker | 
~-~-vmi-name | VMI name to inject faults in case of targeting a specific node | string | 
~-~-timeout | Duration to wait for completion of node scenario injection | number | 180| 


To see all available scenario options 
```bash
krknctl run kubevirt-outage --help 
```