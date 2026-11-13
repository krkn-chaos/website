Configure the scenario in `config.yaml` and include the scenario file in `chaos_scenarios`:

```yaml
kraken:
  chaos_scenarios:
    - vmi_pvc_fill_scenarios:
        - scenarios/kubevirt/vmi_pvc_fill.yaml
```

Set the parameters in `scenarios/kubevirt/vmi_pvc_fill.yaml`. For filesystem PVC mode, provide `pvc_name` or `pod_name`. For block PVC mode, provide `vmi_name`, `device_path`, and `identity_file`; make sure the guest trusts the matching public key.

The plugin is available in the Krkn repository under `krkn/scenario_plugins/vmi_pvc_fill`.
