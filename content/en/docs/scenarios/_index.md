---
title: Scenarios
description: 
date: 2017-01-04
weight: 3
---

### Supported chaos scenarios

Scenario   | Description                                                      
------------------------------------------- |------------------------------------------------------------------ |
[Pod failures](docs/scenarios/pod-scenario/_index.md) | Injects pod failures                                         
[Container failures](docs/scenarios/container-scenario/_index.md) | Injects container failures based on the provided kill signal
[Node failures](docs/scenarios/node-scenarios/_index.md) | Injects node failure through OpenShift/Kubernetes, cloud API's   
[zone outages](docs/scenarios/zone-outage-scenarios/_index.md) | Creates zone outage to observe the impact on the cluster, applications
[time skew](docs/scenarios/time-scenarios/_index.md) | Skews the time and date                                          
[Node cpu hog](docs/scenarios/cpu-hog-scenario/_index.md) | Hogs CPU on the targeted nodes
[Node memory hog](docs/scenarios/memory-hog-scenario/_index.md) | Hogs memory on the targeted nodes                         
[Node IO hog](docs/scenarios/io-hog-scenario/_index.md) | Hogs io on the targeted nodes                                    
[Service Disruption](docs/scenarios/service-disruption-scenarios/_index.md) | Deleting all objects within a namespace                          
[Application outages](docs/scenarios/application-outage/_index.md) | Isolates application Ingress/Egress traffic to observe the impact on dependent applications and recovery/initialization timing 
[Power Outages](docs/scenarios/power-outage-scenarios/_index.md) | Shuts down the cluster for the specified duration and turns it back on to check the cluster health 
[PVC disk fill](docs/scenarios/pvc-scenario/_index.md) | Fills up a given PersistenVolumeClaim by creating a temp file on the PVC from a pod associated with it 
[Network Chaos](docs/scenarios/network-chaos-scenario/_index.md) | Introduces network latency, packet loss, bandwidth restriction in the egress traffic of a Node's interface using tc and Netem
[Pod Network Chaos](docs/scenarios/pod-network-scenario/_index.md) | Introduces network chaos at pod level                            
[Service Hijacking](docs/scenarios/service-hijacking-scenario/_index.md) | Hijacks a service http traffic to simulate custom HTTP responses 
