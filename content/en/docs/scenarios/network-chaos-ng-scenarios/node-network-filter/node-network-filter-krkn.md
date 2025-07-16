---
title: Node Network Filter using Krkn
description: >
weight : 3
date: 2017-01-05
---

## Overview

Creates iptables rules on one or more nodes to block incoming and outgoing traffic on a port in the node network interface. Can be used to block network based services connected to the node or to block inter-node communication.

## Configuration 

```yaml
- id: node_network_filter
  wait_duration: 300
  test_duration: 100
  label_selector: "kubernetes.io/hostname=ip-10-0-39-182.us-east-2.compute.internal"
  instance_count: 1
  execution: parallel
  namespace: 'default'
  # scenario specific settings
  ingress: false
  egress: true
  target: node-name
  interfaces: []
  protocols:
   - tcp
  ports:
    - 2049
```

for the common module settings please refer to the [documentation](docs/scenarios/network-chaos-ng-scenarios/network-chaos-ng-scenarios-api/#basenetworkchaosconfig-base-module-configuration).

- `ingress`: filters the incoming traffic on one or more ports. If set one or more network interfaces must be specified
- `egress` : filters the outgoing traffic on one or more ports.
- `target`: the node name (if label_selector not set)
- `interfaces`: a list of network interfaces where the incoming traffic will be filtered
- `ports`: the list of ports that will be filtered
- `protocols`: the ip protocols to filter (tcp and udp)


## Examples

Please refer to the [use cases section](use-cases.md) for some real usage scenarios.

