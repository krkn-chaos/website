
#### Run

```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:vmi-network-filter
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:vmi-network-filter
OR
$ docker run -e <VARIABLE>=<value> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:vmi-network-filter
$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

**TIP**: Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```bash
kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v ~/kubeconfig:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:vmi-network-filter
```


#### Supported parameters

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

ex.)
`export <parameter_name>=<value>`

See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

| Parameter              | Description                                                                                          | Type    | Default                                      |
|------------------------|------------------------------------------------------------------------------------------------------|---------|----------------------------------------------|
| TOTAL_CHAOS_DURATION   | Chaos duration in seconds                                                                            | number  | 120                                          |
| NAMESPACE              | Namespace containing the target VMIs (required)                                                      | string  |                                              |
| VMI_NAME               | Regex to match VMI names (e.g. `virt-server-.*` or `.*` for all)                                    | string  | `.*`                                         |
| LABEL_SELECTOR         | Label selector to filter VMIs (e.g. `app=myapp`)                                                     | string  | `""`                                         |
| INSTANCE_COUNT         | Maximum number of VMIs to target                                                                     | number  | 1                                            |
| EXECUTION              | Execution mode: `serial` or `parallel`                                                               | enum    | `serial`                                     |
| INGRESS                | Apply DROP rules to incoming traffic                                                                 | boolean | true                                         |
| EGRESS                 | Apply DROP rules to outgoing traffic                                                                 | boolean | true                                         |
| INTERFACES             | Comma-separated tap interface names (empty to auto-detect)                                           | string  | `""`                                         |
| PORTS                  | Comma-separated port numbers to block (empty = all ports)                                            | string  | `""`                                         |
| PROTOCOLS              | Comma-separated protocols to filter: `tcp`, `udp`, or both                                          | string  | `tcp,udp`                                    |
| WAIT_DURATION          | Seconds to wait before running the next scenario in the same file                                    | number  | 300                                          |
| IMAGE                  | Network chaos injection workload image                                                               | string  | `quay.io/krkn-chaos/krkn-network-chaos:latest` |
| TAINTS                 | List of taints for which tolerations are created (e.g. `["node-role.kubernetes.io/master:NoSchedule"]`) | string | `[]`                                        |
| SERVICE_ACCOUNT        | Optional service account for the scenario workload                                                   | string  | `""`                                         |

**NOTE** In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`. For example:
```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:vmi-network-filter
```
