```bash
krknctl run pod-scenarios [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:
{{< param-table scenario="pod-scenarios" source="krknctl" prefix="--" >}}

#### Behavior Notes

- **Recovery monitoring:** After disrupting pods, krkn monitors for recovery up to `--expected-recovery-time` seconds. If any pods remain unrecovered after the timeout, the scenario reports failure.

To see all available scenario options
```bash
krknctl run pod-scenarios --help
```
