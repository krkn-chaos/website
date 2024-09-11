---
title: Zone Outage Scenarios
description: 
date: 2017-01-04
weight: 1
---

Scenario to create outage in a targeted zone in the public cloud to understand the impact on both Kubernetes/OpenShift control plane as well as applications running on the worker nodes in that zone. It tweaks the network acl of the zone to simulate the failure and that in turn will stop both ingress and egress traffic from all the nodes in a particular zone for the specified duration and reverts it back to the previous state.
