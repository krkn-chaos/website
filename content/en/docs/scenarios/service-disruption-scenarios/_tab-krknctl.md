
```bash
krknctl run service-disruption-scenarios [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      | Required |  Default | 
| ----------------------- | ----------------------    | ----------------  | :------: | ------------------------------------ | 
`--namespace` | Targeted namespace in the cluster (required) |string | No | openshift-etcd | 
`--label-selector` | Label of the namespace to target. Set this parameter only if NAMESPACE is not set |string | No | 
`--delete-count` | Number of namespaces to kill in each run, based on matching namespace and label specified |number | No | 1 | 
`--runs` | Number of runs to execute the action |number | No | 1 |


#### Behavior Notes

- **No automatic recovery:** After krkn deletes the services, they are **not** automatically recreated. Services will only come back if managed by a controller (e.g. Helm release, operator, or GitOps pipeline). Verify your recovery mechanism before running this scenario.

To see all available scenario options 
```bash
krknctl run service-disruption-scenarios --help
```