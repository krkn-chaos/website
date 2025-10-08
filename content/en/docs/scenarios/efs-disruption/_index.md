---
title: EFS Disruption Scenarios
description: 
date: 2017-01-04
weight: 3
---
This scenario creates an outgoing firewall rule on specific nodes in your cluster, chosen by node name or a selector. This rule blocks connections to AWS EFS, leading to a temporary failure of any EFS volumes mounted on those affected nodes.