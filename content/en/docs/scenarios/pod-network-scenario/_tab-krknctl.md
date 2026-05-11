
```bash
krknctl run pod-network-chaos [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      | Required |  Default | 
| ----------------------- | ----------------------    | ----------------  | :------: | ------------------------------------ | 
`--namespace` | Namespace of the pod to which filter need to be applied  | string | Yes |
`--image` | Image used to disrupt network on a pod  | string | No |  quay.io/krkn-chaos/krkn:tools | 
`--label-selector` | When pod_name is not specified, pod matching the label will be selected for the chaos scenario  | string | No |
`--exclude-label` | Pods matching this label will be excluded from the chaos even if they match other criteria | string | No | "" |
`--pod-name` | When label_selector is not specified, pod matching the name will be selected for the chaos scenario  | string | No | 
`--instance-count` | Targeted instance count matching the label selector  | number | No |  1 |
`--traffic-type` | List of directions to apply filters - egress/ingress ( needs to be a list )  | string | No | "[ingress,egress]" | 
`--ingress-ports` | Ingress ports to block ( needs to be a list )  | string | No |   | 
`--egress-ports` | Egress ports to block ( needs to be a list )  | string | No |   | 
`--wait-duration` | Ensure that it is at least about twice of test_duration  | number | No |  300 | 
`--test-duration` | Duration of the test run  | number | No |  120 | 

#### Parameter Dependencies

- **`--ingress-ports` / `--egress-ports`:** When left empty, **all** ports are blocked for that traffic direction. Specify port numbers to restrict the filter to only those ports.
- **`--wait-duration`:** Must be at least 2× `--test-duration` to allow the network to stabilize before verification.

To see all available scenario options 
```bash
krknctl run pod-network-chaos --help
```