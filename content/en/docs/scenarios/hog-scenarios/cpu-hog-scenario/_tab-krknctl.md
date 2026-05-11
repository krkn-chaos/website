
```bash
krknctl run node-cpu-hog [--<parameter> <value>]
```


Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

| Parameter      | Description    | Type      | Required |  Default | 
| ----------------------- | ----------------------    | ----------------  | :------: | ------------------------------------ |
`--chaos-duration` | Set chaos duration (in secs) as desired | number | No |  60 | 
`--cores` | Number of cores (workers) of node CPU to be consumed | number | No | 
`--cpu-percentage` | Percentage of total cpu to be consumed | number | No |  50 | 
`--namespace` | Namespace where the scenario container will be deployed | string | No |  default | 
`--node-selector` | Node selector where the scenario containers will be scheduled in the format "<selector>=<value>". NOTE:  Will be instantiated a container per each node selected with the same scenario options. If left empty a random node will be selected | string | No | 
`--taints` | List of taints for which tolerations need to be created. For example ["node-role.kubernetes.io/master:NoSchedule"]" | string | No | [] |
`--number-of-nodes` | restricts the number of selected nodes by the selector | number | No | 
`--image` | The hog container image. Can be changed if the hog image is mirrored on a private repository | string | No |  quay.io/krkn-chaos/krkn-hog | 





To see all available scenario options 
```bash
krknctl run node-cpu-hog --help
```