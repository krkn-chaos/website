
#### Run

```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-interface-down
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-interface-down
OR
$ docker run -e <VARIABLE>=<value> --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-interface-down
$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

**TIP**: Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```bash
kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v ~kubeconfig:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:<scenario>
```


#### Supported parameters

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

ex.)
`export <parameter_name>=<value>`


See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

|  Parameter                    | Description                                                           | Default
|-------------------------------| -----------------------------------------------------------------     | ------------------------------------ |
| TOTAL_CHAOS_DURATION          | Duration in seconds to keep the interface(s) down                    | 60                                   |
| RECOVERY_TIME                 | Seconds to wait after bringing the interface(s) back up              | 0                                    |
| NODE_SELECTOR                 | Label selector to choose target nodes. If not specified, a schedulable node will be chosen at random | "node-role.kubernetes.io/worker=" |
| NODE_NAME                     | The node name to target (used when label selector is not set)        |                                      |
| INSTANCE_COUNT                | Restricts the number of nodes selected by the label selector         | 1                                    |
| EXECUTION                     | Execution mode for multiple nodes: `serial` or `parallel`            | serial                               |
| INTERFACES                    | Comma-separated list of interface names to bring down (e.g. `eth0` or `eth0,bond0`). Leave empty to auto-detect the default interface | "" |
| NAMESPACE                     | Namespace where the chaos workload pod will be deployed              | default                              |
| TAINTS                        | List of taints for which tolerations need to be created. Example: `["node-role.kubernetes.io/master:NoSchedule"]` | [] |


**NOTE** In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`. For example:
```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-interface-down
```
