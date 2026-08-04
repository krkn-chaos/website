Example scenario files:
- [storage_throttle.yaml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kube/storage_throttle.yaml) (Kubernetes)
- [storage_throttle.yaml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/storage_throttle.yaml) (OpenShift)

##### Sample scenario config

```yaml
storage_throttle_scenario:
  pvc_name: ""                    # Target PVC name. If set, pod_name is auto-resolved from PVC.
  pod_name: my-app-pod            # Target pod name. Ignored if pvc_name is set.
  namespace: default              # Namespace of the target PVC/pod (required)
  mount_path: ""                  # Specific mount path to throttle. If empty, first PVC mount is used.
  throttle_type: bandwidth        # "iops", "bandwidth", or "both"
  read_iops: 100                  # Max read IOPS (used when throttle_type is "iops" or "both")
  write_iops: 50                  # Max write IOPS (used when throttle_type is "iops" or "both")
  read_bps: 1Mi                   # Max read bytes/sec (used when throttle_type is "bandwidth" or "both")
  write_bps: 512Ki                # Max write bytes/sec (used when throttle_type is "bandwidth" or "both")
  duration: 1m                    # How long to hold the throttle (supports suffixes: 30s, 2m, 1h)
  # image: quay.io/krkn-chaos/krkn:tools  # (optional) override helper pod image
```

##### Throttle type examples

**Bandwidth only** (default) — cap read/write throughput:

```yaml
storage_throttle_scenario:
  pvc_name: my-data-pvc
  namespace: production
  throttle_type: bandwidth
  read_bps: 1Mi                   # 1 MiB/s read limit
  write_bps: 512Ki                # 512 KiB/s write limit
  duration: 2m
```

**IOPS only** — cap read/write operations per second:

```yaml
storage_throttle_scenario:
  pod_name: postgres-0
  namespace: database
  throttle_type: iops
  read_iops: 50
  write_iops: 25
  duration: 90s
```

**Both** — apply IOPS and bandwidth limits simultaneously:

```yaml
storage_throttle_scenario:
  pvc_name: wal-pvc
  namespace: database
  throttle_type: both
  read_iops: 100
  write_iops: 50
  read_bps: 5Mi
  write_bps: 2Mi
  duration: 3m
```

### How to Use Plugin Name

Add the plugin name to the `chaos_scenarios` section in `config/config.yaml`:

```yaml
kraken:
    kubeconfig_path: ~/.kube/config
    ..
    chaos_scenarios:
        - storage_throttle_scenarios:
            - scenarios/kube/storage_throttle.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - storage_throttle_scenarios:
            - scenarios/kube/storage_throttle_bandwidth.yaml
            - scenarios/kube/storage_throttle_iops.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - storage_throttle_scenarios:
            - scenarios/kube/storage_throttle.yaml
        - pvc_scenarios:
            - scenarios/kube/pvc_scenario.yaml
        - pod_disruption_scenarios:
            - scenarios/kube/pod-kill.yaml
        - storage_throttle_scenarios:  # Same type can appear multiple times
            - scenarios/kube/storage_throttle_iops.yaml
```
{{% /alert %}}

### Run

```bash
python run_kraken.py --config config/config.yaml
```
