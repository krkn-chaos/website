---
title: DNS Outage Scenarios using Krkn-Hub
description: >
date: 2017-01-05
weight: 2
---


```bash
podman run -v ~/.kube/config:/home/krkn/.kube/config:z -e TEST_DURATION="60" \
    -e INGRESS="false" -e EGRESS="true" -e PROTOCOLS="tcp,udp" -e PORTS="53" \ 
    -e POD_NAME="target-pod" quay.io/krkn-chaos/krkn-hub:pod-network-filter
```