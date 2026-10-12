#### Example Config

Create the scenario file `scenarios/kube/gpu_device_plugin.yaml`:

```yaml
- id: gpu-device-plugin-disruption
  config:
    namespace_pattern: ^nvidia-gpu-operator$                 # GPU Operator namespace
    label_selector: app=nvidia-device-plugin-daemonset       # device plugin pods
    node_label_selector: nvidia.com/gpu.present=true         # only target GPU nodes
    kill: 1                                                  # pods to delete
    krkn_pod_recovery_time: 120                              # seconds to wait for recovery
```

See [Pod Scenarios](../pod-scenarios/) for all available options.

Then add it to the `chaos_scenarios` section of `config/config.yaml`:

```yaml
kraken:
  kubeconfig_path: ~/.kube/config
  chaos_scenarios:
    - pod_disruption_scenarios:
        - scenarios/kube/gpu_device_plugin.yaml
```

#### Run

```bash
python run_kraken.py --config config/config.yaml
```
