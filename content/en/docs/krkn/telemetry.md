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
- Any firing crtiical alerts on the cluster

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