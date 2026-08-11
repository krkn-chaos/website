---
title: Scenarios
description: Available Krkn-AI Scenarios
weight: 4
---

The following Krkn scenarios are currently supported by Krkn-AI.

> At least one scenario must be enabled for the Krkn-AI experiment to run.

| **Scenario**        	| **Krkn-AI Config (YAML)**                      	|
|---------------------	|------------------------------------------	|
| [Pod Scenario](../../scenarios/pod-scenarios/)        	| *scenario.pod-scenarios*       	|
| [Application Outages](../../scenarios/application-outages/) 	| *scenario.application-outages* 	|
| [Container Scenario](../../scenarios/container-scenarios/)  	| *scenario.container-scenarios* 	|
| [Node CPU Hog](../../scenarios/hog-scenarios/node-cpu-hog/)       	| *scenario.node-cpu-hog*        	|
| [Node Memory Hog](../../scenarios/hog-scenarios/node-memory-hog/)     	| *scenario.node-memory-hog*     	|
| [Node IO Hog](../../scenarios/hog-scenarios/node-io-hog/)     	| *scenario.node-io-hog*     	|
| [Syn Flood](../../scenarios/syn-flood/)       	| *scenario.syn-flood*      	|
| [Time Scenario](../../scenarios/time-scenarios/)       	| *scenario.time-scenarios*      	|
| [Network Scenarios](../../scenarios/network-chaos/)       	| *scenario.network-scenarios*      	|
| [DNS Outage](../../scenarios/dns-outage/)       	| *scenario.dns-outage*      	|
| [PVC Scenario](../../scenarios/pvc-scenario/)       	| *scenario.pvc-scenarios*      	|
| [KubeVirt VM Outage](../../scenarios/kubevirt-outage/)       	| *scenario.kubevirt-scenarios*      	|
| [Storage Throttle](../../scenarios/storage-throttle/)       	| *scenario.storage-throttle*      	|


When you generate a config with [discover](../discover.md), Krkn-AI enables the scenarios your cluster can run and disables the rest. Each scenario needs certain components to be present:

| **Scenario**        | **Requires**                               |
|---------------------|--------------------------------------------|
| Pod Scenario        | A running pod with at least one label      |
| Application Outages | A running pod with at least one label      |
| Container Scenario  | A running pod with at least one label      |
| Node CPU Hog        | A schedulable, ready node                  |
| Node Memory Hog     | A schedulable, ready node                  |
| Node IO Hog         | A schedulable, ready node                  |
| Time Scenario       | A namespace containing pods, and labels on pods or nodes |
| Network Scenarios   | A node with a discovered network interface |
| DNS Outage          | A running pod                              |
| Syn Flood           | A service that exposes ports               |
| PVC Scenario        | A PVC, or a pod in a discovered namespace  |
| KubeVirt VM Outage  | A KubeVirt virtual machine instance        |
| Storage Throttle    | A PVC, or a pod in a discovered namespace  |

If nothing can be built, every scenario is disabled and Krkn-AI logs a warning. That usually means the filters were too narrow, so widen `-n` and run `discover` again.

You can always override this. Depending on your use case, enable or disable these scenarios in the `krkn-ai.yaml` config file by setting the `enable` field to `true` or `false`.

```yaml
scenario:
  pod-scenarios:
    enable: true

  application-outages:
    enable: false

  container-scenarios:
    enable: false

  node-cpu-hog:
    enable: true

  node-memory-hog:
    enable: true

  node-io-hog:
    enable: false

  syn-flood:
    enable: false

  time-scenarios:
    enable: true

  network-scenarios:
    enable: false

  dns-outage:
    enable: true

  pvc-scenarios:
    enable: false

  kubevirt-scenarios:
    enable: false

  storage-throttle:
    enable: false
```
