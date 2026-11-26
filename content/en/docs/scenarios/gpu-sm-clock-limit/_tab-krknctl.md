```bash
krknctl run gpu-scenarios \
  --namespace krkn-gpu-test \
  --node-selector 'kubernetes.io/hostname=gpu-node' \
  --gpu-ids 0 \
  --fault-type clock-limit \
  --gpu-clock-mhz 750 \
  --duration 30
```

Use `--kubeconfig` if your kubeconfig is not at `~/.kube/config`.
