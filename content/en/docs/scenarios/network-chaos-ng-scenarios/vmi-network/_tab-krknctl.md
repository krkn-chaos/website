```bash
krknctl run vmi-network-chaos [--<parameter> <value>]
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### VMI Network Chaos Parameters

| Argument            | Type    | Description                                                                                       | Required | Default Value                                |
|:--------------------|:--------|:--------------------------------------------------------------------------------------------------|:---------|:---------------------------------------------|
| `--chaos-duration`  | number  | Chaos duration in seconds                                                                         | false    | 120                                          |
| `--namespace`       | string  | Namespace containing the target VMIs                                                              | true     |                                              |
| `--target`          | string  | Regex to match VMI names (e.g. `<vmi-name-prefix>-.*` or `.*` for all)                                 | false    | `.*`                                         |
| `--label-selector`  | string  | Label selector to filter VMIs (e.g. `app=myapp`)                                                  | false    |                                              |
| `--instance-count`  | number  | Maximum number of VMIs to target                                                                  | false    | 1                                            |
| `--execution`       | enum    | Execution mode: `parallel` or `serial`                                                            | false    | serial                                       |
| `--ingress`         | boolean | Shape incoming traffic to the VM                                                                  | false    | true                                         |
| `--egress`          | boolean | Shape outgoing traffic from the VM                                                                | false    | true                                         |
| `--interfaces`      | string  | Comma-separated tap interface names (empty to auto-detect)                                        | false    |                                              |
| `--latency`         | string  | Artificial latency added to packets (e.g. `100ms`, `500ms`)                                      | false    |                                              |
| `--loss`            | string  | Packet loss percentage (e.g. `10` for 10%)                                                       | false    |                                              |
| `--bandwidth`       | string  | Maximum throughput cap (e.g. `100mbit`, `1gbit`, `500kbit`)                                      | false    |                                              |
| `--image`           | string  | Network chaos injection workload image                                                            | false    | quay.io/krkn-chaos/krkn-network-chaos:latest |
| `--taints`          | string  | Comma-separated taints for which tolerations are created (e.g. `node-role.kubernetes.io/master:NoSchedule`) | false |                                   |
| `--service-account` | string  | Optional service account for the scenario workload                                                | false    |                                              |
| `--wait-duration`   | number  | Seconds to wait before running the next scenario in the same file                                 | false    | 300                                          |

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
krknctl run vmi-network-chaos \
  --namespace <namespace> \
  --target ".*" \
  --latency 100ms \
  --loss 10 \
  --chaos-duration 120
```

**Bandwidth cap on a specific VMI:**
```bash
krknctl run vmi-network-chaos \
  --namespace <namespace> \
  --target "<vmi-name>" \
  --bandwidth 1mbit \
  --ingress true \
  --egress true \
  --chaos-duration 300
```

**Catastrophic combined degradation:**
```bash
krknctl run vmi-network-chaos \
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
krknctl run vmi-network-chaos \
  --namespace <namespace> \
  --target ".*" \
  --latency 5000ms \
  --chaos-duration 60
```
