---
title: Pod Scenarios
description: 
date: 2017-01-04
weight: 3
---

This scenario disrupts the pods matching the label, excluded label or pod name in the specified namespace on a Kubernetes/OpenShift cluster.

## Why pod scenarios are important: 

Modern applications demand high availability, low downtime, and resilient infrastructure. Kubernetes provides building blocks like Deployments, ReplicaSets, and Services to support fault tolerance, but understanding how these interact during disruptions is critical for ensuring reliability. Pod disruption scenarios test this reliability under various conditions, validating that the application and infrastructure respond as expected.

## Use cases of pod scenarios
<krkn-hub-scenario id="pod-scenarios">
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

</krkn-hub-scenario>

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


## Recovery Time Metrics in Krkn Telemetry

Krkn tracks three key recovery time metrics for each affected pod:

1. **pod_rescheduling_time** - The time (in seconds) that the Kubernetes cluster took to reschedule the pod after it was killed. This measures the cluster's scheduling efficiency and includes the time from pod deletion until the replacement pod is scheduled on a node.

2. **pod_readiness_time** - The time (in seconds) the pod took to become ready after being scheduled. This measures application startup time, including container image pulls, initialization, and readiness probe success.

3. **total_recovery_time** - The total amount of time (in seconds) from pod deletion until the replacement pod became fully ready and available to serve traffic. This is the sum of rescheduling time and readiness time.

These metrics appear in the telemetry output under `PodsStatus.recovered` for successfully recovered pods. Pods that fail to recover within the timeout period appear under `PodsStatus.unrecovered` without timing data.

**Example telemetry output:**
```json
{
  "recovered": [
    {
      "pod_name": "backend-7d8f9c-xyz",
      "namespace": "production",
      "pod_rescheduling_time": 2.3,
      "pod_readiness_time": 5.7,
      "total_recovery_time": 8.0
    }
  ],
  "unrecovered": []
}
```

See [Krkn config examples](./pod-scenarios-krkn.md) and [Krknctl parameters](./pod-scenarios-krknctl.md) for full details.