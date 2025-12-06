---
title: Kubevirt Outage Scenarios using Krknctl
description: Detailed implementation of Kubevirt VM outage with Krknctl
date: 2017-01-04
weight: 4
---

```bash
krknctl run kubevirt-outage (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:  (be sure to scroll to right)
| Parameter      | Description    | Type      |  Default | Possible Values | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | :----------------:  | 
~-~-namespace | VMI Namespace to target | string | node-role.kubernetes.io/worker | 
~-~-vm-name | VM name to inject faults in case of targeting a specific node | string | 
~-~-timeout | Duration to wait for completion of node scenario injection | number | 180| 
~-~-kill-count | Number of VMI's to kill (will perform serially) | number | 1| 

To see all available scenario options 
```bash
krknctl run kubevirt-outage --help 
```