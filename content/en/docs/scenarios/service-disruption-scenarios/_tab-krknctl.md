
```bash
krknctl run service-disruption-scenarios [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
{{< param-table scenario="service-disruption-scenarios" source="krknctl" prefix="--" >}}


#### Behavior Notes

- **No automatic recovery:** After krkn deletes the services, they are **not** automatically recreated. Services will only come back if managed by a controller (e.g. Helm release, operator, or GitOps pipeline). Verify your recovery mechanism before running this scenario.

To see all available scenario options 
```bash
krknctl run service-disruption-scenarios --help
```