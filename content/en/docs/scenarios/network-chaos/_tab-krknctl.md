
```bash
krknctl run network-chaos [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
{{< param-table scenario="network-chaos" source="krknctl" prefix="--" >}}


#### Parameter Dependencies

- **`--node-name`:** Egress only. Ignored when `--traffic-type` is `ingress`.
- **`--network-params` and `--target-node-interface`:** Ingress only. Ignored when `--traffic-type` is `egress`.
- **`--wait-duration`:** Must be at least 2× `--duration` to allow the network to stabilize before verification.

#### Behavior Notes

- **Empty `--interfaces`:** When left empty `[]`, krkn auto-detects the primary network interface on the target node using the default route. If specified, each interface is validated against the node's actual interfaces before applying chaos.

To see all available scenario options 
```bash
krknctl run network-chaos --help
```