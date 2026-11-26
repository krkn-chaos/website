Run with Podman or Docker. Adjust the kubeconfig mount if needed.

```bash
podman run --rm --net=host \
  -v "$HOME/.kube/config:/home/krkn/.kube/config:Z" \
  -e NAMESPACE=krkn-gpu-test \
  -e NODE_SELECTOR='kubernetes.io/hostname=gpu-node' \
  -e GPU_IDS=0 \
  -e GPU_FAULT_TYPE=vram-pressure \
  -e GPU_VRAM=20% \
  -e GPU_DURATION=60 \
  quay.io/krkn-chaos/krkn-hub-multiarch:gpu-scenarios
```
