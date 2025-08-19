---
title: Application outage Scenario using Krkn-hub
description: >
weight: 2
---
This scenario disrupts the traffic to the specified application to be able to understand the impact of the outage on the dependent service/user experience. Refer [docs](/docs/scenarios/application-outage/_index.md) for more details.

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --env-host=true --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:application-outages
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines. 
Without the --env-host option you'll have to set each enviornment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}


```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:application-outages
OR 
$ docker run -e <VARIABLE>=<value> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:application-outages

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

See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

Parameter               | Description                                                           | Default
----------------------- | -----------------------------------------------------------------     | ------------------------------------ |
DURATION                | Duration in seconds after which the routes will be accessible         | 600                                  |
NAMESPACE               | Namespace to target - all application routes will go inaccessible if pod selector is empty ( Required )|  No default |
POD_SELECTOR            | Pods to target. For example "{app: foo}"                                | No default                           |
BLOCK_TRAFFIC_TYPE      | It can be Ingress or Egress or Ingress, Egress ( needs to be a list ) | [Ingress, Egress]                    |

{{% alert title="Note" %}} Defining the `NAMESPACE` parameter is required for running this scenario while the pod_selector is optional. In case of using pod selector to target a particular application, make sure to define it using the following format with a space between key and value: "{key: value}". {{% /alert %}}

{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --env-host=true --pull=always -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:application-outages
```

#### Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/452403.js" id="asciicast-452403" async="true" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;" ></script>