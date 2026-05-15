
#### Run

Unlike other krkn-hub scenarios, baremetal node scenarios require a base64-encoded scenario file rather than per-parameter env vars. Author your scenario locally following the [scenario syntax](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/baremetal_node_scenarios.yml), then pass it to the container via `SCENARIO_BASE64`.

If enabling Cerberus to monitor the cluster and pass/fail the scenario post chaos, refer [docs](../../../cerberus/installation.md). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` for the chaos injection container to auto-connect.

```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true \
    -e SCENARIO_BASE64="$(base64 -w0 <scenario_file>)" \
    -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-scenarios-bm
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always \
    -e SCENARIO_BASE64="$(base64 -w0 <scenario_file>)" \
    -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-scenarios-bm
OR
$ docker run -e SCENARIO_BASE64="$(base64 -w0 <scenario_file>)" \
    --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-scenarios-bm
$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

**TIP**: Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container:
```bash
kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -e SCENARIO_BASE64="$(base64 -w0 <scenario_file>)" -v ~/kubeconfig:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-scenarios-bm
```

#### Supported parameters

See list of variables that apply to all scenarios [here](../../all-scenario-env.md) that can be used/set in addition to these scenario-specific variables.

| Parameter        | Description                                                                                                                  | Type   | Default | Required |
|------------------|------------------------------------------------------------------------------------------------------------------------------|--------|---------|----------|
| SCENARIO_BASE64  | Base64-encoded contents of a baremetal node scenario YAML (`base64 -w0 baremetal_node_scenarios.yml`)                        | string |         | **Yes**  |
| KRKN_DEBUG       | When set to `True`, prints the decoded scenario and config files before running and enables `--debug True`                   | bool   | `False` | No       |

The contents of `SCENARIO_BASE64` are validated against the [node-scenarios-bm JSON schema](https://github.com/krkn-chaos/krkn-hub/blob/main/node-scenarios-bm/config-schema.json) before Krkn starts — invalid scenarios fail fast with a schema error.

**NOTE** In case of using a custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics/alerts files from the host under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`:
```bash
$ podman run --name=<container_name> --net=host --pull=always --env-host=true \
    -e SCENARIO_BASE64="$(base64 -w0 <scenario_file>)" \
    -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml \
    -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts \
    -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-scenarios-bm
```
