### HTTP Load scenario
This scenario generates distributed HTTP load against one or more target endpoints using Vegeta load testing pods deployed inside the cluster.

#### Run
If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> \
  --net=host \
  --pull=always \
  --env-host=true \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -e TARGET_ENDPOINTS="GET https://myapp.example.com/health" \
  -e NAMESPACE=<target_namespace> \
  -e TOTAL_CHAOS_DURATION=30s \
  -e NUMBER_OF_PODS=2 \
  -e NODE_SELECTORS=<key>=<value>;<key>=<othervalue> \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:http-load

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
  -e TARGET_ENDPOINTS="GET https://myapp.example.com/health" \
  -e NAMESPACE=<target_namespace> \
  -e TOTAL_CHAOS_DURATION=30s \
  -e NUMBER_OF_PODS=2 \
  -e NODE_SELECTORS=<key>=<value>;<key>=<othervalue> \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:http-load

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
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:http-load
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


{{< param-table scenario="http-load" source="krkn-hub" >}}

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
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:http-load
```
