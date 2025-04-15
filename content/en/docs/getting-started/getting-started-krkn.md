---
title: Getting Started with Krkn
# date: 2017-01-05
description: 
weight : 2
categories: [Best Practices, Placeholders]
tags: [docs]
---

## Getting Started Running Chaos Scenarios


### Config
Instructions on how to setup the config and the options supported can be found at [Config](docs/config.md).

#### Adding New Scenarios
Adding a new scenario is as simple as adding a new config file under [scenarios directory](https://github.com/redhat-chaos/krkn/tree/main/scenarios) and defining it in the main kraken [config](docs/config.md).
You can either copy an existing yaml file and make it your own, or fill in one of the templates below to suit your needs.

### Templates
#### Pod Scenario Yaml Template
For example, for adding a pod level scenario for a new application, refer to the sample scenario below to know what fields are necessary and what to add in each location:
```bash
# yaml-language-server: $schema=../plugin.schema.json
- id: kill-pods
  config:
    namespace_pattern: ^<namespace>$
    label_selector: <pod label>
    kill: <number of pods to kill>
    krkn_pod_recovery_time: <expected time for the pod to become ready>
```

#### Node Scenario Yaml Template

```bash
node_scenarios:
  - actions:  # Node chaos scenarios to be injected.
    - <chaos scenario>
    - <chaos scenario>
    node_name: <node name>  # Can be left blank.
    label_selector: <node label>
    instance_kill_count: <number of nodes on which to perform action>
    timeout: <duration to wait for completion>
    cloud_type: <cloud provider>
```


#### Time Chaos Scenario Template
```bash
time_scenarios:
  - action: 'skew_time' or 'skew_date'
    object_type: 'pod' or 'node'
    label_selector: <label of pod or node>
```


### Common Scenario Edits
If you just want to make small changes to pre-existing scenarios, feel free to edit the scenario file itself.

#### Example of Quick Pod Scenario Edit:
If you want to kill 2 pods instead of 1 in any of the pre-existing scenarios, you can either edit the number located at config ->  label_selector and/or namespace_pattern

#### Example of Quick Nodes Scenario Edit:
If your cluster is build on GCP instead of AWS, just change the cloud type in the [node_scenarios_example.yml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/aws_node_scenarios.yml) file.


### RBAC
 Based on the type of chaos test being executed, certain scenarios may require elevated privileges. The specific [RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) needed for each Krkn scenario are outlined in detail at the following link: [Krkn RBAC](../krkn/rbac.md)