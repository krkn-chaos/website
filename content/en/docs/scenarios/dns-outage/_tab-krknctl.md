

```bash
krknctl run pod-network-filter \
 --chaos-duration 60 \
 --pod-name target-pod \
 --ingress false \
 --egress true \
 --protocols tcp,udp \
 --ports 53
```