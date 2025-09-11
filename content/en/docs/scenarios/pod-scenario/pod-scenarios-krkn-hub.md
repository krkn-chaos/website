---
title: Pod Scenarios using Krkn-hub
description: >
date: 2017-01-05
weight: 2
---
This scenario disrupts the pods matching the label in the specified namespace on a Kubernetes/OpenShift cluster.

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pod-scenarios
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines. 
Without the --env-host option you'll have to set each enviornment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}


```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pod-scenarios
OR 
$ docker run -e <VARIABLE>=<value> --name=<container_name> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pod-scenarios

$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Tip" %}} Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v ~kubeconfig:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:<scenario>``` {{% /alert %}}
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

See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

Parameter               | Description                                                           | Default
----------------------- | -----------------------------------------------------------------     | ------------------------------------ |
NAMESPACE               | Targeted namespace in the cluster ( supports regex )                                     | openshift-.*                         |
POD_LABEL               | Label of the pod(s) to target                                         | ""                                   | 
NAME_PATTERN            | Regex pattern to match the pods in NAMESPACE  when POD_LABEL is not specified | .* |
DISRUPTION_COUNT        | Number of pods to disrupt                                             | 1                                    |
KILL_TIMEOUT            | Timeout to wait for the target pod(s) to be removed in seconds        | 180                                  |
EXPECTED_RECOVERY_TIME           | Fails if the pod disrupted do not recover within the timeout set      | 120                                  |
NODE_LABEL_SELECTOR           | Label of the node(s) to target                                         | ""                                   | 
NODE_NAMES            | Name of the node(s) to target. Example: ["worker-node-1","worker-node-2","master-node-1"]                                         | []                                   |

{{% alert title="Note" %}} Set NAMESPACE environment variable to `openshift-.*` to pick and disrupt pods randomly in openshift system namespaces, the DAEMON_MODE can also be enabled to disrupt the pods every x seconds in the background to check the reliability.{{% /alert %}}

{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:container-scenarios
```

#### Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/452351.js" id="asciicast-452351"  style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;" async="true"></script>
