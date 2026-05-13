Rolls back the chaos injected by a previous krkn run identified by the provided run UUID.

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run \
  --name=<container_name> \
  --net=host \
  --pull=always \
  --env-host=true \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:rollback
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> \
  --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines.
Without the --env-host option you will have to set each environment variable on the podman command line like `-e <VARIABLE>=<value>`
{{% /alert %}}

```bash
$ docker run $(./get_docker_params.sh) \
  --name=<container_name> \
  --net=host \
  --pull=always \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:rollback
$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> \
  --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

{{% alert title="Tip" %}} Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v ~/kubeconfig:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:rollback``` {{% /alert %}}

#### Supported parameters

The following environment variables can be set on the host running the container to configure the rollback:

Example if --env-host is used:
```bash
export <parameter_name>=<value>
```

OR on the command line:

```bash
-e <VARIABLE>=<value>
```

Parameter | Description | Type | Default
--------- | ----------- | ---- | -------
RUN_UUID | UUID of the krkn run to roll back. The container exits if this is not set. | string | ""

{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
