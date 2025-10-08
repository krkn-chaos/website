---
title: Aurora Disruption Scenario using Krknctl
description: 
date: 2017-01-04
weight: 3
---

To run aurora-disruption using krknctl, feel free to adjust the pod-name as needed for the name of the pod on your cluster 

```bash
krknctl run pod-network-filter \
 --chaos-duration 60 \
 --pod-name target-pod \
 --ingress false \
 --egress true \
 --protocols tcp \
 --ports 3306,5432
```