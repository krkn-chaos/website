---
title: Arcaflow Scenarios using Krkn
description: 
date: 2017-01-04
weight: 2
---
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