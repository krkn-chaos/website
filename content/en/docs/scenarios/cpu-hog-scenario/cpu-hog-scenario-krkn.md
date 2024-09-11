---
title: CPU Hog Scenarios using Krkn
description: 
date: 2017-01-04
weight: 2
---
To enable this plugin add the pointer to the scenario input file `scenarios/arcaflow/cpu-hog/input.yaml` as described in the 
[Usage](#usage) section.
This scenario takes a list of objects named `input_list` with the following properties:

- **kubeconfig :** *string* the kubeconfig needed by the deployer to deploy the sysbench plugin in the target cluster
- **namespace :** *string* the namespace where the scenario container will be deployed
**Note:** this parameter will be automatically filled by kraken if the `kubeconfig_path` property is correctly set
- **node_selector :** *key-value map* the node label that will be used as `nodeSelector` by the pod to target a specific cluster node
- **duration :** *string* stop  stress  test  after  N  seconds.  One  can  also specify the units of time in seconds, minutes, hours, days or years with the suffix s, m, h, d or y.
- **cpu_count :** *int* the number of CPU cores to be used (0 means all)
- **cpu_method :** *string* a fine-grained control of which cpu stressors to use (ackermann, cfloat etc. see [manpage](https://manpages.org/sysbench) for all the cpu_method options)
- **cpu_load_percentage :** *int* the CPU load by percentage

To perform several load tests in the same run simultaneously (eg. stress two or more nodes in the same run) add another item
to the `input_list` with the same properties (and eventually different values eg. different node_selectors 
to schedule the pod on different nodes). To reduce (or increase) the parallelism change the value `parallelism` in `workload.yaml` file 

### Usage

To enable arcaflow scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `arcaflow_scenarios` then add the desired scenario
pointing to the `input.yaml` file.
```yaml
kraken:
    ...
    chaos_scenarios:
        - arcaflow_scenarios:
            - scenarios/arcaflow/cpu-hog/input.yaml
```

#### input.yaml
The implemented scenarios can be found in *scenarios/arcaflow/<scenario_name>* folder.
The entrypoint of each scenario is the *input.yaml* file. 
In this file there are all the options to set up the scenario accordingly to the desired target 
### config.yaml
The arcaflow config file. Here you can set the arcaflow deployer and the arcaflow log level.
The supported deployers are:
- Docker
- Podman (podman daemon not needed, suggested option)
- Kubernetes

The supported log levels are:
- debug
- info
- warning
- error
### workflow.yaml
This file contains the steps that will be executed to perform the scenario against the target.
Each step is represented by a container that will be executed from the deployer and its options.
Note that we provide the scenarios as a template, but they can be manipulated to define more complex workflows.
To have more details regarding the arcaflow workflows architecture and syntax it is suggested to refer to the [Arcaflow Documentation](https://arcalot.io/arcaflow/).

This edit is no longer in quay image
Working on fix in ticket: https://issues.redhat.com/browse/CHAOS-494
This will effect all versions 4.12 and higher of OpenShift