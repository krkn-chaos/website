
```bash
krknctl run http-load (optional: --<parameter>:<value> ) |
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md) 


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
`--target-endpoints` | Semicolon-separated list of target endpoints. Format: METHOD URL;METHOD URL HEADER1:VAL1,HEADER2:VAL2 BODY. Example: GET https://myapp.example.com/health;POST https://myapp.example.com/api Content-Type:application/json {\"key\":\"value\"} | string | **Required** |
`--rate` | Request rate per pod (e.g. 50/1s, 1000/1m, 0 for max throughput) | string | 50/1s |
`--chaos-duration` | Duration of the load test (e.g. 30s, 5m, 1h) | string | 30s |
`--namespace` | The namespace where the attacker pods will be deployed | string | default | 
`--number-of-pods` | The number of attacker pods that will be deployed | number | 2 | 
`--workers` | Initial number of concurrent workers per pod | number | 10 |
`--max-workers` | Maximum number of concurrent workers per pod (auto-scales) | number | 100 |
`--connections` | Maximum number of idle open connections per host | number | 100 |
`--timeout` | Per-request timeout (e.g. 10s, 30s) | string | 10s |
`--image` | The container image that will be used to perform the scenario | string | quay.io/krkn-chaos/krkn-http-load:latest | 
`--insecure` | Skip TLS certificate verification (for self-signed certs) | string | false |
`--node-selectors` | The node selectors are used to guide the cluster on where to deploy attacker pods. You can specify one or more labels in the format key=value;key=value2 (even using the same key) to choose one or more node categories. If left empty, the pods will be scheduled on any available node, depending on the cluster s capacity.  | string |



To see all available scenario options 
```bash
krknctl run http-load --help
```
