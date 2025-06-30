---
title: Node Network Filter
description: >
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
  target: node
  interfaces: []
  ports:
    - 2049
```

for the common module settings please refer to the [documentation](docs/scenarios/network-chaos-ng-scenario/network-chaos-ng-scenario-api/#basenetworkchaosconfig-base-module-configuration).

- `ingress`: filters the incoming traffic on one or more ports. If set one or more network interfaces must be specified
- `egress` : filters the outgoing traffic on one or more ports.
- `target`: sets the type of resource to be targeted, values can be `node` or `pod`
- `interfaces`: a list of network interfaces where the incoming traffic will be filtered
- `ports`: the list of ports that will be filtered


## Examples
### AWS EFS (Elastic File System) disruption

```yaml
- id: node_network_filter
  wait_duration: 300
  test_duration: 100
  label_selector: "node-role.kubernetes.io/worker="
  instance_count: 0
  execution: parallel
  namespace: 'default'
  # scenario specific settings
  ingress: false
  egress: true
  target: ''
  interfaces: []
  ports:
    - 2049
```

This configuration will disrupt all the PVCs provided by the AWS EFS service to an OCP/K8S cluster. The service is essentially an elastic NFS service so blocking the outgoing traffic on the port `2049` in the worker nodes will cause all the pods mounting the PVC to be unable to read and write in the mounted folder.


## Etcd Split Brain

```yaml
- id: node_network_filter
  wait_duration: 300
  test_duration: 100
  label_selector: "node-role.kubernetes.io/master="
  instance_count: 1
  execution: parallel
  namespace: 'default'
  # scenario specific settings
  ingress: false
  egress: true
  target: ''
  interfaces: []
  ports:
    - 2379
    - 2380
```

This configuration will cause the disruption of the etcd traffic in one of the master nodes, this configuration will cause one of the three master node  to be isolated by the other nodes causing the election of two etcd leader nodes, one is the isolated node, the other will be elected between one of the two remaining nodes.
