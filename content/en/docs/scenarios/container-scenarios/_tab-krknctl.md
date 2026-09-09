
```bash
krknctl run container-scenarios [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
{{< param-table scenario="container-scenarios" source="krknctl" prefix="--" >}}


#### Behavior Notes

- **Recovery monitoring:** After disrupting containers, krkn monitors for recovery up to `--expected-recovery-time` seconds. If any containers remain unrecovered after the timeout, the scenario reports failure.

To see all available scenario options 
```bash
krknctl run container-scenarios --help
```