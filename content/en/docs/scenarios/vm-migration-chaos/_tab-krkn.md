Add the scenario type and scenario file(s) to the `chaos_scenarios` section in your `config/config.yaml`:

```yaml
kraken:
    chaos_scenarios:
        - vm_migration_chaos_scenarios:
            - scenarios/openshift/vm_migration_network_disruption.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - vm_migration_chaos_scenarios:
            - scenarios/openshift/vm_migration_network_disruption.yml
            - scenarios/openshift/vm_migration_drain.yml
```

You can also combine multiple different scenario types in the same config file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - vm_migration_chaos_scenarios:
            - scenarios/openshift/vm_migration_network_disruption.yml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - vm_storage_chaos_scenarios:
            - scenarios/openshift/vm_storage_nfs_failover.yml
        - vm_migration_chaos_scenarios:  # Same type can appear multiple times
            - scenarios/openshift/vm_migration_drain.yml
```
{{% /alert %}}

Run krkn:

```bash
python run_kraken.py --config config/config.yaml
```

{{% alert title="Tip" %}}For comprehensive VMware migration validation, use this as Step 5 in the [VMware Migration Validation](../vmware-migration-validation/) pack. Live migration under stress is the most demanding test and should be run after the other steps pass.{{% /alert %}}
