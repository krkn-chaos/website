---
title: PVC Scenario using Krkn-Hub
description: >
date: 2017-01-05
weight: 4
---
This scenario fills up a given PersistenVolumeClaim by creating a temp file on the PVC from a pod associated with it. The purpose of this scenario is to fill up a volume to understand faults cause by the application using this volume. For more information refer the following [documentation](/docs/scenarios/pvc-scenario/_index.md).

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pvc-scenarios
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines. 
Without the --env-host option you'll have to set each enviornment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}


```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pvc-scenarios
OR 
$ docker run -e <VARIABLE>=<value> --name=<container_name> --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pvc-scenarios

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

If both `PVC_NAME` and `POD_NAME` are defined, `POD_NAME` value will be overridden from the `Mounted By:` value on PVC definition.


See list of variables that apply to all scenarios [here](all_scenarios_env.md) that can be used/set in addition to these scenario specific variables

Parameter               | Description                                                                     | Default
----------------------- | -----------------------------------------------------------------               | ------------------------------------ |
PVC_NAME                | Targeted PersistentVolumeClaim in the cluster (if null, POD_NAME is required)   |                                      |
POD_NAME                | Targeted pod in the cluster (if null, PVC_NAME is required)                     |                                      |
NAMESPACE               | Targeted namespace in the cluster (required)                                    |                                      |
FILL_PERCENTAGE         | Targeted percentage to be filled up in the PVC                                  | 50                                   |
DURATION                | Duration in seconds with the PVC filled up                                      | 60                                   |

{{% alert title="Note" %}} Set NAMESPACE environment variable to `openshift-.*` to pick and disrupt pods randomly in openshift system namespaces, the DAEMON_MODE can also be enabled to disrupt the pods every x seconds in the background to check the reliability. {{% /alert %}}

{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pvc-scenarios
```