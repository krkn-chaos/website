```bash
krknctl run gpu-scenarios \
  --namespace krkn-gpu-test \
  --node-selector 'kubernetes.io/hostname=gpu-node' \
  --gpu-ids 0 \
  --fault-type vram-pressure \
  --gpu-vram 20% \
  --duration 60
```

Use `--kubeconfig` if your kubeconfig is not at `~/.kube/config`.
