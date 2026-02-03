---
title: Node Scenarios using Krkn-Hub
description: >
date: 2017-01-05
weight: 2
---
This scenario disrupts the node(s) matching the label on a Kubernetes/OpenShift cluster. Actions/disruptions supported are listed [here](/docs/scenarios/node-scenarios/_index.md)

#### Run
If enabling Cerberus to monitor the cluster and pass/fail the scenario post chaos, refer [docs](/docs/cerberus/). Make sure to start it before injecting the chaos and set `CERBERUS_ENABLED` environment variable for the chaos injection container to autoconnect.

```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-scenarios
$ podman logs -f <container_name or container_id> # Streams Kraken logs
$ podman inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Note" %}} --env-host: This option is not available with the remote Podman client, including Mac and Windows (excluding WSL2) machines. 
Without the --env-host option you'll have to set each environment variable on the podman command line like  `-e <VARIABLE>=<value>`
{{% /alert %}}

```bash
$ docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-scenarios
OR 
$ docker run -e <VARIABLE>=<value> --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-scenarios

$ docker logs -f <container_name or container_id> # Streams Kraken logs
$ docker inspect <container-name or container-id> --format "{{.State.ExitCode}}" # Outputs exit code which can considered as pass/fail for the scenario
```
{{% alert title="Tip" %}} Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands:
```kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v ~kubeconfig:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:<scenario>``` {{% /alert %}}


#### Supported parameters

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

Example if --env-host is used:
```
export <parameter_name>=<value>
```
OR on the command line like example: 

```
-e <VARIABLE>=<value> 
```

See list of variables that apply to all scenarios [here](../all-scenario-env.md) that can be used/set in addition to these scenario specific variables

Parameter               | Description                                                           | Default
----------------------- | -----------------------------------------------------------------     | ------------------------------------ |
ACTION                  | Action can be one of the [following](https://github.com/krkn-chaos/krkn/blob/master/docs/node_scenarios.md) | node_stop_start_scenario |
LABEL_SELECTOR          | Node label to target                                                  | node-role.kubernetes.io/worker       |
EXCLUDE_LABEL           | Nodes labeled with this value will be excluded from the chaos         |                                      |
NODE_NAME               | Node name to inject faults in case of targeting a specific node; Can set multiple node names separated by a comma      | ""                                   |
INSTANCE_COUNT          | Targeted instance count matching the label selector                   | 1                                    |
RUNS                    | Iterations to perform action on a single node                         | 1                                    |
CLOUD_TYPE              | Cloud platform on top of which cluster is running, supported platforms - aws, vmware, ibmcloud, ibmcloudpower, bm           | aws |
TIMEOUT                 | Duration to wait for completion of node scenario injection             | 180                                |
DURATION                | Duration to stop the node before running the start action - not supported for vmware and ibm cloud type             | 120                                |
KUBE_CHECK       | Connect to the kubernetes api to see if the node gets to a certain state during the node scenario   | False                               |
PARALLEL     | Run action on label or node name in parallel or sequential, set to true for parallel | False |
DISABLE_SSL_VERIFICATION     | Disable SSL verification, to avoid certificate errors | False |
BMC_USER                 | Only needed for Baremetal ( bm ) - IPMI/bmc username | "" | 
BMC_PASSWORD             | Only needed for Baremetal ( bm ) - IPMI/bmc password | "" |
BMC_ADDR                 | Only needed for Baremetal ( bm ) - IPMI/bmc username | "" |

{{% alert title="Note" %}}In case of using custom metrics profile or alerts profile when `CAPTURE_METRICS` or `ENABLE_ALERTS` is enabled, mount the metrics profile from the host on which the container is run using podman/docker under `/home/krkn/kraken/config/metrics-aggregated.yaml` and `/home/krkn/kraken/config/alerts`. {{% /alert %}}
 For example:
```bash
$ podman run --name=<container_name> --net=host --env-host=true -v <path-to-custom-metrics-profile>:/home/krkn/kraken/config/metrics-aggregated.yaml -v <path-to-custom-alerts-profile>:/home/krkn/kraken/config/alerts -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:node-scenarios 
```

The following environment variables need to be set for the scenarios that requires intereacting with the cloud platform API to perform the actions:

Amazon Web Services
```bash
$ export AWS_ACCESS_KEY_ID=<>
$ export AWS_SECRET_ACCESS_KEY=<>
$ export AWS_DEFAULT_REGION=<>
```

VMware Vsphere
```bash
$ export VSPHERE_IP=<vSphere_client_IP_address>

$ export VSPHERE_USERNAME=<vSphere_client_username>

$ export VSPHERE_PASSWORD=<vSphere_client_password>

```


Ibmcloud 
```bash
$ export IBMC_URL=https://<region>.iaas.cloud.ibm.com/v1

$ export IBMC_APIKEY=<ibmcloud_api_key>

```

Baremetal <br/>
Check [Bare Metal Documentation](node-scenarios-bm-krkn-hub.md)

Google Cloud Platform
```bash
$ export GOOGLE_APPLICATION_CREDENTIALS=<GCP Json>

```

Azure
```bash
$ export AZURE_TENANT_ID=<>
$ export AZURE_CLIENT_SECRET=<>
$ export AZURE_CLIENT_ID=<>

```

OpenStack

```bash
export OS_USERNAME=username
export OS_PASSWORD=password
export OS_TENANT_NAME=projectName
export OS_AUTH_URL=https://identityHost:portNumber/v2.0
export OS_TENANT_ID=tenantIDString
export OS_REGION_NAME=regionName
export OS_CACERT=/path/to/cacertFile
```

#### Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/ANZY7HhPdWTNaWt4xMFanF6Q5.js" id="asciicast-ANZY7HhPdWTNaWt4xMFanF6Q5" async="true" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;"></script>
