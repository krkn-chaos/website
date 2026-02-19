```bash
krknctl run pod-scenarios (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:
| Parameter      | Description    | Type      |  Default |
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ |
`--namespace` | Targeted namespace in the cluster ( supports regex ) | string | openshift-* |
`--pod-label` | Label of the pod(s) to target ex. "app=test" | string |
`--exclude-label` | Pods matching this label will be excluded from the chaos even if they match other criteria | string | "" |
`--name-pattern` | Regex pattern to match the pods in NAMESPACE when POD_LABEL is not specified | string | .* |
`--disruption-count` | Number of pods to disrupt | number | 1 |
`--kill-timeout` | Timeout to wait for the target pod(s) to be removed in seconds | number | 180 |
`--expected-recovery-time` | Fails if the pod disrupted do not recover within the timeout set | number | 120 |
`--node-label-selector` | Label of the node(s) to target | string | "" |
`--node-names` | Name of the node(s) to target. Example: ["worker-node-1","worker-node-2","master-node-1"] | string | [] |

To see all available scenario options
```bash
krknctl run pod-scenarios --help
```
