
```bash
krknctl run application-outages [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
{{< param-table scenario="application-outages" source="krknctl" prefix="--" >}}

#### Behavior Notes

- **Empty `--pod-selector`:** When left empty, krkn creates a NetworkPolicy that targets **all pods** in the namespace, causing a namespace-wide outage.
- **Automatic cleanup:** After `--chaos-duration` expires, krkn automatically deletes the NetworkPolicy it created and traffic resumes. A rollback handler is also registered to ensure cleanup if the scenario fails unexpectedly.

To see all available scenario options 
```bash
krknctl run application-outages --help
```