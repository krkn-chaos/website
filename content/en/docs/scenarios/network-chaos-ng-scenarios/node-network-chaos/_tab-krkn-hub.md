
#### Run

```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-network-chaos
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-network-chaos
OR
$ docker run -e <VARIABLE>=<value> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-network-chaos
$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

**TIP**: Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```bash
kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v ~/kubeconfig:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-network-chaos
```


#### Supported parameters

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

ex.)
`export <parameter_name>=<value>`


See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

|  Parameter                    | Description                                                                                   | Default                                          |
|-------------------------------| --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| LABEL_SELECTOR                | Label selector to target one or more nodes (e.g. `node-role.kubernetes.io/worker=`). If omitted, NODE_NAME is used instead | ""                         |
| NODE_NAME                     | Exact node name to target when LABEL_SELECTOR is not specified                                | ""                                               |
| INSTANCE_COUNT                | Number of nodes matching the selector to apply chaos on simultaneously                        | 1                                                |
| INTERFACES                    | YAML-style list of interface names to shape (e.g. `[br-ex]` or `[eth0,eth1]`). Leave empty to target the node's default interface | "[]"        |
| TRAFFIC_TYPE                  | Direction of traffic to shape. Accepted values: `[egress]`, `[ingress]`, or `[egress,ingress]` | "[egress]"                                      |
| LATENCY                       | Artificial delay to add to matching packets. Format: `<number><unit>` where unit is `us`, `ms`, or `s` (e.g. `200ms`). Leave empty to skip | ""    |
| LOSS                          | Percentage of packets to drop. Digits only, no `%` symbol (e.g. `10` means 10%). Leave empty to skip | ""                                         |
| BANDWIDTH                     | Maximum throughput for matching traffic. Format: `<number><unit>` where unit is `bit`, `kbit`, `mbit`, `gbit`, or `tbit` (e.g. `100mbit`). Leave empty to skip | "" |
| TEST_DURATION                 | How long (in seconds) to hold the tc rules before cleanup                                     | 120                                              |
| WAIT_DURATION                 | Seconds to wait after chaos cleanup before the scenario exits                                 | 0                                                |
| EXECUTION                     | Execution mode when targeting multiple nodes: `serial` or `parallel`                          | parallel                                         |
| FORCE                         | When `true`, removes any pre-existing tc qdiscs on the interface before applying new rules. Use with caution | false                               |
| NAMESPACE                     | Kubernetes namespace where the scenario helper pod will be scheduled                          | default                                          |
| IMAGE                         | Container image used for the chaos helper pod that applies tc rules on the node               | quay.io/krkn-chaos/krkn-network-chaos:latest     |
| SERVICE_ACCOUNT               | Kubernetes service account to assign to the helper pod (leave empty to use the namespace default) | ""                                           |
| TAINTS                        | YAML-style list of node taints the helper pod should tolerate (e.g. `["node-role.kubernetes.io/master:NoSchedule"]`) | "[]"                    |


**NOTE** In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`. For example:
```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-network-chaos
```
