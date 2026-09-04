```bash
krknctl run pod-scenarios \
  --namespace nvidia-gpu-operator \
  --pod-label app=nvidia-device-plugin-daemonset \
  --node-label-selector nvidia.com/gpu.present=true \
  --disruption-count 1 \
  --expected-recovery-time 120
```

See [Pod Scenarios](../pod-scenarios/) for all supported parameters, or run:

```bash
krknctl run pod-scenarios --help
```
