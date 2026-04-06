
```bash
krknctl run node-interface-down (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### Node Interface Down Parameters

| Argument             | Type    | Description                                                                                    | Required | Default Value                                    |
| :------------------- | :------ | :--------------------------------------------------------------------------------------------- | :------- | :----------------------------------------------- |
| `--chaos-duration`   | number  | Duration in seconds to keep the interface(s) down                                              | false    | 60                                               |
| `--recovery-time`    | number  | Seconds to wait after bringing the interface(s) back up before continuing                      | false    | 0                                                |
| `--node-selector`    | string  | Label selector to choose target nodes                                                          | false    | node-role.kubernetes.io/worker=                  |
| `--node-name`        | string  | Node name to target (used when node-selector is not set)                                       | false    |                                                  |
| `--namespace`        | string  | Namespace where the chaos workload pod will be deployed                                        | false    | default                                          |
| `--instance-count`   | number  | Number of nodes to target from those matching the selector                                     | false    | 1                                                |
| `--execution`        | enum    | Execution mode when targeting multiple nodes: `serial` or `parallel`                           | false    | serial                                           |
| `--interfaces`       | string  | Comma-separated list of interface names to bring down. Leave empty to auto-detect the default interface | false |                                             |
| `--image`            | string  | The chaos workload container image                                                             | false    | quay.io/redhat-chaos/krkn-ng-tools:latest        |
| `--taints`           | string  | List of taints for which tolerations need to be created                                        | false    |                                                  |
