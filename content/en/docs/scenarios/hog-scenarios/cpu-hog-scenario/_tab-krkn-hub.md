This scenario hogs the cpu on the specified node on a Kubernetes/OpenShift cluster for a specified duration. For more information refer the following [documentation](/docs/scenarios/cpu-hog-scenario/_index.md).

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-cpu-hog
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines. 
Without the --env-host option you'll have to set each environment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}


```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-cpu-hog
OR 
$ docker run -e <VARIABLE>=<value> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-cpu-hog

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

| Parameter            | Description                                             | Default
|----------------------|---------------------------------------------------------| ------------------------------------                   |
| TOTAL_CHAOS_DURATION | Set chaos duration (in sec) as desired                  | 60                                  |
| NODE_CPU_CORE        | Number of cores (workers) of node CPU to be consumed    | 2                                    |
| NODE_CPU_PERCENTAGE  | Percentage of total cpu to be consumed                  | 50                                   |
| NAMESPACE            | Namespace where the scenario container will be deployed | default |
| NODE_SELECTOR        | Defines the node selector for choosing target nodes. If not specified, one schedulable node in the cluster will be chosen at random. If multiple nodes match the selector, all of them will be subjected to stress. If number-of-nodes is specified, that many nodes will be randomly selected from those identified by the selector.                                     | "" |                             |
| TAINTS               | List of taints for which tolerations need to created. Example: ["node-role.kubernetes.io/master:NoSchedule"] | [] |
| NUMBER_OF_NODES      | Restricts the number of selected nodes by the selector                                     | "" |                             |
| IMAGE                | The container image of the stress workload|quay.io/krkn-chaos/krkn-hog||

{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-cpu-hog
```


