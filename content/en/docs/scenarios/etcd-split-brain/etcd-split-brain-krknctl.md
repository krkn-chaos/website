---
title: ETCD Split Brain Scenario using Krknctl
description: 
date: 2017-01-04
weight: 3
---


```bash
krknctl run node-network-filter \
 --chaos-duration 60 \
 --node-name <node_name> \
 --ingress false \
 --egress true \
 --protocols tcp \
 --ports 2379,2380
```