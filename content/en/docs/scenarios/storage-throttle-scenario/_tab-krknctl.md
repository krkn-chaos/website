```bash
krknctl run storage-throttle [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)

Scenario specific parameters:
| Parameter | Description | Type | Required | Default |
| --------- | ----------- | ---- | :------: | ------- |
| `--pvc-name` | Target PVC name. If set, `--pod-name` is auto-resolved from PVC | string | No | |
| `--pod-name` | Target pod name. Ignored if `--pvc-name` is set | string | No | |
| `--namespace` | Namespace of the target pod/PVC | string | Yes | `default` |
| `--mount-path` | Specific mount path to throttle (absolute path, example: `/data`) | string | No | |
| `--throttle-type` | Throttle mode to apply (`bandwidth`, `iops`, `both`) | enum | No | `bandwidth` |
| `--read-iops` | Maximum read IOPS (used for `iops`/`both`) | number | No | `100` |
| `--write-iops` | Maximum write IOPS (used for `iops`/`both`) | number | No | `50` |
| `--read-bps` | Maximum read bytes/sec (example: `1Mi`, `512Ki`, `1000000`) | string | No | `1Mi` |
| `--write-bps` | Maximum write bytes/sec (example: `512Ki`, `1Mi`, `500000`) | string | No | `512Ki` |
| `--duration` | Duration to hold throttling (example: `30s`, `1m`, `120`) | string | No | `1m` |
| `--image` | Image used for privileged helper pod that writes cgroup values | string | No | `quay.io/krkn-chaos/krkn:tools` |

#### Parameter dependencies

- At least one of `--pvc-name` or `--pod-name` should be set.
- If both are set, `--pvc-name` takes precedence and `--pod-name` is ignored.

To see all available scenario options
```bash
krknctl run storage-throttle --help
```
