Example scenario files from [scenarios-hub](https://github.com/krkn-chaos/scenarios-hub):
- [regex_namespace.yaml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/regex_namespace.yaml)
- [ingress_namespace.yaml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/ingress_namespace.yaml)

## Configuration Options:

**namespace:** Specific namespace or regex style namespace of what you want to delete. Gets all namespaces if not specified; set to "" if you want to use the label_selector field.

Set to '^.*$' and label_selector to "" to randomly select any namespace in your cluster.

**label_selector:** Label on the namespace you want to delete. Set to "" if you are using the namespace variable.

**delete_count:** Number of namespaces to kill in each run. Based on matching namespace and label specified, default is 1.

**runs:** Number of runs/iterations to kill namespaces, default is 1.

**sleep:** Number of seconds to wait between each iteration/count of killing namespaces. Defaults to 10 seconds if not set

Refer to [namespace_scenarios_example](https://github.com/krkn-chaos/krkn/blob/main/scenarios/regex_namespace.yaml) config file.

```yaml
scenarios:
- namespace: "^.*$"
  runs: 1
- namespace: "^.*ingress.*$"
  runs: 1
  sleep: 15
```


### Steps

This scenario will select a namespace (or multiple) dependent on the configuration and will kill all of the below object types in that namespace and will wait for them to be Running in the post action 
1. Services 
2. Daemonsets
3. Statefulsets
4. Replicasets
5. Deployments 


### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    .. 
    chaos_scenarios:
        - service_disruption_scenarios:
            - scenarios/<scenario_name>.yaml
```
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
