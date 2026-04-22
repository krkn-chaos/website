
```bash
krknctl run application-outages [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      | Required    | Default | 
| ----------------------- | ----------------------    | ----------------   | ---------------- | ------------------------------------ |
`--namespace` | Namespace to target - all application routes will go inaccessible if pod selector is empty | string | True |
`--chaos-duration` | Set chaos duration (in sec) as desired  | number | False | 600 | 
`--pod-selector` | Pods to target. For example "{app: foo}"  | string | False | | 
`--exclude-selector` | Pods to exclude after using pod-selector to target. For example "{app: foo}"  | string | False | | 
`--block-traffic-type` | It can be [Ingress] or [Egress] or [Ingress, Egress] | string | False | "[Ingress, Egress]" | 

#### Behavior Notes

- **Empty `--pod-selector`:** When left empty, krkn creates a NetworkPolicy that targets **all pods** in the namespace, causing a namespace-wide outage.
- **Automatic cleanup:** After `--chaos-duration` expires, krkn automatically deletes the NetworkPolicy it created and traffic resumes. A rollback handler is also registered to ensure cleanup if the scenario fails unexpectedly.

To see all available scenario options 
```bash
krknctl run application-outages --help
```