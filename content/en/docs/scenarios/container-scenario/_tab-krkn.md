
Example scenario files from [scenarios-hub](https://github.com/krkn-chaos/scenarios-hub):
- [container_dns.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/kubernetes/container_dns.yml)
- [container_etcd.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/container_etcd.yml)

####  Example Config
The following are the components of Kubernetes for which a basic chaos scenario config exists today.

```yaml
scenarios:
- name: "<name of scenario>"
  namespace: "<specific namespace>" # can specify "*" if you want to find in all namespaces
  label_selector: "<label of pod(s)>"
  container_name: "<specific container name>"  # This is optional, can take out and will kill all containers in all pods found under namespace and label
  pod_names:  # This is optional, can take out and will select all pods with given namespace and label
  - <pod_name>
  exclude_label: "<label to exclude pods from chaos>" # Optional: pods matching this label will be excluded from disruption
  count: <number of containers to disrupt, default=1>
  action: <kill signal to run. For example 1 ( hang up ) or 9. Default is set to 1>
  expected_recovery_time: <number of seconds to wait for container to be running again> (defaults to 60seconds)
```


## How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - container_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - container_scenarios:
            - scenarios/container-kill-1.yaml
            - scenarios/container-kill-2.yaml
            - scenarios/container-kill-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - container_scenarios:
            - scenarios/container-kill.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - container_scenarios:  # Same type can appear multiple times
            - scenarios/container-kill-2.yaml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
