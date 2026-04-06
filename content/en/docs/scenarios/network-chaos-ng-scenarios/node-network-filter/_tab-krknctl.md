```bash
krknctl run node-network-filter (optional: --<parameter>:<value>)
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### Node Network Filter Parameters

| Argument          | Type    | Description                                                                 | Required | Default Value                       |
| :---------------- | :------ | :-------------------------------------------------------------------------- | :------- | :---------------------------------- |
| `--chaos-duration`| number  | Chaos duration in seconds                                                   | false    | 60                                  |
| `--node-selector` | string  | Node label selector (format: `key=value`)                                   | false    |                                     |
| `--node-name`     | string  | Specific node name to target (alternative to node-selector)                 | false    |                                     |
| `--namespace`     | string  | Namespace where the scenario container is deployed                          | false    | default                             |
| `--instance-count`| number  | Number of nodes to target when using node-selector                          | false    | 1                                   |
| `--execution`     | enum    | Execution mode: `parallel` or `serial`                                      | false    | parallel                            |
| `--ingress`       | boolean | Filter incoming traffic (at least one of ingress/egress must be true)       | true     |                                     |
| `--egress`        | boolean | Filter outgoing traffic (at least one of ingress/egress must be true)       | true     |                                     |
| `--interfaces`    | string  | Network interfaces to filter traffic (comma-separated, auto-detected if empty) | false    |                                     |
| `--ports`         | string  | Network ports to filter traffic (comma-separated, e.g., `8080,8081,8082`)   | true     |                                     |
| `--image`         | string  | The network chaos injection workload container image                        | false    | quay.io/krkn-chaos/krkn-network-chaos:latest |
| `--protocols`     | string  | Network protocols to filter: `tcp`, `udp`, or `tcp,udp`                     | false    | tcp                                 |
| `--taints`        | string  | Comma-separated tolerations for the workload (e.g., `key=value:NoSchedule`) | false    |                                     |
| `--service-account`| string | Service account for the workload                                            | false    |                                     |

### Parameter Format Details

**Node Selection:**
- `--node-selector`: Label selector in format `key=value` (e.g., `node-role.kubernetes.io/worker=`)
- `--node-name`: Specific node name (e.g., `ip-10-0-1-100.ec2.internal`)
- Specify either `--node-selector` OR `--node-name`, not both
- When using `--node-selector`, use `--instance-count` to limit the number of selected nodes

**Port Format:**
- Single port: `8080`
- Multiple ports: `8080,8081,8082` (comma-separated, no spaces)

**Protocol Format:**
- Valid values: `tcp`, `udp`, `tcp,udp`, or `udp,tcp`
- Default: `tcp`

**Interface Format:**
- Single interface: `eth0`
- Multiple interfaces: `eth0,eth1,eth2` (comma-separated, no spaces)
- If empty, the scenario auto-detects the default network interface

**Taints Format:**
- Standard Kubernetes toleration format
- Example: `key=value:NoSchedule,key2=value2:NoExecute`

### Usage Notes

- **Node targeting:** This scenario targets nodes (not pods) and creates iptables rules on the target node(s) to filter network traffic
- **Ingress/Egress:** At least one of `--ingress` or `--egress` must be set to `true`. Both can be `true` to filter both incoming and outgoing traffic
- **Execution modes:**
  - `parallel`: Applies network filtering to all selected nodes simultaneously
  - `serial`: Applies network filtering to nodes one at a time

### Example Commands

**Basic egress filtering (block outgoing traffic):**
```bash
krknctl run node-network-filter \
  --node-selector node-role.kubernetes.io/worker= \
  --instance-count 1 \
  --ingress false \
  --egress true \
  --ports 8080 \
  --protocols tcp \
  --chaos-duration 120
```

**Ingress + egress filtering (block both incoming and outgoing):**
```bash
krknctl run node-network-filter \
  --node-name ip-10-0-1-100.ec2.internal \
  --ingress true \
  --egress true \
  --ports 9090,9091 \
  --protocols tcp,udp \
  --interfaces eth0 \
  --chaos-duration 300
```

**Multi-port filtering with parallel execution:**
```bash
krknctl run node-network-filter \
  --node-selector kubernetes.io/os=linux \
  --instance-count 3 \
  --execution parallel \
  --ingress false \
  --egress true \
  --ports 6379,6380,6381 \
  --protocols tcp \
  --chaos-duration 180
```
