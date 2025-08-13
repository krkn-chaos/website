---
title: Network Chaos Scenarios using Krknctl
description: 
date: 2017-01-04
weight: 3
---

```bash
krknctl run network-chaos (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ |
~-~-traffic-type | Selects the network chaos scenario type can be ingress or egress | enum |   ingress|egress
~-~-image | Image used to disrupt network on a pod  | string |  quay.io/krkn-chaos/krkn:tools | 
~-~-duration| Duration in seconds - during with network chaos will be applied. | number| 300 | 
~-~-label-selector| When NODE_NAME is not specified, a node with matching label_selector is selected for running. | string| node-role.kubernetes.io/master |
~-~-execution parallel|serial: Execute each of the egress option as a single scenario(parallel) or as separate scenario(serial). | enum| parallel| ~-~-instance-count| Targeted instance count matching the label selector. | number| 1| 
~-~-node-name| Node name to inject faults in case of targeting a specific node; Can set multiple node names separated by a comma | string | 
~-~-interfaces| List of interface on which to apply the network restriction. eg. | [eth0,eth1,eth2] | string| | | 
~-~-egress| Dictonary of values to set network latency(latency: 50ms), packet loss(loss: 0.02), bandwidth restriction(bandwidth: 100mbit) eg. {bandwidth: 100mbit} | string| "{bandwidth: 100mbit}" | 
~-~-target-node-interface| Dictionary with key as node name(s) and value as a list of its interfaces to test. For example: {ip-10-0-216-2.us-west-2.compute.internal: ens5]} | string | 
~-~-network-params| latency, loss and bandwidth are the three supported network parameters to alter for the chaos test. For example: {latency: 50ms, loss: 0.02} | string | 
~-~-wait-duration| Ensure that it is at least about twice of test_duration | number| 300| 


To see all available scenario options 
```bash
krknctl run network-chaos --help 
```