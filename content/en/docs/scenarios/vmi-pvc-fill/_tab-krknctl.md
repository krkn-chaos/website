Run the published scenario image with `krknctl`:

```bash
krknctl run vmi-pvc-fill [--<parameter> <value>]
```

For filesystem PVC mode, pass `--pvc-name` or `--pod-name`. For block PVC mode, also pass `--vmi-name`, `--device-path`, and `--identity-file`:

```bash
krknctl run vmi-pvc-fill \
  --vmi-name my-vmi \
  --pvc-name my-vmi-data \
  --device-path /dev/vdb \
  --username fedora \
  --identity-file /path/to/guest-private-key \
  --fill-percentage 50 \
  --duration 60
```

The matching public key must be authorized in the guest. `--identity-file` accepts a local file path, which krknctl mounts into the scenario container. See the parameter table below for all options. You can also set global variables listed [here](../all-scenario-env-krknctl.md).
