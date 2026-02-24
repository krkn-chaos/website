Example scenario file: [time_scenarios_example.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/time_scenarios_example.yml)

### Configuration Options:

**action:** skew_time or skew_date.

**object_type:** pod or node.

**namespace:** namespace of the pods you want to skew. Needs to be set if setting a specific pod name.

**label_selector:** Label on the nodes or pods you want to skew.

**container_name:** Container name in pod you want to reset time on. If left blank it will randomly select one.

**object_name:** List of the names of pods or nodes you want to skew.

Refer to [time_scenarios_example](https://github.com/krkn-chaos/krkn/blob/main/scenarios/time_scenarios_example.yml) config file.

```yaml
time_scenarios:
  - action: skew_time
    object_type: pod
    object_name:
      - apiserver-868595fcbb-6qnsc
      - apiserver-868595fcbb-mb9j5
    namespace: openshift-apiserver
    container_name: openshift-apiserver
  - action: skew_date
    object_type: node
    label_selector: node-role.kubernetes.io/worker
```

### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    .. 
    chaos_scenarios:
        - time_scenarios:
            - scenarios/<scenario_name>.yaml
```
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
