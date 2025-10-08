---
title: Scenarios
description: Available Kkrn-AI Scenarios
weight: 4
---

The following Krkn scenarios are currently supported by Kkrn-AI.

> At least one scenario must be enabled for the Kkrn-AI experiment to run.

| **Scenario**        	| **Kkrn-AI Config (YAML)**                      	|
|---------------------	|------------------------------------------	|
| [Pod Scenario](../../scenarios/pod-scenario/)        	| *scenario.pod-scenarios*       	|
| [Application Outages](../../scenarios/application-outage/) 	| *scenario.application-outages* 	|
| [Container Scenario](../../scenarios/container-scenario/)  	| *scenario.container-scenarios* 	|
| [Node CPU Hog](../../scenarios/hog-scenarios/cpu-hog-scenario/)       	| *scenario.node-cpu-hog*        	|
| [Node Memory Hog](../../scenarios/hog-scenarios/memory-hog-scenario/)     	| *scenario.node-memory-hog*     	|
| [Time Scenario](../../scenarios/time-scenarios/)       	| *scenario.time-scenarios*      	|


By default, scenarios are not enabled. Depending on your use case, you can enable or disable these scenarios in the `krkn-ai.yaml` config file by setting the `enable` field to `true` or `false`.

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

  time-scenarios:
    enable: true
```
