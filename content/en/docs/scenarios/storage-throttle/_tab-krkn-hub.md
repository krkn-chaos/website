### Storage Throttle scenario
This scenario applies storage I/O limits (IOPS and/or bandwidth) on a PVC-backed workload by using Linux cgroup controls through a privileged helper pod on the target node.

To target a KubeVirt VMI, set `VMI_NAME` to its name. Add `PVC_NAME` to select one PVC when the VMI has multiple attached PVCs. For example, add these options to the container command:

```bash
-e VMI_NAME=my-vmi \
-e PVC_NAME=my-vmi-data
```

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

{{< param-table scenario="storage-throttle" source="krkn-hub" >}}

#### Parameter dependencies

- At least one of `VMI_NAME`, `PVC_NAME`, or `POD_NAME` should be set.
- `VMI_NAME` resolves the current virt-launcher pod. Use `PVC_NAME` to select a specific VMI PVC when needed; otherwise, `PVC_NAME` resolves an associated pod and overrides `POD_NAME`.

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
