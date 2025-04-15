---
title: Power Outage Scenario using Krkn-Hub
description: >
date: 2017-01-05
weight: 4
---
This scenario shuts down Kubernetes/OpenShift cluster for the specified duration to simulate power outages, brings it back online and checks if it's healthy. More information can be found [here](/docs/scenarios/power-outage-scenarios/_index.md)

Right now power outage and cluster shutdown are one in the same. We originally created this scenario to stop all the nodes and then start them back up how a customer would shut their cluster down. 

In a real life chaos scenario though, we figured this scenario was close to if the power went out on the aws side so all of our ec2 nodes would be stopped/powered off.
We tried to look at if aws cli had a way to forcefully poweroff the nodes (not gracefully) and they don't currently support so this scenario is as close as we can get to "pulling the plug"

#### Run

If enabling [Cerberus](/docs/cerberus/) to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:power-outages
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines {{% /alert %}}


```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:power-outages
OR 
$ docker run -e <VARIABLE>=<value> --name=<container_name> --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:power-outages

$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Tip" %}} Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v ~kubeconfig:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:<scenario>``` {{% /alert %}}
#### Supported parameters

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

example:
`export <parameter_name>=<value>`

See list of variables that apply to all scenarios [here](/docs/scenarios/all-scenario-env.md) that can be used/set in addition to these scenario specific variables

Parameter               | Description                                                           | Default
----------------------- | -----------------------------------------------------------------     | ------------------------------------ |
SHUTDOWN_DURATION       | Duration in seconds to shut down the cluster                          | 1200                                 |
CLOUD_TYPE              | Cloud platform on top of which cluster is running, [supported cloud platforms](https://github.com/krkn-chaos/krkn/blob/master/docs/node_scenarios.md)                     | aws |
TIMEOUT                 | Time in seconds to wait for each node to be stopped or running after the cluster comes back | 600                                |


The following environment variables need to be set for the scenarios that requires intereacting with the cloud platform API to perform the actions:

Amazon Web Services
```bash
$ export AWS_ACCESS_KEY_ID=<>
$ export AWS_SECRET_ACCESS_KEY=<>
$ export AWS_DEFAULT_REGION=<>
```

Google Cloud Platform
```bash
TBD
```

Azure
```bash
TBD
```

OpenStack

```bash
TBD
```

Baremetal
```bash
TBD
```

{{% alert title="Note" %}} In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`.{{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:container-scenarios
```

#### Demo
You can find a link to a demo of the scenario [here](https://asciinema.org/a/r0zLbh70XK7gnc4s5v0ZzSXGo)