---
title: Pod Network Scenarios
description: 
date: 2017-01-04
---

### Pod outage
Scenario to block the traffic (Ingress/Egress) of a pod matching the labels for the specified duration of time to understand the behavior of the service/other services which depend on it during downtime. This helps with planning the requirements accordingly, be it improving the timeouts or tweaking the alerts etc.
With the current network policies, it is not possible to explicitly block ports which are enabled by allowed network policy rule. This chaos scenario addresses this issue by using OVS flow rules to block ports related to the pod. It supports OpenShiftSDN and OVNKubernetes based networks.

#### Excluding Pods from Network Outage

The pod outage scenario now supports excluding specific pods from chaos testing using the `exclude_label` parameter. This allows you to target a namespace or group of pods with your chaos testing while deliberately preserving certain critical workloads.

##### Why Use Pod Exclusion?

This feature addresses several common use cases:

- Testing resiliency of an application while keeping critical monitoring pods operational
- Preserving designated "control plane" pods within a microservice architecture
- Allowing targeted chaos without affecting auxiliary services in the same namespace
- Enabling more precise pod selection when network policies require all related services to be in the same namespace

##### How to Use the `exclude_label` Parameter

The `exclude_label` parameter works alongside existing pod selection parameters (`label_selector` and `pod_name`). The system will:
1. Identify all pods in the target namespace
2. Exclude pods matching the `exclude_label` criteria (in format "key=value")
3. Apply the existing filters (`label_selector` or `pod_name`)
4. Apply the chaos scenario to the resulting pod list

##### Example Configurations

**Basic exclude configuration:**
```yaml
- id: pod_network_outage
  config:
    namespace: my-application
    label_selector: "app=my-service"
    exclude_label: "critical=true"
    direction:
      - egress
    test_duration: 600
```

In this example, network disruption is applied to all pods with the label `app=my-service` in the `my-application` namespace, except for those that also have the label `critical=true`.

**Complete scenario example:**
```yaml
- id: pod_network_outage
  config:
    namespace: openshift-console
    direction:
      - ingress
    ingress_ports:
      - 8443
    label_selector: 'component=ui'
    exclude_label: 'excluded=true'
    test_duration: 600
```

This scenario blocks ingress traffic on port 8443 for pods matching `component=ui` label in the `openshift-console` namespace, but will skip any pods labeled with `excluded=true`.

The `exclude_label` parameter is also supported in the pod network shaping scenarios (`pod_egress_shaping` and `pod_ingress_shaping`), allowing for the same selective application of network latency, packet loss, and bandwidth restriction.