
```bash
krknctl run pvc-scenarios (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
`--pvc-name` | Targeted PersistentVolumeClaim in the cluster (if null, POD_NAME is required) | string | 
`--pod-name` | Targeted pod in the cluster (if null, PVC_NAME is required) | string | 
`--namespace` | Targeted namespace in the cluster (required) | string | 
`--fill-percentage` | Targeted percentage to be filled up in the PVC | number |  50 |
`--duration` | Duration to wait for completion of node scenario injection | number | 1200 | 


To see all available scenario options 
```bash
krknctl run pvc-scenarios --help
```