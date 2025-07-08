---
title: Node Scenarios using Krkn
description: 
date: 2017-01-04
weight: 2
---

For any of the node scenarios, you'll specify `node_scenarios` as the scenario type. 

See example config here: 
```yaml
    chaos_scenarios:
        - node_scenarios: # List of chaos node scenarios to load
            - scenarios/***.yml
            - scenarios/***.yml # Can specify multiple files here
```

Sample scenario file, you are able to specify multiple list items under node_scenarios that will be ran serially
```yaml
node_scenarios:
  - actions:                   # node chaos scenarios to be injected
    - <action>                 # Can specify multiple actions here
    node_name: <node_name>     # node on which scenario has to be injected; can set multiple names separated by comma
    label_selector: <label>    # when node_name is not specified, a node with matching label_selector is selected for node chaos scenario injection; can specify multiple by a comma separated list
    instance_count: <instance_number> # Number of nodes to perform action/select that match the label selector
    runs: <run_int>            # number of times to inject each scenario under actions (will perform on same node each time)
    timeout: <timeout>         # duration to wait for completion of node scenario injection
    duration: <duration>       # duration to stop the node before running the start action
    cloud_type: <cloud>        # cloud type on which Kubernetes/OpenShift runs  
    parallel: <true_or_false>  # Run action on label or node name in parallel or sequential, defaults to sequential
    kube_check: <true_or_false> # Run the kubernetes api calls to see if the node gets to a certain state during the node scenario
```

## AWS

Cloud setup instructions can be found [here](../cloud_setup.md#aws). 
Sample scenario config can be found [here](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/aws_node_scenarios.yml).

The cloud type in the scenario yaml file needs to be `aws`

## Baremetal

Sample scenario config can be found [here](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/baremetal_node_scenarios.yml).

The cloud type in the scenario yaml file needs to be `bm`

{{% alert title="Note" %}}Baremetal requires setting the IPMI user and password to power on, off, and reboot nodes, using the config options `bm_user` and `bm_password`. It can either be set in the root of the entry in the scenarios config, or it can be set per machine.

If no per-machine addresses are specified, kraken attempts to use the BMC value in the BareMetalHost object. To list them, you can do 'oc get bmh -o wide --all-namespaces'. If the BMC values are blank, you must specify them per-machine using the config option 'bmc_addr' as specified below.

For per-machine settings, add a "bmc_info" section to the entry in the scenarios config. Inside there, add a configuration section using the node name. In that, add per-machine settings. Valid settings are 'bmc_user', 'bmc_password', and 'bmc_addr'.
See the example node scenario or the example below.{{% /alert %}}


{{% alert title="Note" %}}Baremetal requires oc (openshift client) be installed on the machine running Kraken. {{% /alert %}}

{{% alert title="Note" %}}Baremetal machines are fragile. Some node actions can occasionally corrupt the filesystem if it does not shut down properly, and sometimes the kubelet does not start properly.{{% /alert %}}



## Docker

The Docker provider can be used to run node scenarios against kind clusters.

[kind](https://kind.sigs.k8s.io/) is a tool for running local Kubernetes clusters using Docker container "nodes".

kind was primarily designed for testing Kubernetes itself, but may be used for local development or CI.


## GCP
Cloud setup instructions can be found [here](../cloud_setup.md#gcp). Sample scenario config can be found [here](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/gcp_node_scenarios.yml).

The cloud type in the scenario yaml file needs to be `gcp`

## Openstack

How to set up Openstack cli to run node scenarios is defined [here](../cloud_setup.md#openstack).

The cloud type in the scenario yaml file needs to be `openstack`

The supported node level chaos scenarios on an OPENSTACK cloud are only: `node_stop_start_scenario`, `stop_start_kubelet_scenario` and `node_reboot_scenario`.

{{% alert title="Note" %}} For `stop_start_helper_node_scenario`, visit [here](https://github.com/redhat-cop/ocp4-helpernode) to learn more about the helper node and its usage.
{{% /alert %}}


To execute the scenario, ensure the value for `ssh_private_key` in the node scenarios config file is set with the correct private key file path for ssh connection to the helper node. Ensure passwordless ssh is configured on the host running Kraken and the helper node to avoid connection errors.



## Azure

Cloud setup instructions can be found [here](../cloud_setup.md#azure). Sample scenario config can be found [here](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/azure_node_scenarios.yml).


The cloud type in the scenario yaml file needs to be `azure`

## Alibaba

How to set up Alibaba cli to run node scenarios is defined [here](../cloud_setup.md#alibaba).

{{% alert title="Note" %}} There is no "terminating" idea in Alibaba, so any scenario with terminating will "release" the node
. Releasing a node is 2 steps, stopping the node and then releasing it.{{% /alert %}}

The cloud type in the scenario yaml file needs to be `alibaba`

## VMware
How to set up VMware vSphere to run node scenarios is defined [here](../cloud_setup.md#vmware)

The cloud type in the scenario yaml file needs to be `vmware`


## IBMCloud
How to set up IBMCloud to run node scenarios is defined [here](../cloud_setup.md#ibmcloud)

See a sample of ibm cloud node scenarios [example config file](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/ibmcloud_node_scenarios.yml)

The cloud type in the scenario yaml file needs to be `ibm`


## General
{{% alert title="Note" %}} The `node_crash_scenario` and `stop_kubelet_scenario` scenarios are supported independent of the cloud platform.{{% /alert %}}

Use 'generic' or do not add the 'cloud_type' key to your scenario if your cluster is not set up using one of the current supported cloud types.