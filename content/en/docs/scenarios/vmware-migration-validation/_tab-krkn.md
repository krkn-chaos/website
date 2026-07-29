Run all 5 steps in sequence using a combined config:

```yaml
kraken:
    execution_mode: standalone
    kubeconfig_path: ~/.kube/config
    chaos_scenarios:
        - node_scenarios:
            - scenarios/vmware_migration_validation/01_reboot_all_vms.yml
        - network_chaos_scenarios:
            - scenarios/vmware_migration_validation/02_network_chaos.yml
        - vm_storage_chaos_scenarios:
            - scenarios/vmware_migration_validation/03_storage_stress.yml
        - hog_scenarios:
            - scenarios/vmware_migration_validation/04_host_cpu_stress.yml
        - vm_migration_chaos_scenarios:
            - scenarios/vmware_migration_validation/05_vm_migration_test.yml
```

```bash
python run_kraken.py --config config/config_vmware_validation.yaml
```

{{% alert title="Tip" %}}Run each step individually first to establish a baseline. Once each step passes in isolation, run the full sequence to test cumulative stress on the migrated environment.{{% /alert %}}
