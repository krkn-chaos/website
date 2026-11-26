```bash
krknctl run gpu-scenarios \
  --namespace krkn-gpu-test \
  --node-selector 'kubernetes.io/hostname=gpu-node' \
  --gpu-ids 0 \
  --fault-type power-limit \
  --gpu-power-limit-w 40 \
  --duration 30
```

Use `--kubeconfig` if your kubeconfig is not at `~/.kube/config`.
