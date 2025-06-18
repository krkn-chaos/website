---
title: Pod Scenarios
description: 
date: 2017-01-04
---

Krkn recently replaced PowerfulSeal with its own internal pod scenarios using a plugin system. This scenario disrupts the pods matching the label in the specified namespace on a Kubernetes/OpenShift cluster.

## Why pod scenarios are important: 

Modern applications demand high availability, low downtime, and resilient infrastructure. Kubernetes provides building blocks like Deployments, ReplicaSets, and Services to support fault tolerance, but understanding how these interact during disruptions is critical for ensuring reliability. Pod disruption scenarios test this reliability under various conditions, validating that the application and infrastructure respond as expected.

**Krkn Telemetry:** Krkn collects metrics during chaos experiments, such as recovery timing. These indicators help assess how resilient the application is under test conditions.

## Use cases and importance of pod scenarios

1. Deleting a single pod
- **Use Case:** Simulates unplanned deletion of a single pod
- **Why It's Important:** Validates whether the ReplicaSet or Deployment automatically creates a replacement.
- **Customer Impact:** Ensures continuous service even if a pod unexpectedly crashes.
- **Recovery Timing:** Typically less than 10 seconds for stateless apps (seen in Krkn telemetry output).
- **HA Indicator:** Pod is automatically rescheduled and becomes Ready without manual intervention.
 ```bash
Kubectl delete pod <pod-name> 
Kubectl get pods # watch for new pods
```

2. Deleting multiple pods simultaneously
- **Use Case:** Simulates a larger failure event, such as a node crash or AZ outage.
- **Why It's Important:** Tests whether the system has enough resources and policies to recover gracefully.
- **Customer Impact:** If all pods of a service fail, user experience is directly impacted.
- **HA Indicator:** Application can continue functioning from other replicas across zones/nodes.

3. Pod Eviction (Soft Disruption)
- **Use Case:** Triggered by Kubernetes itself during node upgrades or scaling down.
- **Why It's Important:** Ensures graceful termination and restart elsewhere without user impact.
- **Customer Impact:** Should be zero if readiness/liveness probes and PDBs are correctly configured.
- **HA Indicator:** Rolling disruption does not take down the whole application.

## How to know if it is highly available 
- ***Multiple Replicas Exist:*** Confirmed by checking `kubectl get deploy` and seeing atleast 1 replica.
- ***Pods Distributed Across Nodes/availability zones:*** Using `topologySpreadConstraints` or observing pod distribution in `kubectl get pods -o wide`.
- ***Service Uptime Remains Unaffected:*** During chaos test, verify app availability (synthetic probes, Prometheus alerts, etc).
- ***Recovery Is Automatic:*** No manual intervention needed to restore service.
- ***Krkn Telemetry Indicators:*** End of run data includes recovery times, pod reschedule latency, and service downtime which are vital metrics for assessing HA.