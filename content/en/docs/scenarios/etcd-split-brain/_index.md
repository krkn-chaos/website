---
title: ETCD Split Brain Scenarios
description: 
date: 2017-01-04
weight: 3
---

This scenario isolates an etcd node by blocking its network traffic. This action forces an etcd leader re-election. Once the scenario concludes, the cluster should temporarily exhibit a split-brain condition, with two etcd leaders active simultaneously. This is particularly useful for testing the etcd cluster’s resilience under such a challenging state.

{{< notice type="danger" >}} This scenario carries a significant risk: it **might break the cluster API**, making it impossible to automatically revert the applied network rules. The `iptables` rules will be printed to the console, allowing for manual reversal via a shell on the affected node. This scenario is **best suited for disposable clusters** and should be **used at your own risk**. {{< /notice >}}