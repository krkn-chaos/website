
```bash
krknctl run pvc-scenarios [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
`--pvc-name` | Targeted PersistentVolumeClaim in the cluster (if null, POD_NAME is required) | string | 
`--pod-name` | Targeted pod in the cluster (if null, PVC_NAME is required) | string | 
`--namespace` | Targeted namespace in the cluster (required) | string | 
`--fill-percentage` | Targeted percentage to be filled up in the PVC | number |  50 |
`--duration` | Duration in seconds with the PVC filled up | number | 60 | 


#### Parameter Dependencies

- **`--pvc-name` vs `--pod-name`:** At least one is required. If both are set, `--pvc-name` takes precedence and `--pod-name` is ignored.

#### Behavior Notes

- **Automatic cleanup:** After `--duration` expires, krkn automatically deletes the temporary fill file from the PVC.
- **PVC requirements:** The target PVC must be in `Bound` state and mounted to an active pod. The scenario locates the mount path by inspecting the pod's volume mounts.

To see all available scenario options 
```bash
krknctl run pvc-scenarios --help
```