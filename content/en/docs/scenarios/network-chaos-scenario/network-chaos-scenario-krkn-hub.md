---
title: Network Chaos Scenario using Krkn-Hub
description: >
date: 2017-01-05
weight: 2
---
This scenario introduces network latency, packet loss, bandwidth restriction in the egress traffic of a Node's interface using the tc and Netem. For more information refer the following [documentation](/docs/scenarios/network-chaos-scenario/_index.md).

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:network-chaos
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines. 
Without the --env-host option you'll have to set each enviornment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}

```bash
$ docker run -e <VARIABLE>=<value> --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:network-chaos

$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

{{% alert title="Tip" %}} Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v ~kubeconfig:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:<scenario>``` {{% /alert %}}
#### Supported parameters

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

Example if --env-host is used:
```
export <parameter_name>=<value>
```
OR on the command line like example: 

```
-e <VARIABLE>=<value> 
```

{{% alert title="Note" %}} `export TRAFFIC_TYPE=egress` for Egress scenarios and `export TRAFFIC_TYPE=ingress` for Ingress scenarios{{% /alert %}}

See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

##### Egress Scenarios

Parameter               | Description                                                           | Default
----------------------- | -----------------------------------------------------------------     | ------------------------------------ |
DURATION                | Duration in seconds - during with network chaos will be applied.         | 300                                  |
IMAGE | Image used to disrupt network on a pod  |  quay.io/krkn-chaos/krkn:tools | 
NODE_NAME               | Node name to inject faults in case of targeting a specific node; Can set multiple node names separated by a comma      | ""                                   |
LABEL_SELECTOR          | When NODE_NAME is not specified, a node with matching label_selector is selected for running.          | node-role.kubernetes.io/master       |
INSTANCE_COUNT          | Targeted instance count matching the label selector                   | 1                                   |
INTERFACES          | List of interface on which to apply the network restriction.                   | []                                    |
EXECUTION          | Execute each of the egress option as a single scenario(parallel) or as separate scenario(serial).                   | parallel                                    |
EGRESS          | Dictonary of values to set  network latency(latency: 50ms), packet loss(loss: 0.02), bandwidth restriction(bandwidth: 100mbit)                  | {bandwidth: 100mbit}                                    |


##### Ingress Scenarios

Parameter               | Description                                                           | Default
----------------------- | -----------------------------------------------------------------     | ------------------------------------ |
DURATION                | Duration in seconds - during with network chaos will be applied.         | 300                                  |
IMAGE | Image used to disrupt network on a pod  |  quay.io/krkn-chaos/krkn:tools | 
TARGET_NODE_AND_INTERFACE               |  # Dictionary with key as node name(s) and value as a list of its interfaces to test. For example: {ip-10-0-216-2.us-west-2.compute.internal: [ens5]}      | ""                                   |
LABEL_SELECTOR          | When NODE_NAME is not specified, a node with matching label_selector is selected for running.          | node-role.kubernetes.io/master       |
INSTANCE_COUNT          | Targeted instance count matching the label selector                   | 1                                   |
EXECUTION          |  Used to specify whether you want to apply filters on interfaces one at a time or all at once.                   | parallel|
NETWORK_PARAMS     | latency, loss and bandwidth are the three supported network parameters to alter for the chaos test. For example: {latency: 50ms, loss: '0.02'} | "" |
WAIT_DURATION           | Ensure that it is at least about twice of test_duration               | 300                                   |

{{% alert title="Note" %}} For disconnected clusters, be sure to also mirror the helper image of quay.io/krkn-chaos/krkn:tools and set the mirrored image path properly  {{% /alert %}}




{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:network-chaos
```


