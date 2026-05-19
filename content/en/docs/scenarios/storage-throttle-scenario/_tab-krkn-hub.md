### Storage Throttle scenario
This scenario applies storage I/O limits (IOPS and/or bandwidth) on a PVC-backed workload by using Linux cgroup controls through a privileged helper pod on the target node.

#### Run
If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> \
  --net=host \
  --pull=always \
  --env-host=true \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -e PVC_NAME=<target_pvc_name> \
  -e NAMESPACE=<target_namespace> \
  -e THROTTLE_TYPE=bandwidth \
  -e READ_BPS=1Mi \
  -e WRITE_BPS=512Ki \
  -e DURATION=1m \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:storage-throttle

$ podman logs -f <container_name or container_id>

$ podman inspect <container-name or container-id> \
  --format "{{.State.ExitCode}}"
```

{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines.
Without the --env-host option you'll have to set each environment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}

```bash
$ docker run $(./get_docker_params.sh) \
  --name=<container_name> \
  --net=host \
  --pull=always \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -e PVC_NAME=<target_pvc_name> \
  -e NAMESPACE=<target_namespace> \
  -e THROTTLE_TYPE=bandwidth \
  -e READ_BPS=1Mi \
  -e WRITE_BPS=512Ki \
  -e DURATION=1m \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:storage-throttle

$ docker logs -f <container_name or container_id>

$ docker inspect <container-name or container-id> \
  --format "{{.State.ExitCode}}"
```

**TIP**: Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:

```bash
kubectl config view --flatten > ~/kubeconfig && \
chmod 444 ~/kubeconfig && \
docker run $(./get_docker_params.sh) \
  --name=<container_name> \
  --net=host \
  --pull=always \
  -v ~/kubeconfig:/home/krkn/.kube/config:Z \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:storage-throttle
```

#### Supported parameters

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

Example if --env-host is used:
```bash
export <parameter_name>=<value>
```
OR on the command line like example:

```bash
-e <VARIABLE>=<value>
```

See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

| Parameter | Description | Type | Default |
| --------- | ----------- | ---- | ------- |
| `PVC_NAME` | Target PVC name. If set, `POD_NAME` is auto-resolved from PVC | string | |
| `POD_NAME` | Target pod name. Ignored if `PVC_NAME` is set | string | |
| `NAMESPACE` | Namespace of the target pod/PVC | string | `default` |
| `MOUNT_PATH` | Specific mount path to throttle (absolute path, example: `/data`) | string | |
| `THROTTLE_TYPE` | Throttle mode to apply (`bandwidth`, `iops`, `both`) | string | `bandwidth` |
| `READ_IOPS` | Maximum read IOPS (used for `iops`/`both`) | number | `100` |
| `WRITE_IOPS` | Maximum write IOPS (used for `iops`/`both`) | number | `50` |
| `READ_BPS` | Maximum read bytes/sec (example: `1Mi`, `512Ki`, `1000000`) | string | `1Mi` |
| `WRITE_BPS` | Maximum write bytes/sec (example: `512Ki`, `1Mi`, `500000`) | string | `512Ki` |
| `DURATION` | Duration to hold throttling (example: `30s`, `1m`, `120`) | string | `1m` |
| `IMAGE` | Image used for privileged helper pod that writes cgroup values | string | `quay.io/krkn-chaos/krkn:tools` |

#### Parameter dependencies

- At least one of `PVC_NAME` or `POD_NAME` should be set.
- If both are set, `PVC_NAME` takes precedence and `POD_NAME` is ignored.

**NOTE** In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`. For example:
```bash
$ podman run \
  --name=<container_name> \
  --net=host \
  --pull=always \
  --env-host=true \
  -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml \
  -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:storage-throttle
```
