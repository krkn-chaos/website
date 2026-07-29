Add the scenario type and scenario file(s) to the `chaos_scenarios` section in your `config/config.yaml`:

```yaml
kraken:
    chaos_scenarios:
        - vm_storage_chaos_scenarios:
            - scenarios/openshift/vm_storage_nfs_failover.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - vm_storage_chaos_scenarios:
            - scenarios/openshift/vm_storage_nfs_failover.yml
            - scenarios/openshift/vm_storage_io_burst.yml
```

You can also combine multiple different scenario types in the same config file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - vm_storage_chaos_scenarios:
            - scenarios/openshift/vm_storage_nfs_failover.yml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - vm_storage_chaos_scenarios:  # Same type can appear multiple times
            - scenarios/openshift/vm_storage_io_burst.yml
```
{{% /alert %}}

Run krkn:

```bash
python run_kraken.py --config config/config.yaml
```

{{% alert title="Tip" %}}For VMware migration validation, combine this scenario with the other steps in the [VMware Migration Validation](../vmware-migration-validation/) pack. Storage resilience (Step 3) is one of the most common failure modes after migration.{{% /alert %}}
