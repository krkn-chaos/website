---
title: DNS Outage Scenario using Krknctl
description: 
date: 2017-01-04
weight: 3
---


```bash
krknctl run pod-network-filter \
 --chaos-duration 60 \
 --pod-name target-pod \
 --ingress false \
 --egress true \
 --protocols tcp,udp \
 --ports 53```