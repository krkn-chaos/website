---
type: "docs/scenarios"
title: Scenarios
description: Krkn scenario list
date: 2017-01-04
weight: 4
---

## Supported chaos scenarios
<style>
table th:first-of-type {
    width: 15%;
}
table th:nth-of-type(2) {
    width: 20%;
}
table th:nth-of-type(3) {
    width: 50%;
}

</style>
| **Scenario**   | **Plugin Type**   |  **Description** |
| ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| [Application outages](docs/scenarios/application-outage/_index.md) | application_outages_scenarios | Isolates application Ingress/Egress traffic to observe the impact on dependent applications and recovery/initialization timing  |              
| [Container failures](docs/scenarios/container-scenario/_index.md) | container_scenarios | Injects container failures based on the provided kill signal | 
| [KubeVirt VM Outage](docs/scenarios/kubevirt-vm-outage-scenario/_index.md) | kubevirt_vm_outage | Simulates VM-level disruptions by deleting a Virtual Machine Instance (VMI) to test resilience and recovery mechanisms |
| [Network Chaos](docs/scenarios/network-chaos-scenario/_index.md) | network_chaos_scenarios | Introduces network latency, packet loss, bandwidth restriction in the egress traffic of a Node's interface using tc and Netem |
| [Network Chaos NG](docs/scenarios/network-chaos-ng-scenario/_index.md) | network_chaos_ng_scenarios | Introduces Node network filtering scenario and a new infrastructure to refactor and port the Network Chaos scenarios |
| [Node CPU Hog](docs/scenarios/hog-scenarios/cpu-hog-scenario/_index.md) | hog_scenarios | Hogs CPU on the targeted nodes |
| [Node IO Hog](docs/scenarios/hog-scenarios/io-hog-scenario/_index.md) | hog_scenarios| Hogs io on the targeted nodes              |    
| [Node Memory Hog](docs/scenarios/hog-scenarios/memory-hog-scenario/_index.md) | hog_scenarios | Hogs memory on the targeted nodes   |                       
| [Node Failures](docs/scenarios/node-scenarios/_index.md) | node_scenarios | Injects node failure through OpenShift/Kubernetes, cloud API's  |
| [Pod Failures](docs/scenarios/pod-scenario/_index.md) | pod_disruption_scenarios | Injects pod failures   |  
| [Pod Network Chaos](docs/scenarios/pod-network-scenario/_index.md) | pod_network_scenarios | Introduces network chaos at pod level                        | 
| [Power Outages](docs/scenarios/power-outage-scenarios/_index.md) | cluster_shut_down_scenarios | Shuts down the cluster for the specified duration and turns it back on to check the cluster health |
| [PVC disk fill](docs/scenarios/pvc-scenario/_index.md) | pvc_scenarios | Fills up a given PersistenVolumeClaim by creating a temp file on the PVC from a pod associated with it |
| [Service Disruption](docs/scenarios/service-disruption-scenarios/_index.md) | service_disruption_scenarios | Deleting all objects within a namespace          |  
| [Service Hijacking](docs/scenarios/service-hijacking-scenario/_index.md) | service_hijacking_scenarios | Hijacks a service http traffic to simulate custom HTTP responses |
| [Syn Flood](docs/scenarios/syn-flood-scenario/_index.md) | syn_flood_scenarios | Generates a substantial amount of TCP traffic directed at one or more Kubernetes services |
| [Time skew](docs/scenarios/time-scenarios/_index.md) | time_scenarios | Skews the time and date                            |     
| [Zone outages](docs/scenarios/zone-outage-scenarios/_index.md) | zone_outages_scenarios | Creates zone outage to observe the impact on the cluster, applications |


{{< notice type="info" >}}Explore our [use cases](docs/getting-started/use-cases.md) page to see if any align with your needs {{< /notice >}}