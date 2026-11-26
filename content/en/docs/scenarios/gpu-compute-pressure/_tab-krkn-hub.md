Run with Podman or Docker. Adjust the kubeconfig mount if needed.

```bash
podman run --rm --net=host \
  -v "$HOME/.kube/config:/home/krkn/.kube/config:Z" \
  -e NAMESPACE=krkn-gpu-test \
  -e POD_LABEL_SELECTOR='app=inference' \
  -e TARGET_NAMESPACE=inference \
  -e GPU_IDS=all \
  -e GPU_FAULT_TYPE=compute-pressure \
  -e GPU_COMPUTE_DUTY_CYCLE=20% \
  -e GPU_DURATION=60 \
  quay.io/krkn-chaos/krkn-hub-multiarch:gpu-scenarios
```
