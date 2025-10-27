---
title: Pod Scenarios
description: 
date: 2017-01-04
weight: 3
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
kubectl delete pod <pod-name> -n <namespace>
kubectl get pods -n <namespace> -w # watch for new pods
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
- ***Multiple Replicas Exist:*** Confirmed by checking `kubectl get deploy -n <namespace>` and seeing atleast 1 replica.
- ***Pods Distributed Across Nodes/availability zones:*** Using `topologySpreadConstraints` or observing pod distribution in `kubectl get pods -o wide`. See [Health Checks](../../krkn/health-checks.md) for real time visibility into the impact of chaos scenarios on application availability and performance
- ***Service Uptime Remains Unaffected:*** During chaos test, verify app availability (synthetic probes, Prometheus alerts, etc).
- ***Recovery Is Automatic:*** No manual intervention needed to restore service.
- ***Krkn Telemetry Indicators:*** End of run data includes recovery times, pod reschedule latency, and service downtime which are vital metrics for assessing HA.

## Excluding Pods from Disruption

Employ `exclude_label` to designate the safe pods in a group, while the rest of the pods in a namespace are subjected to chaos. Some frequent use cases are:
- Turn off the backend pods but make sure the database replicas that are highly available remain untouched.
- Inject the fault in the application layer, do not stop the infrastructure/monitoring pods.
- Run a rolling disruption experiment with the control-plane or system-critical components that are not affected.

**Format:**

```yaml
exclude_label: "key=value"
```

**Mechanism:**
1. Pods are selected based on `namespace_pattern` + `label_selector` or `name_pattern`.
2. Before deletion, the pods that match `exclude_label` are removed from the list.
3. Rest of the pods are subjected to chaos.

### Example: Have the Leader Protected While Different etcd Replicas Are Killed

```yaml
- id: kill_pods
    config:
        namespace_pattern: ^openshift-etcd$
        label_selector: k8s-app=etcd
        exclude_label: role=etcd-leader
        krkn_pod_recovery_time: 120
        kill: 1
```

### Example: Disrupt Backend, Skip Monitoring

```yaml
- id: kill_pods
    config:
        namespace_pattern: ^production$
        label_selector: app=backend
        exclude_label: component=monitoring
        krkn_pod_recovery_time: 120
        kill: 2
```

See [Krkn config examples](./pod-scenarios-krkn.md) and [Krknctl parameters](./pod-scenarios-krknctl.md) for full details.