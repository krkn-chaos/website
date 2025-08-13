---
title: Zone Outage Scenarios
description: 
date: 2017-01-04
weight: 3
---

Scenario to create outage in a targeted zone in the public cloud to understand the impact on both Kubernetes/OpenShift control plane as well as applications running on the worker nodes in that zone. 

There are 2 ways these scenarios run: 
For AWS, it tweaks the network acl of the zone to simulate the failure and that in turn will stop both ingress and egress traffic from all the nodes in a particular zone for the specified duration and reverts it back to the previous state.

For GCP, it in a specific zone you want to target and finds the nodes (master, worker, and infra) and stops the nodes for the set duration and then starts them back up. The reason we do it this way is because any edits to the nodes require you to first stop the node before performing any updates. So, editing the network as the AWS way would still require you to stop the nodes first. 