---
title: Node Scenarios on Bare Metal using Krkn-Hub
description: >
date: 2017-01-05
weight: 2
---

### Node Scenarios Bare Metal
This scenario disrupts the node(s) matching the label on a bare metal Kubernetes/OpenShift cluster. Actions/disruptions supported are listed [here](https://github.com/krkn-chaos/krkn/blob/master/docs/node_scenarios.md)

#### Run
Unlike other krkn-hub scenarios, this one requires a specific configuration due to its unique structure. 
You must set up the scenario in a local file following the [scenario syntax](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/baremetal_node_scenarios.yml), and then pass this file's base64-encoded content to the container via the SCENARIO_BASE64 variable.

If enabling Cerberus to monitor the cluster and pass/fail the scenario post chaos, refer [docs](https://krkn-chaos.dev/docs/cerberus/installation/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --pull=always \
    -env-host=true \
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
$ docker run \
     -e SCENARIO_BASE64="$(base64 -w0 <scenario_file>)" \
     --net=host --pull=always -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:node-scenarios-bm

$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```

**TIP**: Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host --pull=always -v ~kubeconfig:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:<scenario>```

#### Supported parameters
See list of variables that apply to all scenarios [here](../all-scenario-env.md) that can be used/set in addition to these scenario specific variables

#### Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/ANZY7HhPdWTNaWt4xMFanF6Q5.js" id="asciicast-ANZY7HhPdWTNaWt4xMFanF6Q5" async="true" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;"></script>

**NOTE** In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`. For example:
