## krkn

The pod path provisioner scenario is available in krkn through the plugin-based scenario system.

### Scenario File

Example scenario file: [pod_path_provisioner.yml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kind/pod_path_provisioner.yml)

### Basic Usage

```yaml
- id: kill-path-provisioner
  config:
    namespace_pattern: "local-path-storage"
    label_selector: "app=local-path-provisioner"
    krkn_pod_recovery_time: 20
    kill: 1
```

### Configuration in config.yaml

Add to your main krkn config:

```yaml
kraken:
  chaos_scenarios:
    - pod_disruption_scenarios:
        - scenarios/kind/pod_path_provisioner.yml
```
