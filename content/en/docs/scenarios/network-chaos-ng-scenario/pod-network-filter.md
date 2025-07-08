---
title: Pod Network Filter
description: >
date: 2017-01-05
---

## Overview

Creates iptables rules on one or more pods to block incoming and outgoing traffic on a port in the pod network interface. Can be used to block network based services connected to the pod or to block inter-pod communication.

## Configuration 

```yaml
- id: pod_network_filter
  wait_duration: 300
  test_duration: 100
  label_selector: "app=label"
  instance_count: 1
  execution: parallel
  namespace: 'default'
  # scenario specific settings
  ingress: false
  egress: true
  target: 'pod-name'
  interfaces: []
  protocols:
    - tcp
  ports:
    - 80
```

for the common module settings please refer to the [documentation](docs/scenarios/network-chaos-ng-scenario/network-chaos-ng-scenario-api/#basenetworkchaosconfig-base-module-configuration).

- `ingress`: filters the incoming traffic on one or more ports. If set one or more network interfaces must be specified
- `egress` : filters the outgoing traffic on one or more ports.
- `target`: the pod name (if label_selector not set)
- `interfaces`: a list of network interfaces where the incoming traffic will be filtered
- `ports`: the list of ports that will be filtered
- `protocols`: the ip protocols to filter (tcp and udp)


## Examples
### DNS disruption

```yaml
- id: pod_network_filter
  wait_duration: 300
  test_duration: 100
  label_selector: ""
  instance_count: 0
  execution: parallel
  namespace: 'default'
  # scenario specific settings
  ingress: false
  egress: true
  target: "pod-name"
  interfaces: []
  protocols:
    - tcp
    - udp
  ports:
    - 53
```

This configuration will prevent the pod to solve any hostname (internal services and external hostnames) contacting the Kubernetes DNS.
