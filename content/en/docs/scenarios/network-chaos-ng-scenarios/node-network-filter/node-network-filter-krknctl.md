---
title: Node Network Filter using krknctl
description: >
weight : 3
date: 2017-01-05
---
No problem! Here's the data you provided, formatted as a Markdown table.

---

```bash
krknctl run node-network-filter (optional: --<parameter>:<value> )
```


Can also set any global variable listed [here](../../all-scenario-env-krknctl.md)

### Pod Network Filter Parameters

| Argument          | Type    | Description                                                                 | Required | Default Value                       |
| :---------------- | :------ | :-------------------------------------------------------------------------- | :------- | :---------------------------------- |
| `--chaos-duration`| number  | Chaos Duration                                                              | false    | 60                                  |
| `--pod-selector`  | string  | Pod Selector                                                                | false    |                                     |
| `--pod-name`      | string  | Pod Name                                                                    | false    |                                     |
| `--namespace`     | string  | Namespace                                                                   | false    | default                             |
| `--instance-count`| number  | Number of instances to target                                               | false    | 1                                   |
| `--execution`     | enum    | Execution mode                                                              | false    |                                     |
| `--ingress`       | boolean | Filter incoming traffic                                                     | true     |                                     |
| `--egress`        | boolean | Filter outgoing traffic                                                     | true     |                                     |
| `--interfaces`    | string  | Network interfaces to filter outgoing traffic (if more than one separated by comma) | false    |                                     |
| `--ports`         | string  | Network ports to filter traffic (if more than one separated by comma)       | true     |                                     |
| `--image`         | string  | The network chaos injection workload container image                        | false    | quay.io/krkn-chaos/krkn-network-chaos:latest |
| `--protocols`     | string  | The network protocols that will be filtered                                 | false    | tcp                                 |
| `--taints`| String | List of taints for which tolerations need to created | false ||