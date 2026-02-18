---
title: Running a Chaos Scenario with Krkn
# date: 2017-01-05
description: 
weight : 2
categories: [Best Practices, Placeholders]
tags: [docs]
---

## Getting Started Running Chaos Scenarios

## Config
Instructions on how to setup the config and all the available options supported can be found at [Config](docs/config.md).

In all the examples below you'll replace the `scenario_type` with the scenario plugin type that can be found in the [second column here](../scenarios/_index.md)

### Running a Single Scenario
To run a single scenario, you'll edit the krkn config file and only have 1 item in the list of chaos_scenarios

```yaml
kraken:
    ...
    chaos_scenarios:
        - <scenario_type>:
            - scenarios/<scenario_file>
    ...
```


### Running Multiple Scenarios
To run multiple scenarios, you'll edit the krkn config file and add multiple scenarios into chaos_scenarios. If you want to run multiple scenario files that are the same scenario type you can add multiple items under the scenario_type. If you want to run multiple different scenario types you can add those under chaos_scenarios 


```yaml
kraken:
    ...
    chaos_scenarios:
        - <scenario_type>:
            - scenarios/<scenario_file_1>
            - scenarios/<scenario_file_2>
        - <scenario_type_2>:
            - scenarios/<scenario_file_3>
            - scenarios/<scenario_file_4>
```


## Creating a Scenario File

You can either copy an existing scenario yaml file and make it your own, or fill in one of the templates below to suit your needs.


### Common Scenario Edits
If you just want to make small changes to pre-existing scenarios, feel free to edit the scenario file itself.

#### Example of Quick Pod Scenario Edit:
If you want to kill 2 pods instead of 1 in any of the pre-existing scenarios, you can either edit the iterations number located at config or edit the kill count in the scenario file 


```yaml
- id: kill-pods
  config:
    namespace_pattern: ^kube-system$
    name_pattern: .*
    kill: 1 -> 2
    krkn_pod_recovery_time: 120
```

#### Example of Quick Nodes Scenario Edit:
If your cluster is build on GCP instead of AWS, just change the cloud type in the [node_scenarios_example.yml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/aws_node_scenarios.yml) file.

```yaml
node_scenarios:
  - actions:
    - node_reboot_scenario
    node_name:
    label_selector: node-role.kubernetes.io/worker
    instance_count: 1
    timeout: 120
    cloud_type: aws -> gcp
    parallel: true
    kube_check: true

```

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


### RBAC
Based on the type of chaos test being executed, certain scenarios may require elevated privileges. The specific [RBAC Authorization](https://kubernetes.io/docs/reference/access-authn-authz/rbac/) needed for each Krkn scenario are outlined in detail at the following link: [Krkn RBAC](../krkn/rbac.md)