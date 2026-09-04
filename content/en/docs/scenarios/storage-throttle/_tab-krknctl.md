```bash
krknctl run storage-throttle [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)

Scenario specific parameters:
{{< param-table scenario="storage-throttle" source="krknctl" prefix="--" >}}

#### Parameter dependencies

- At least one of `--pvc-name` or `--pod-name` should be set.
- If both are set, `--pvc-name` takes precedence and `--pod-name` is ignored.

To see all available scenario options
```bash
krknctl run storage-throttle --help
```
