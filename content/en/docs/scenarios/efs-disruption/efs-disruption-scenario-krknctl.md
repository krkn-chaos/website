---
title: EFS Disruption Scenario using Krknctl
description: 
date: 2017-01-04
weight: 3
---

```bash
krknctl run node-network-filter \
 --chaos-duration 60 \
 --node-name kind-control-plane \
 --ingress false \
 --egress true \
 --protocols tcp,udp \
 --ports 2049
```