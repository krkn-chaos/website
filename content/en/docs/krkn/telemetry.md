---
title: Telemetry
description: Telemetry run details of the cluster and scenario
weight: 2
---

### Telemetry Details

We wanted to gather some more insights regarding our Krkn runs that could have been post processed (eg. by a ML model) to have a better understanding about the behavior of the clusters hit by krkn, so we decided to include this as an opt-in feature that, based on the platform (Kubernetes/OCP), is able to gather different type of data and metadata in the time frame of each chaos run. 
The telemetry service is currently able to gather several scenario and cluster metadata:
A json named telemetry.json containing:
- Chaos run metadata:
  - the duration of the chaos run
  -  the config parameters with which the scenario has been setup
  - any recovery time details (applicable to pod scenarios and node scenarios only)
  - the exit status of the chaos run
- Cluster metadata:
  - Node metadata (architecture, cloud instance type etc.)
  - Node counts 
  - Number and type of objects deployed in the cluster
  - Network plugins
  - Cluster version
- A partial/full backup of the prometheus binary logs (currently available on OCP only)
- Any firing critical alerts on the cluster

This telemetry JSON is printed at the end of every krkn run and can optionally be stored long-term in Elasticsearch. See [Elasticsearch Storage](elastic.md) for details on storing and querying telemetry, metrics, and alerts.

### Deploy your own telemetry AWS service 
The *krkn-telemetry* project aims to provide a basic, but fully working example on how to deploy your own Krkn telemetry collection API. We currently do not support the telemetry collection as a service for community users and we discourage to handover your infrastructure telemetry metadata to third parties since may contain confidential infos.

The guide below will explain how to deploy the service automatically as an AWS lambda function, but you can easily deploy it as a flask application in a VM or in any python runtime environment. Then you can use it to store data to use in chaos-ai

https://github.com/krkn-chaos/krkn-telemetry


#### Sample telemetry config
```yaml
telemetry:
    enabled: False                                           # enable/disables the telemetry collection feature
    api_url: https://ulnmf9xv7j.execute-api.us-west-2.amazonaws.com/production #telemetry service endpoint
    username: username                                      # telemetry service username
    password: password                                      # telemetry service password
    prometheus_backup: True                                 # enables/disables prometheus data collection
    full_prometheus_backup: False                           # if is set to False only the /prometheus/wal folder will be downloaded.
    backup_threads: 5                                       # number of telemetry download/upload threads
    archive_path: /tmp                                      # local path where the archive files will be temporarly stored
    max_retries: 0                                          # maximum number of upload retries (if 0 will retry forever)
    run_tag: ''                                             # if set, this will be appended to the run folder in the bucket (useful to group the runs)
    archive_size: 500000                                     # the size of the prometheus data archive size in KB. The lower the size of archive is
                                                            # the higher the number of archive files will be produced and uploaded (and processed by backup_threads
                                                            # simultaneously).
                                                            # For unstable/slow connection is better to keep this value low
                                                            # increasing the number of backup_threads, in this way, on upload failure, the retry will happen only on the
                                                            # failed chunk without affecting the whole upload.
    logs_backup: True
    logs_filter_patterns:
     - "(\\w{3}\\s\\d{1,2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d+).+"         # Sep 9 11:20:36.123425532
     - "kinit (\\d+/\\d+/\\d+\\s\\d{2}:\\d{2}:\\d{2})\\s+"          # kinit 2023/09/15 11:20:36 log
     - "(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z).+"      # 2023-09-15T11:20:36.123425532Z log
    oc_cli_path: /usr/bin/oc                                # optional, if not specified will be search in $PATH
```
#### Sample output of telemetry
```json
{
    "telemetry": {
        "scenarios": [
            {
                "start_timestamp": 1745343338,
                "end_timestamp": 1745343683,
                "scenario": "scenarios/network_chaos.yaml",
                "scenario_type": "pod_disruption_scenarios",
                "exit_status": 0,
                "parameters_base64": "",
                "parameters": [
                    {
                        "config": {
                            "execution_type": "parallel",
                            "instance_count": 1,
                            "kubeconfig_path": "/root/.kube/config",
                            "label_selector": "node-role.kubernetes.io/master",
                            "network_params": {
                                "bandwidth": "10mbit",
                                "latency": "500ms",
                                "loss": "50%"
                            },
                            "node_interface_name": null,
                            "test_duration": 300,
                            "wait_duration": 60
                        },
                        "id": "network_chaos"
                    }
                ],
                "affected_pods": {
                    "recovered": [],
                    "unrecovered": [],
                    "error": null
                },
                "affected_nodes": [],
                "cluster_events": []
            }
        ],
        "node_summary_infos": [
            {
                "count": 3,
                "architecture": "amd64",
                "instance_type": "n2-standard-4",
                "nodes_type": "master",
                "kernel_version": "5.14.0-427.60.1.el9_4.x86_64",
                "kubelet_version": "v1.31.6",
                "os_version": "Red Hat Enterprise Linux CoreOS 418.94.202503121207-0"
            },
            {
                "count": 3,
                "architecture": "amd64",
                "instance_type": "n2-standard-4",
                "nodes_type": "worker",
                "kernel_version": "5.14.0-427.60.1.el9_4.x86_64",
                "kubelet_version": "v1.31.6",
                "os_version": "Red Hat Enterprise Linux CoreOS 418.94.202503121207-0"
            }
        ],
        "node_taints": [
            {
                "node_name": "prubenda-g-qdcvv-master-0.c.chaos-438115.internal",
                "effect": "NoSchedule",
                "key": "node-role.kubernetes.io/master",
                "value": null
            },
            {
                "node_name": "prubenda-g-qdcvv-master-1.c.chaos-438115.internal",
                "effect": "NoSchedule",
                "key": "node-role.kubernetes.io/master",
                "value": null
            },
            {
                "node_name": "prubenda-g-qdcvv-master-2.c.chaos-438115.internal",
                "effect": "NoSchedule",
                "key": "node-role.kubernetes.io/master",
                "value": null
            }
        ],
        "kubernetes_objects_count": {
            "ConfigMap": 530,
            "Pod": 294,
            "Deployment": 69,
            "Route": 8,
            "Build": 1
        },
        "network_plugins": [
            "OVNKubernetes"
        ],
        "timestamp": "2025-04-22T17:35:37Z",
        "health_checks": null,
        "total_node_count": 6,
        "cloud_infrastructure": "GCP",
        "cloud_type": "self-managed",
        "cluster_version": "4.18.0-0.nightly-2025-03-13-035622",
        "major_version": "4.18",
        "run_uuid": "96348571-0b06-459e-b654-a1bb6fd66239",
        "job_status": true
    },
    "critical_alerts": null
}
```

### Telemetry Output Field Reference

#### Top-level fields

| Field | Type | Description |
|---|---|---|
| `run_uuid` | string | Unique identifier for this krkn run, used to correlate records across indices in Elasticsearch |
| `timestamp` | string (ISO 8601) | Time when the telemetry was captured at the end of the run |
| `job_status` | bool | Overall pass/fail of the run (`true` = passed) |
| `cloud_infrastructure` | string | Cloud provider detected (e.g. `GCP`, `AWS`, `Azure`, `baremetal`) |
| `cloud_type` | string | Whether the cluster is `self-managed` or a managed cloud service |
| `cluster_version` | string | Full cluster version string (OCP nightly build or Kubernetes version) |
| `major_version` | string | Major.minor version extracted from `cluster_version` (e.g. `4.18`) |
| `total_node_count` | int | Total number of nodes in the cluster at the time of the run |
| `network_plugins` | list | CNI plugins active on the cluster (e.g. `OVNKubernetes`) |
| `kubernetes_objects_count` | map | Count of each Kubernetes resource type present cluster-wide (e.g. `Pod`, `Deployment`, `ConfigMap`) |
| `critical_alerts` | list or null | Any critical Prometheus alerts firing at the end of the run; `null` if none |
| `health_checks` | list or null | Results of URL health checks if configured — see [Health Checks](health-checks.md) |

#### `scenarios[]` — one entry per scenario executed

| Field | Type | Description |
|---|---|---|
| `scenario` | string | Path to the scenario config file that was run |
| `scenario_type` | string | Category of scenario (e.g. `pod_disruption_scenarios`, `node_scenarios`) |
| `start_timestamp` | float | Unix epoch when the scenario started |
| `end_timestamp` | float | Unix epoch when the scenario finished |
| `exit_status` | int | `0` = scenario passed; non-zero = scenario failed |
| `parameters` | list | Scenario configuration parameters as parsed from the config file |
| `parameters_base64` | string | Base64-encoded copy of raw parameters (for lossless round-tripping) |
| `affected_pods` | object | Pods disrupted during the scenario, split into `recovered` and `unrecovered` lists with per-pod timing |
| `affected_nodes` | list | Nodes disrupted during the scenario with timing details (not_ready, ready, stopped, running, terminating durations) |
| `cluster_events` | list | Kubernetes events captured during the scenario window |

##### `affected_pods.recovered[]` / `affected_pods.unrecovered[]`

| Field | Type | Description |
|---|---|---|
| `pod_name` | string | Name of the affected pod |
| `namespace` | string | Namespace the pod belongs to |
| `total_recovery_time` | float | Seconds from disruption to pod being ready again |
| `pod_readiness_time` | float | Seconds for the pod to pass its readiness probe after rescheduling |
| `pod_rescheduling_time` | float | Seconds for the pod to be rescheduled onto a node |

##### `affected_nodes[]`

| Field | Type | Description |
|---|---|---|
| `node_name` | string | Kubernetes node name |
| `node_id` | string | Cloud provider instance ID |
| `not_ready_time` | float | Seconds the node spent in NotReady state |
| `ready_time` | float | Seconds the node spent in Ready state after recovery |
| `stopped_time` | float | Seconds the node was stopped (cloud stop/start scenarios) |
| `running_time` | float | Seconds the node was running after restart |
| `terminating_time` | float | Seconds the node spent terminating |

#### `node_summary_infos[]` — one entry per node role/type group

| Field | Type | Description |
|---|---|---|
| `count` | int | Number of nodes in this group |
| `nodes_type` | string | Node role (e.g. `master`, `worker`) |
| `architecture` | string | CPU architecture (e.g. `amd64`, `arm64`) |
| `instance_type` | string | Cloud instance type (e.g. `n2-standard-4`, `m5.xlarge`) |
| `kernel_version` | string | Linux kernel version running on these nodes |
| `kubelet_version` | string | Kubelet version (e.g. `v1.31.6`) |
| `os_version` | string | Full OS version string (e.g. RHCOS build identifier) |

#### `node_taints[]` — one entry per node taint

| Field | Type | Description |
|---|---|---|
| `node_name` | string | Full hostname of the tainted node |
| `key` | string | Taint key (e.g. `node-role.kubernetes.io/master`) |
| `value` | string or null | Taint value; `null` if the taint has no value |
| `effect` | string | Taint effect: `NoSchedule`, `NoExecute`, or `PreferNoSchedule` |