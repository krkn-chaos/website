
```bash
krknctl run time-scenarios  (optional: --<parameter>:<value> ) | 
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md) 


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
~-~-object-type | Object to target. Supported options `pod` or `node` |enum| pod |
~-~-label-selector | Label of the container(s) or nodes to target |string| "k8s-app=etcd" |
~-~-action | Action to run. Supported actions: `skew_time` or `skew_date` |enum| skew_date|
~-~-object-names | List of the names of pods or nodes you want to skew |string| | |
~-~-container-name | Container in the specified pod to target in case the pod has multiple containers running. Random container is picked if empty |string | 
~-~-namespace | Namespace of the pods you want to skew, need to be set only if setting a specific pod name |string|



To see all available scenario options 
```bash
krknctl run time-scenarios --help 
```