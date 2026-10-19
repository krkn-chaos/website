
```bash
krknctl run pod-network-filter [--<parameter> <value>]
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)


{{< param-table scenario="pod-network-filter" source="krknctl" prefix="--" >}}

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
