```bash
krknctl run storage-throttle [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)

Scenario specific parameters:
{{< param-table scenario="storage-throttle" source="krknctl" prefix="--" >}}

To target a KubeVirt VMI, pass `--vmi-name <vmi-name>`. Add `--pvc-name <pvc-name>` to select one PVC when the VMI has multiple attached PVCs.

```bash
krknctl run storage-throttle \
  --vmi-name my-vmi \
  --pvc-name my-vmi-data \
  --namespace default
```

#### Parameter dependencies

- At least one of `--vmi-name`, `--pvc-name`, or `--pod-name` should be set.
- `--vmi-name` resolves the current virt-launcher pod. Use `--pvc-name` to select a specific VMI PVC when needed; otherwise, `--pvc-name` resolves an associated pod and overrides `--pod-name`.

To see all available scenario options
```bash
krknctl run storage-throttle --help
```
