
```bash
krknctl run node-scenarios [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:  (be sure to scroll to right)
{{< param-table scenario="node-scenarios" source="krknctl" prefix="--" >}}

NOTE: The secret string types will be masked when scenario is ran

#### Parameter Dependencies

- **`--node-name` vs `--label-selector`:** When `--node-name` is set, `--label-selector` is ignored. The scenario targets the named node(s) directly.
- **`--instance-count`:** Only applies when using `--label-selector`. It limits how many of the matched nodes are targeted.
- **Cloud credentials:** The `--vsphere-*`, `--aws-*`, `--bmc-*`, `--ibmc-*`, `--azure-*`, and `--gcp-*` parameters are only required for their respective `--cloud-type` value. For example, `--aws-access-key-id` is only needed when `--cloud-type` is `aws`.

To see all available scenario options 
```bash
krknctl run node-scenarios --help
```