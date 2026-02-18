---
title: Node Scenarios
description:
date: 2017-01-04
weight: 3
---

<krkn-hub-scenario id="node-scenarios">
This scenario disrupts the node(s) matching the label or node name(s) on a Kubernetes/OpenShift cluster. These scenarios are performed in two different ways, either by the clusters cloud cli or by common/generic commands that can be performed on any cluster.


## Actions
The following node chaos scenarios are supported:
1. **node_start_scenario**: Scenario to start the node instance. _Need access to cloud provider_
2. **node_stop_scenario**: Scenario to stop the node instance. _Need access to cloud provider_
3. **node_stop_start_scenario**: Scenario to stop and then start the node instance. Not supported on VMware. _Need access to cloud provider_
4. **node_termination_scenario**: Scenario to terminate the node instance. _Need access to cloud provider_
5. **node_reboot_scenario**: Scenario to reboot the node instance. _Need access to cloud provider_
6. **stop_kubelet_scenario**: Scenario to stop the kubelet of the node instance. _Need access to cloud provider_
7. **stop_start_kubelet_scenario**: Scenario to stop and start the kubelet of the node instance. _Need access to cloud provider_
8. **restart_kubelet_scenario**: Scenario to restart the kubelet of the node instance. _Can be used with generic cloud type or when you don't have access to cloud provider_
9. **node_crash_scenario**: Scenario to crash the node instance. _Can be used with generic cloud type or when you don't have access to cloud provider_
10. **stop_start_helper_node_scenario**: Scenario to stop and start the helper node and check service status. _Need access to cloud provider_
10. **node_block_scenario**: Scenario to block inbound and outbound traffic from other nodes to a specific node for a set duration (only for Azure). _Need access to cloud provider_
11. **node_disk_detach_attach_scenario**: Scenario to detach and reattach disks (only for baremetals).

## Clouds
Supported cloud supported:
- [AWS](node-scenarios-krkn.md#aws)
- [Azure](node-scenarios-krkn.md#azure)
- [OpenStack](node-scenarios-krkn.md#openstack)
- [BareMetal](node-scenarios-krkn.md#baremetal)
- [GCP](node-scenarios-krkn.md#gcp)
- [VMware](node-scenarios-krkn.md#vmware)
- [Alibaba](node-scenarios-krkn.md#alibaba)
- [Docker](node-scenarios-krkn.md#docker)
- [IBMCloud](node-scenarios-krkn.md#ibmcloud)
- [IBMCloud Power](node-scenarios-krkn.md#ibmcloud-power)

{{% alert title="Note" %}}If the node does not recover from the node_crash_scenario injection, reboot the node to get it back to Ready state. {{% /alert %}}

{{% alert title="Note" %}}node_start_scenario, node_stop_scenario, node_stop_start_scenario, node_termination_scenario, node_reboot_scenario and stop_start_kubelet_scenario are supported on
- AWS
- Azure
- OpenStack
- BareMetal
- GCP
- VMware
- Alibaba
- IbmCloud
- IbmCloudPower
{{% /alert %}}

</krkn-hub-scenario>



## Recovery Times

In each node scenario, the end telemetry details of the run will show the time it took for each node to stop and recover depening on the scenario.

The details printed in telemetry:
- *node_name*: Node name
- *node_id*: Node id
- *not_ready_time*: Amount of time the node took to get to a not ready state after cloud provider has stopped node
- *ready_time*: Amount of time the node took to get to a ready state after cloud provider has become in started state
- *stopped_time*: Amount of time the cloud provider took to stop a node
- *running_time*: Amount of time the cloud provider took to get a node running
- *terminating_time*: Amount of time the cloud provider took for node to become terminated

Example:
```bash
"affected_nodes": [
    {
        "node_name": "cluster-name-**.438115.internal",
        "node_id": "cluster-name-**",
        "not_ready_time": 0.18194103240966797,
        "ready_time": 0.0,
        "stopped_time": 140.74104499816895,
        "running_time": 0.0,
        "terminating_time": 0.0
    },
    {
        "node_name": "cluster-name-**-master-0.438115.internal",
        "node_id": "cluster-name-**-master-0",
        "not_ready_time": 0.1611928939819336,
        "ready_time": 0.0,
        "stopped_time": 146.72056317329407,
        "running_time": 0.0,
        "terminating_time": 0.0
    },
    {
        "node_name": "cluster-name-**.438115.internal",
        "node_id": "cluster-name-**",
        "not_ready_time": 0.0,
        "ready_time": 43.521320104599,
        "stopped_time": 0.0,
        "running_time": 12.305592775344849,
        "terminating_time": 0.0
    },
    {
        "node_name": "cluster-name-**-master-0.438115.internal",
        "node_id": "cluster-name-**-master-0",
        "not_ready_time": 0.0,
        "ready_time": 48.33336925506592,
        "stopped_time": 0.0,
        "running_time": 12.052034854888916,
        "terminating_time": 0.0
    }
]
```

## How to Run Node Scenarios

Choose your preferred method to run node scenarios:

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" lang="krkn-hub" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}

## Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/ANZY7HhPdWTNaWt4xMFanF6Q5.js" id="asciicast-ANZY7HhPdWTNaWt4xMFanF6Q5" async="true" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;"></script>
