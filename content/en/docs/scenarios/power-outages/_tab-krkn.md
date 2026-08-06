Power Outage/ Cluster shut down scenario can be injected by placing the shut_down config file under cluster_shut_down_scenario option in the kraken config. Refer to [cluster_shut_down_scenario](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/cluster_shut_down_scenario.yml) config file.

Example scenario file: [cluster_shut_down_scenario.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/cluster_shut_down_scenario.yml)

Refer to [cloud setup](/docs/scenarios/cloud_setup.md) to configure your cli properly for the cloud provider of the cluster you want to shut down.

Current accepted cloud types:
* [Azure](/docs/scenarios/cloud_setup.md#azure)
* [GCP](/docs/scenarios/cloud_setup.md#gcp)
* [AWS](/docs/scenarios/cloud_setup.md#aws)
* [Openstack](/docs/scenarios/cloud_setup.md#openstack)


```yaml
cluster_shut_down_scenario:                          # Scenario to stop all the nodes for specified duration and restart the nodes.
  runs: 1                                            # Number of times to execute the cluster_shut_down scenario.
  shut_down_duration: 120                            # Duration in seconds to shut down the cluster.
  cloud_type: aws                                    # Cloud type on which Kubernetes/OpenShift runs.
```

### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - cluster_shut_down_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - cluster_shut_down_scenarios:
            - scenarios/power-outage-1.yaml
            - scenarios/power-outage-2.yaml
            - scenarios/power-outage-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - cluster_shut_down_scenarios:
            - scenarios/power-outage.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - cluster_shut_down_scenarios:  # Same type can appear multiple times
            - scenarios/power-outage-2.yaml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
