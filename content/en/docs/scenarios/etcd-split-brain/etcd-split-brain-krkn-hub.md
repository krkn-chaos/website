---
title: ETCD Split Brain Scenario using Krkn-Hub
description: >
date: 2017-01-05
weight: 2
---


```bash
podman run -v ~/.kube/config:/home/krkn/.kube/config:z -e TEST_DURATION="60" -e INGRESS="false" -e EGRESS="true" -e PROTOCOLS="tcp" -e PORTS="2379,2380" -e NODE_NAME="kind-control-plane" quay.io/krkn-chaos/krkn-hub:node-network-filter
```