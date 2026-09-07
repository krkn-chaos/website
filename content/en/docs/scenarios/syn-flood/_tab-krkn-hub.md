### Syn Flood scenario
This scenario simulates a user-defined surge of TCP SYN requests directed at one or more services deployed within the cluster or an external target reachable by the cluster.
For more details, please refer to the following [documentation](https://github.com/krkn-chaos/krkn-hub/blob/main/docs/syn-flood.md).

#### Run
If enabling [Cerberus](https://github.com/krkn-chaos/krkn#kraken-scenario-passfail-criteria-and-report) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](https://github.com/krkn-chaos/krkn-hub/tree/main/docs/cerberus.md). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> \
  --net=host \
  --pull=always \
  --env-host=true \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -e TARGET_PORT=<target_port> \
  -e NAMESPACE=<target_namespace> \
  -e TOTAL_CHAOS_DURATION=<duration> \
  -e TARGET_SERVICE=<target_service> \
  -e NUMBER_OF_PODS=10 \
  -e NODE_SELECTORS=<key>=<value>;<key>=<othervalue> \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:syn-flood

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
  -e TARGET_PORT=<target_port> \
  -e NAMESPACE=<target_namespace> \
  -e TOTAL_CHAOS_DURATION=<duration> \
  -e TARGET_SERVICE=<target_service> \
  -e NUMBER_OF_PODS=10 \
  -e NODE_SELECTORS=<key>=<value>;<key>=<othervalue> \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:syn-flood

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
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:<scenario>
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


{{< param-table scenario="syn-flood" source="krkn-hub" >}}

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
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:syn-flood
```
