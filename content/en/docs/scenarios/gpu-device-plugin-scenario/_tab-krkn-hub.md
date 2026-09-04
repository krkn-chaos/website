#### Run

```bash
$ podman run \
  --name=gpu-device-plugin-disruption \
  --net=host \
  --pull=always \
  --env-host=true \
  -e NAMESPACE="nvidia-gpu-operator" \
  -e POD_LABEL="app=nvidia-device-plugin-daemonset" \
  -e NODE_LABEL_SELECTOR="nvidia.com/gpu.present=true" \
  -e DISRUPTION_COUNT="1" \
  -e EXPECTED_RECOVERY_TIME="120" \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:pod-scenarios
$ podman logs -f gpu-device-plugin-disruption
```

See [Pod Scenarios](../pod-scenarios/) for all supported parameters.
