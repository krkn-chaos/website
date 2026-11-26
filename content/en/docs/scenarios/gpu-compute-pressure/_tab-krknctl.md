```bash
krknctl run gpu-scenarios \
  --namespace krkn-gpu-test \
  --pod-label-selector 'app=inference' \
  --target-namespace inference \
  --gpu-ids all \
  --fault-type compute-pressure \
  --gpu-compute-duty-cycle 20% \
  --duration 60
```

Use `--kubeconfig` if your kubeconfig is not at `~/.kube/config`.
