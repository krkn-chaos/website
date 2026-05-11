
```bash
krknctl run pod-network-filter [--<parameter> <value>]
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)


| Argument          | Type    | Description                                                                 | Required | Default Value                       |
| :---------------- | :------ | :-------------------------------------------------------------------------- | :------- | :---------------------------------- |
| `--chaos-duration`| number  | Chaos Duration                                                              | false    | 60                                  |
| `--pod-selector`  | string  | Pod Selector                                                                | false    |                                     |
| `--pod-name`      | string  | Pod Name                                                                    | false    |                                     |
| `--namespace`     | string  | Namespace                                                                   | false    | default                             |
| `--instance-count`| number  | Number of instances to target                                               | false    | 1                                   |
| `--execution`     | enum    | Execution mode                                                              | false    |                                     |
| `--ingress`       | boolean | Filter incoming traffic                                                     | true     |                                     |
| `--egress`        | boolean | Filter outgoing traffic                                                     | true     |                                     |
| `--interfaces`    | string  | Network interfaces to filter outgoing traffic (if more than one separated by comma) | false    |                                     |
| `--ports`         | string  | Network ports to filter traffic (if more than one separated by comma)       | true     |                                     |
| `--image`         | string  | The network chaos injection workload container image                        | false    | quay.io/krkn-chaos/krkn-network-chaos:latest |
| `--protocols`     | string  | The network protocols that will be filtered                                 | false    | tcp                                 |
| `--taints`        | string  | Comma-separated taints (tolerations are derived for the workload), e.g. `node-role.kubernetes.io/master:NoSchedule` | false    |                                     |
| `--service-account`| string | Service account for the Pod Network Filter workload (optional)              | false    |                                     |

### Parameter Format Details

**Pod Selection:**
- `--pod-selector`: Label selector in format `key=value` (e.g., `app=myapp`)
- `--pod-name`: Specific pod name (alternative to pod-selector)
- Specify either `--pod-selector` OR `--pod-name`, not both
- When using `--pod-selector`, use `--instance-count` to limit the number of selected pods

**Port Format:**
- Single port: `8080`
- Multiple ports: `8080,8081,8082` (comma-separated, no spaces)

**Protocol Format:**
- Valid values: `tcp`, `udp`, `tcp,udp`, or `udp,tcp`
- Default: `tcp`

**Interface Format:**
- Single interface: `eth0`
- Multiple interfaces: `eth0,eth1,eth2` (comma-separated, no spaces)

### Example Commands

**Basic egress filtering (block outgoing traffic on a port):**
```bash
krknctl run pod-network-filter \
  --pod-selector app=myapp \
  --namespace default \
  --ingress false \
  --egress true \
  --ports 8080 \
  --protocols tcp \
  --chaos-duration 120
```

**Ingress + egress filtering (block both directions):**
```bash
krknctl run pod-network-filter \
  --pod-name my-pod-abc123 \
  --namespace my-namespace \
  --ingress true \
  --egress true \
  --ports 9090,9091 \
  --protocols tcp,udp \
  --chaos-duration 300
```

**Multi-pod filtering with parallel execution:**
```bash
krknctl run pod-network-filter \
  --pod-selector app=redis \
  --namespace redis-cluster \
  --instance-count 3 \
  --execution parallel \
  --ingress false \
  --egress true \
  --ports 6379,6380 \
  --protocols tcp \
  --chaos-duration 180
```
