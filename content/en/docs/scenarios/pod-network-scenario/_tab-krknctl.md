
```bash
krknctl run pod-network-chaos [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
{{< param-table scenario="pod-network-chaos" source="krknctl" prefix="--" >}}

#### Parameter Dependencies

- **`--ingress-ports` / `--egress-ports`:** When left empty, **all** ports are blocked for that traffic direction. Specify port numbers to restrict the filter to only those ports.
- **`--wait-duration`:** Must be at least 2× `--test-duration` to allow the network to stabilize before verification.

To see all available scenario options 
```bash
krknctl run pod-network-chaos --help
```