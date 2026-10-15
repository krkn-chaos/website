```bash
krknctl run vmi-network-filter [--<parameter> <value>]
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### VMI Network Filter Parameters

{{< param-table scenario="vmi-network-filter" source="krknctl" prefix="--" >}}

### Parameter Format Details

**VMI Selection:**
- `--namespace`: required; supports regex to match multiple namespaces (e.g. `virt-density-.*`)
- `--target`: regex matched against VMI names (e.g. `<vmi-name-prefix>-.*` targets all VMIs whose name starts with that prefix)
- Use `--instance-count` to limit how many matching VMIs are targeted

**Port and Protocol Format:**
- `--ports`: comma-separated integers, no spaces (e.g. `53` or `22,443,6443`). Omit to block all ports
- `--protocols`: `tcp`, `udp`, or `tcp,udp`. Defaults to both

**Interface Detection:**
- Leave `--interfaces` empty to let the scenario auto-detect the tap device inside the virt-launcher network namespace
- Specify explicitly (e.g. `tap0`) only if auto-detection fails

### Example Commands

**DNS blackout (most impactful cascading failure):**
```bash
krknctl run vmi-network-filter \
  --namespace <namespace> \
  --target ".*" \
  --ports 53 \
  --protocols tcp,udp \
  --ingress true \
  --egress true \
  --chaos-duration 120
```

**Full network isolation:**
```bash
krknctl run vmi-network-filter \
  --namespace <namespace> \
  --target "<vmi-name>" \
  --ingress true \
  --egress true \
  --chaos-duration 60
```

**Management plane loss (SSH + API):**
```bash
krknctl run vmi-network-filter \
  --namespace <namespace> \
  --target "<vmi-name-prefix>-.*" \
  --instance-count 2 \
  --ports 22,443,6443 \
  --protocols tcp \
  --ingress true \
  --egress true \
  --chaos-duration 300
```

**Application layer only (HTTP/HTTPS):**
```bash
krknctl run vmi-network-filter \
  --namespace <namespace> \
  --target ".*" \
  --execution parallel \
  --ports 80,443,8080,8443 \
  --protocols tcp \
  --ingress true \
  --egress true \
  --chaos-duration 180
```
