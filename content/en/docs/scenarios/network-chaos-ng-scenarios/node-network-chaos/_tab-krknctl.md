
```bash
krknctl run node-network-chaos [--<parameter> <value>]
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### Node Network Chaos Parameters

| Argument             | Type    | Description                                                                                                              | Required | Default Value                                    |
| :------------------- | :------ | :----------------------------------------------------------------------------------------------------------------------- | :------- | :----------------------------------------------- |
| `--label-selector`   | string  | Label selector to target one or more nodes (e.g. `node-role.kubernetes.io/worker=`). If omitted, `--node-name` is used  | false    |                                                  |
| `--node-name`        | string  | Exact node name to target when `--label-selector` is not specified                                                       | false    |                                                  |
| `--instance-count`   | number  | Number of nodes matching the selector to apply chaos on simultaneously                                                   | false    | 1                                                |
| `--interfaces`       | string  | YAML-style list of interface names to shape (e.g. `[br-ex]` or `[eth0,eth1]`). Leave empty to target the default interface | false  |                                                  |
| `--traffic-type`     | string  | Direction of traffic to shape. Accepted values: `[egress]`, `[ingress]`, or `[egress,ingress]`                          | false    | [egress]                                         |
| `--latency`          | string  | Artificial delay to add to matching packets. Format: `<number><unit>` where unit is `us`, `ms`, or `s` (e.g. `200ms`). Leave empty to skip | false |                                   |
| `--loss`             | string  | Percentage of packets to drop. Digits only, no `%` symbol (e.g. `10` means 10%). Leave empty to skip                   | false    |                                                  |
| `--bandwidth`        | string  | Maximum throughput for matching traffic. Format: `<number><unit>` where unit is `bit`, `kbit`, `mbit`, `gbit`, or `tbit` (e.g. `100mbit`). Leave empty to skip | false | |
| `--test-duration`    | number  | How long (in seconds) to hold the tc rules before cleanup                                                                | false    | 120                                              |
| `--execution`        | enum    | Execution mode when targeting multiple nodes: `serial` or `parallel`                                                     | false    | parallel                                         |
| `--force`            | enum    | When `true`, removes any pre-existing tc qdiscs on the interface before applying new rules. Use with caution             | false    | false                                            |
| `--namespace`        | string  | Kubernetes namespace where the scenario helper pod will be scheduled                                                     | false    | default                                          |
| `--image`            | string  | Container image used for the chaos helper pod that applies tc rules on the node                                          | false    | quay.io/krkn-chaos/krkn-network-chaos:latest     |
| `--service-account`  | string  | Kubernetes service account to assign to the helper pod (leave empty to use the namespace default)                       | false    |                                                  |
| `--taints`           | string  | YAML-style list of node taints the helper pod should tolerate                                                            | false    |                                                  |
