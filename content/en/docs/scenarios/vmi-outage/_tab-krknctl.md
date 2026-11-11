
```bash
krknctl run vmi-outage [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:  (be sure to scroll to right)
{{< param-table scenario="vmi-outage" source="krknctl" prefix="--" >}}

#### Behavior Notes

- **VM recovery:** After krkn deletes the VM, the KubeVirt controller automatically recreates the VMI unless `runStrategy` is set to `Manual`. The `--timeout` parameter controls how long krkn waits for the VM to come back before reporting failure.
- **Guest reachability MTTR (optional):** `--wait-for-guest-ping` polls after VMI `Running` until the guest answers ICMP ping (default) and records `guest_reachable_time`. Leave `--guest-ping-pod` empty for the ephemeral `NET_RAW` helper. Use `--guest-ping-method tcp` only when `NET_RAW` is unavailable.

To see all available scenario options 
```bash
krknctl run vmi-outage --help
```