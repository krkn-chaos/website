---
type: "docs/scenarios"
title: Hog Scenarios
description: 
date: 2017-01-04
---

# Hog Scenarios background

Hog Scenarios are designed to push the limits of memory, CPU, or I/O on one or more nodes in your cluster. They also serve to evaluate whether your cluster can withstand rogue pods that excessively consume resources without any limits.

These scenarios involve deploying one or more workloads in the cluster. Based on the specific configuration, these workloads will use a predetermined amount of resources for a specified duration.

## Config Options

#### Common options

| Option  | Type     | Description    |
|---------|-------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `duration` | number  | the duration of the stress test in seconds       |
| `workers` | number (Optional)  | the number of threads instantiated by stress-ng, if left empty the number of workers will match the number of available cores in the node.   |
| `hog-type` | string (Enum)  | can be cpu, memory or io.    |
| `image` | string  | the container image of the stress workload    |
| `namespace` | string   | the namespace where the stress workload will be deployed   |
| `node-selector` | string (Optional) | defines the node selector for choosing target nodes. If not specified, one schedulable node in the cluster will be chosen at random. If multiple nodes match the selector, all of them will be subjected to stress. If number-of-nodes is specified, that many nodes will be randomly selected from those identified by the selector. |
|`taints`| list (Optional) default [] | list of taints for which tolerations need to created. Example: ["node-role.kubernetes.io/master:NoSchedule"]|
| `number-of-nodes` | number (Optional) | restricts the number of selected nodes by the selector|


### Available Scenarios
#### Hog scenarios:
- [CPU Hog](/docs/scenarios/hog-scenarios/cpu-hog-scenario/_index.md)
- [Memory Hog](/docs/scenarios/hog-scenarios/memory-hog-scenario/_index.md)
- [I/O Hog](/docs/scenarios/hog-scenarios/io-hog-scenario/_index.md)

