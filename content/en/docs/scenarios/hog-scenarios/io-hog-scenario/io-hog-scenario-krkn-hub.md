---
title: IO Hog Scenario using Krkn-Hub
description: >
date: 2017-01-05
weight: 4
---
This scenario hogs the IO on the specified node on a Kubernetes/OpenShift cluster for a specified duration. For more information refer the following [documentation](/docs/scenarios/io-hog-scenario/_index.md).

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-kube-config>:/root/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-io-hog
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines. 
Without the --env-host option you'll have to set each enviornment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}

```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v <path-to-kube-config>:/root/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-io-hog
OR 
$ docker run -e <VARIABLE>=<value> --net=host -v <path-to-kube-config>:/root/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-io-hog

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

|  Parameter           | Description     | Default
|----------------------|-------------------------------------------------------------------------------------| ------------------------------------                   |
| TOTAL_CHAOS_DURATION | Set chaos duration (in sec) as desired   | 180                                  |
| IO_BLOCK_SIZE        | string size of each write in bytes. Size can be from 1 byte to 4m   | 1m |
| IO_WORKERS           | Number of stressorts     | 5 |
| IO_WRITE_BYTES      | string writes N bytes for each hdd process. The size can be expressed as % of free space on the file system or in units of Bytes, KBytes, MBytes and GBytes using the suffix b, k, m or g   | 10m |
| NAMESPACE            | Namespace where the scenario container will be deployed   | default |
| NODE_SELECTOR        | defines the node selector for choosing target nodes. If not specified, one schedulable node in the cluster will be chosen at random. If multiple nodes match the selector, all of them will be subjected to stress. If number-of-nodes is specified, that many nodes will be randomly selected from those identified by the selector. | "" |     |
| NODE_NAME            | Target specific node(s) by name. Supports single node, comma-separated list, or YAML list format. Takes precedence over NODE_SELECTOR when specified. | "" |     |
| TAINTS               | List of taints for which tolerations need to created. Example: ["node-role.kubernetes.io/master:NoSchedule"] | [] |
| NODE_MOUNT_PATH        | the local path in the node that will be mounted in the pod and that will be filled by the scenario              | "" |   |
| NUMBER_OF_NODES      | restricts the number of selected nodes by the selector     | "" |                             |
| IMAGE                | the container image of the stress workload      |quay.io/krkn-chaos/krkn-hog||

{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-custom-metrics-profile>:/root/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/root/kraken/config/alerts -v <path-to-kube-config>:/root/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-io-hog
```
