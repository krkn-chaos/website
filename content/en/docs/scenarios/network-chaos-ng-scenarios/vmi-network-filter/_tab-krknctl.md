```bash
krknctl run vmi-network-filter [--<parameter> <value>]
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### VMI Network Filter Parameters

| Argument            | Type    | Description                                                                                       | Required | Default Value                                |
|:--------------------|:--------|:--------------------------------------------------------------------------------------------------|:---------|:---------------------------------------------|
| `--chaos-duration`  | number  | Chaos duration in seconds                                                                         | false    | 120                                          |
| `--namespace`       | string  | Namespace containing the target VMIs                                                              | true     |                                              |
| `--target`          | string  | Regex to match VMI names (e.g. `<vmi-name-prefix>-.*` or `.*` for all)                                 | false    | `.*`                                         |
| `--label-selector`  | string  | Label selector to filter VMIs (e.g. `app=myapp`)                                                  | false    |                                              |
| `--instance-count`  | number  | Maximum number of VMIs to target                                                                  | false    | 1                                            |
| `--execution`       | enum    | Execution mode: `parallel` or `serial`                                                            | false    | serial                                       |
| `--ingress`         | boolean | Apply DROP rules to incoming traffic                                                              | false    | true                                         |
| `--egress`          | boolean | Apply DROP rules to outgoing traffic                                                              | false    | true                                         |
| `--interfaces`      | string  | Comma-separated tap interface names (empty to auto-detect)                                        | false    |                                              |
| `--ports`           | string  | Comma-separated port numbers to block (e.g. `53`, `22,443,6443`). Empty = all ports              | false    |                                              |
| `--protocols`       | string  | Protocols to filter: `tcp`, `udp`, or `tcp,udp`                                                  | false    | `tcp,udp`                                    |
| `--image`           | string  | Network chaos injection workload image                                                            | false    | quay.io/krkn-chaos/krkn-network-chaos:latest |
| `--taints`          | string  | Comma-separated taints for which tolerations are created (e.g. `node-role.kubernetes.io/master:NoSchedule`) | false |                                   |
| `--service-account` | string  | Optional service account for the scenario workload                                                | false    |                                              |
| `--wait-duration`   | number  | Seconds to wait before running the next scenario in the same file                                 | false    | 300                                          |

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
