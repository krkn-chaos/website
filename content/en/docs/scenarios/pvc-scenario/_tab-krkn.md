Example scenario file: [pvc_scenario.yaml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/pvc_scenario.yaml)

##### Sample scenario config
```bash
pvc_scenario:
  pvc_name: <pvc_name>          # Name of the target PVC.
  pod_name: <pod_name>          # Name of the pod where the PVC is mounted. It will be ignored if the pvc_name is defined.
  namespace: <namespace_name>   # Namespace where the PVC is.
  fill_percentage: 50           # Target percentage to fill up the cluster. Value must be higher than current percentage. Valid values are between 0 and 99.
  duration: 60                  # Duration in seconds for the fault.
```

##### Steps
 - Get the pod name where the PVC is mounted.
 - Get the volume name mounted in the container pod.
 - Get the container name where the PVC is mounted.
 - Get the mount path where the PVC is mounted in the pod.
 - Get the PVC capacity and current used capacity.
 - Calculate file size to fill the PVC to the target fill_percentage.
 - Connect to the pod.
 - Create a temp file `kraken.tmp` with random data on the mount path:
    - `dd bs=1024 count=$file_size </dev/urandom > /mount_path/kraken.tmp`
 - Wait for the duration time.
 - Remove the temp file created:
    - `rm kraken.tmp`

### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - pvc_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - pvc_scenarios:
            - scenarios/pvc-fill-1.yaml
            - scenarios/pvc-fill-2.yaml
            - scenarios/pvc-fill-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - pvc_scenarios:
            - scenarios/pvc-fill.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - container_scenarios:
            - scenarios/container-kill.yaml
        - pvc_scenarios:  # Same type can appear multiple times
            - scenarios/pvc-fill-2.yaml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
