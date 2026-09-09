
```bash
krknctl run kubevirt-outage [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:  (be sure to scroll to right)
{{< param-table scenario="kubevirt-outage" source="krknctl" prefix="--" >}}

#### Behavior Notes

- **VM recovery:** After krkn deletes the VM, the KubeVirt controller automatically recreates the VMI unless `runStrategy` is set to `Manual`. The `--timeout` parameter controls how long krkn waits for the VM to come back before reporting failure.

To see all available scenario options 
```bash
krknctl run kubevirt-outage --help
```