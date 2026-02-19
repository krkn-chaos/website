
```bash
krknctl run container-scenarios (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ |
`--namespace` | Targeted namespace in the cluster | string | openshift-etcd | 
`--label-selector` | Label of the container(s) to target | string | k8s-app=etcd | 
`--exclude-label` | Label of pod/container to exclude after using label-selector to target. For example "app=foo"  | string | False | | 
`--disruption-count` | Number of container to disrupt | number | 1 | 
`--container-name` | Name of the container to disrupt | string | etcd | 
`--action` | kill signal to run. For example 1 ( hang up ) or 9 | string | 1 | 
`--expected-recovery-time` | Time to wait before checking if all containers that were affected recover properly | number | 60 | 


To see all available scenario options 
```bash
krknctl run container-scenarios --help
```