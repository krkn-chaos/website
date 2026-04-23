Example scenario file: [http_load_scenario.yml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kube/http_load_scenario.yml)

##### Sample scenario config

```yaml
- http_load_scenario:
    runs: 1                                            # number of times to execute the scenario
    number-of-pods: 2                                  # number of attacker pods instantiated
    namespace: default                                 # namespace to deploy load testing pods
    image: quay.io/krkn-chaos/krkn-http-load:latest    # http load attacker container image
    attacker-nodes:                                    # node affinity to schedule the attacker pods
      node-role.kubernetes.io/worker:                  # per each node label selector can be specified
        - ""                                           # multiple values so the kube scheduler will schedule
                                                       # the attacker pods in the best way possible
                                                       # set empty value `attacker-nodes: {}` to let kubernetes schedule the pods
    targets:                                           # Vegeta round-robins across all endpoints
      endpoints:                                       # supported methods: GET, POST, PUT, DELETE, PATCH, HEAD
        - url: "https://your-service.example.com/health"
          method: "GET"
        - url: "https://your-service.example.com/api/data"
          method: "POST"
          headers:
            Content-Type: "application/json"
            Authorization: "Bearer your-token"
          body: '{"key":"value"}'

    rate: "50/1s"                                      # request rate per pod: "50/1s", "1000/1m", "0" for max throughput
    duration: "30s"                                    # attack duration: "30s", "5m", "1h"
    workers: 10                                        # initial concurrent workers per pod
    max_workers: 100                                   # maximum workers per pod (auto-scales)
    connections: 100                                   # max idle connections per host
    timeout: "10s"                                     # per-request timeout
    keepalive: true                                    # use persistent HTTP connections
    http2: true                                        # enable HTTP/2
    insecure: false                                    # skip TLS verification (for self-signed certs)
```

### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - http_load_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - http_load_scenarios:
            - scenarios/http-load-1.yaml
            - scenarios/http-load-2.yaml
            - scenarios/http-load-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - http_load_scenarios:
            - scenarios/http-load.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - syn_flood_scenarios:
            - scenarios/syn-flood.yaml
        - http_load_scenarios:  # Same type can appear multiple times
            - scenarios/http-load-2.yaml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
