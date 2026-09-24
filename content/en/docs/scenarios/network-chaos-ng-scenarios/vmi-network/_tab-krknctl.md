```bash
krknctl run vmi-network [--<parameter> <value>]
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### VMI Network Chaos Parameters

{{< param-table scenario="vmi-network" source="krknctl" prefix="--" >}}

### Parameter Format Details

**VMI Selection:**
- `--namespace`: required; supports regex to match multiple namespaces (e.g. `virt-density-.*`)
- `--target`: regex matched against VMI names (e.g. `<vmi-name-prefix>-.*` targets all VMIs whose name starts with that prefix)
- `--label-selector`: Kubernetes label selector in `key=value` format
- Use `--instance-count` to limit how many matching VMIs are targeted

**Traffic Shaping Values:**
- `--latency`: any value accepted by Linux `tc netem delay` (e.g. `100ms`, `1s`, `500ms`)
- `--loss`: integer percentage without the `%` symbol (e.g. `10` = 10%)
- `--bandwidth`: any value accepted by Linux `tc` HTB rate (e.g. `100mbit`, `1gbit`, `500kbit`)
- At least one of `--latency`, `--loss`, or `--bandwidth` should be set

**Interface Detection:**
- Leave `--interfaces` empty to let the scenario auto-detect the tap device inside the virt-launcher network namespace
- Specify explicitly (e.g. `tap0`) only if auto-detection fails or you want to target a specific interface

### Example Commands

**Add latency and packet loss to all VMIs in a namespace:**
```bash
krknctl run vmi-network \
  --namespace <namespace> \
  --target ".*" \
  --latency 100ms \
  --loss 10 \
  --chaos-duration 120
```

**Bandwidth cap on a specific VMI:**
```bash
krknctl run vmi-network \
  --namespace <namespace> \
  --target "<vmi-name>" \
  --bandwidth 1mbit \
  --ingress true \
  --egress true \
  --chaos-duration 300
```

**Catastrophic combined degradation:**
```bash
krknctl run vmi-network \
  --namespace <namespace> \
  --target "<vmi-name-prefix>-.*" \
  --instance-count 3 \
  --execution parallel \
  --latency 2000ms \
  --loss 50 \
  --bandwidth 1mbit \
  --chaos-duration 180
```

**DNS blackout simulation (high latency, no packet drop):**
```bash
krknctl run vmi-network \
  --namespace <namespace> \
  --target ".*" \
  --latency 5000ms \
  --chaos-duration 60
```
