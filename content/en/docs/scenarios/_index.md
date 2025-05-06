---
type: "docs/scenarios"
title: Scenarios
description: Krkn scenario list
date: 2017-01-04
weight: 4
---

## Supported chaos scenarios

| **Scenario**   | **Plugin Type**   |  **Description** |
| ------------------------------------------- | ------------------------------------------- | ------------------------------------------------------------------ |
| [Pod failures](docs/scenarios/pod-scenario/_index.md) | pod_disruption_scenarios | Injects pod failures   |                                      
| [Container failures](docs/scenarios/container-scenario/_index.md) | container_scenarios | Injects container failures based on the provided kill signal | 
| [Node failures](docs/scenarios/node-scenarios/_index.md) | node_scenarios | Injects node failure through OpenShift/Kubernetes, cloud API's  |
| [Zone outages](docs/scenarios/zone-outage-scenarios/_index.md) | zone_outages_scenarios | Creates zone outage to observe the impact on the cluster, applications |
| [Time skew](docs/scenarios/time-scenarios/_index.md) | time_scenarios | Skews the time and date                            |               
| [Node cpu hog](docs/scenarios/hog-scenarios/cpu-hog-scenario/_index.md) | hog_scenarios | Hogs CPU on the targeted nodes |
| [Node memory hog](docs/scenarios/hog-scenarios/memory-hog-scenario/_index.md) | hog_scenarios | Hogs memory on the targeted nodes   |                       
| [Node IO hog](docs/scenarios/hog-scenarios/io-hog-scenario/_index.md) | hog_scenarios| Hogs io on the targeted nodes              |                       
| [Service Disruption](docs/scenarios/service-disruption-scenarios/_index.md) | service_disruption_scenarios | Deleting all objects within a namespace          |                 
| [Application outages](docs/scenarios/application-outage/_index.md) | application_outages_scenarios | Isolates application Ingress/Egress traffic to observe the impact on dependent applications and recovery/initialization timing  |
| [Power Outages](docs/scenarios/power-outage-scenarios/_index.md) | cluster_shut_down_scenarios | Shuts down the cluster for the specified duration and turns it back on to check the cluster health |
| [PVC disk fill](docs/scenarios/pvc-scenario/_index.md) | pvc_scenarios | Fills up a given PersistenVolumeClaim by creating a temp file on the PVC from a pod associated with it |
| [Network Chaos](docs/scenarios/network-chaos-scenario/_index.md) | network_chaos_scenarios | Introduces network latency, packet loss, bandwidth restriction in the egress traffic of a Node's interface using tc and Netem |
| [Network Chaos NG](docs/scenarios/network-chaos-ng-scenario/_index.md) | network_chaos_ng_scenarios | Introduces Node network filtering scenario and a new infrastructure to refactor and port the Network Chaos scenarios |
| [Pod Network Chaos](docs/scenarios/pod-network-scenario/_index.md) | pod_network_scenarios | Introduces network chaos at pod level                        | 
| [Service Hijacking](docs/scenarios/service-hijacking-scenario/_index.md) | service_hijacking_scenarios | Hijacks a service http traffic to simulate custom HTTP responses |
| [Syn Flood](docs/scenarios/syn-flood-scenario/_index.md) | syn_flood_scenarios | Generates a substantial amount of TCP traffic directed at one or more Kubernetes services |



## How to Use Plugin Names
Use the plugin type in the second column above when creating your chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    .. 
    chaos_scenarios:
        - <plugin_type>:
            - scenarios/<scenario_name>.yaml
  ```