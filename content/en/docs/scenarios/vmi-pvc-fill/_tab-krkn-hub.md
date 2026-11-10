Choose the storage mode and pass its settings as environment variables. This example runs block mode; the private key is mounted inside the container, and `IDENTITY_FILE` points to that in-container path.

```bash
docker run --name=vmi-pvc-fill \
  --net=host --pull=always \
  -v <path-to-kube-config>:/home/krkn/.kube/config:Z \
  -v <path-to-guest-private-key>:/home/krkn/.ssh/vmi-pvc-fill-key:ro,Z \
  -e VMI_NAME=my-vmi \
  -e PVC_NAME=my-vmi-data \
  -e NAMESPACE=default \
  -e DEVICE_PATH=/dev/vdb \
  -e USERNAME=fedora \
  -e IDENTITY_FILE=/home/krkn/.ssh/vmi-pvc-fill-key \
  -e FILL_PERCENTAGE=50 \
  -e DURATION=60 \
  containers.krkn-chaos.dev/krkn-chaos/krkn-hub:vmi-pvc-fill
```

For filesystem PVC mode, omit the guest-only settings and provide `PVC_NAME` or `POD_NAME` to locate the mounted PVC. Set `VMI_NAME` when using the VMI to identify the target. See the parameter table below for the full list of environment variables.
