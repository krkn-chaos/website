

```bash
krknctl run node-network-filter \
 --chaos-duration 60 \
 --node-name <node_name> \
 --ingress false \
 --egress true \
 --protocols tcp \
 --ports 2379,2380
```