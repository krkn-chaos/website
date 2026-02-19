
```bash
krknctl run application-outages (optional: --<parameter>:<value>)
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      | Required    | Default | 
| ----------------------- | ----------------------    | ----------------   | ---------------- | ------------------------------------ |
`--namespace` | Namespace to target - all application routes will go inaccessible if pod selector is empty | string | True |
`--chaos-duration` | Set chaos duration (in sec) as desired  | number | False | 600 | 
`--pod-selector` | Pods to target. For example "{app: foo}"  | string | False | | 
`--exclude-label` | Pods to exclude after using pod-selector to target. For example "{app: foo}"  | string | False | | 
`--block-traffic-type` | It can be [Ingress] or [Egress] or [Ingress, Egress] | string | False | "[Ingress, Egress]" | 

To see all available scenario options 
```bash
krknctl run application-outages --help
```