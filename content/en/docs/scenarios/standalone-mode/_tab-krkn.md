Add the scenario type and scenario file(s) to the `chaos_scenarios` section in your config file:
```yaml
kraken:
    execution_mode: standalone
    kubeconfig_path:
    chaos_scenarios:
        - node_scenarios:
            - scenarios/standalone/ssh_node_reboot.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/standalone/hog_cpu.yml
            - scenarios/standalone/hog_memory.yml
            - scenarios/standalone/hog_io.yml
```

You can also combine multiple different scenario types in the same config file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    execution_mode: standalone
    chaos_scenarios:
        - node_scenarios:
            - scenarios/standalone/ssh_node_reboot.yml
        - hog_scenarios:
            - scenarios/standalone/hog_cpu.yml
        - network_chaos_scenarios:
            - scenarios/standalone/network_chaos_latency.yml
        - standalone_disk_fill_scenarios:
            - scenarios/standalone/disk_fill.yml
        - node_scenarios:  # Same type can appear multiple times
            - scenarios/standalone/ssh_node_stop.yml
```
{{% /alert %}}

### Run

```bash
# Activate virtual environment
source venv/bin/activate

# Run with standalone config
python run_kraken.py --config config/config_standalone.yaml
```

{{% alert title="Note" %}}
When `execution_mode: standalone` is set, Kubernetes clients are not initialized. Only scenarios that support standalone mode (SSH-based chaos) will run. To use Kubernetes-based scenarios, use the default `execution_mode: kubernetes` with a valid `kubeconfig_path`.
{{% /alert %}}
