
Example scenario file: [service_hijacking.yaml](https://github.com/krkn-chaos/scenarios-hub)

### Sample Scenario
```yaml
service_target_port: http-web-svc # The port of the service to be hijacked (can be named or numeric, based on the workload and service configuration).
service_name: nginx-service # The name of the service that will be hijacked.
service_namespace: default # The namespace where the target service is located.
image: quay.io/krkn-chaos/krkn-service-hijacking:v0.1.3 # Image of the krkn web service to be deployed to receive traffic.
chaos_duration: 30 # Total duration of the chaos scenario in seconds.
privileged: True # True or false if need privileged securityContext to run
plan:
  - resource: "/list/index.php" # Specifies the resource or path to respond to in the scenario. For paths, both the path and query parameters are captured but ignored. For resources, only query parameters are captured.

    steps:                      # A time-based plan consisting of steps can be defined for each resource.
      GET:                      # One or more HTTP methods can be specified for each step. Note: Non-standard methods are supported for fully custom web services (e.g., using NONEXISTENT instead of POST).

        - duration: 15          # Duration in seconds for this step before moving to the next one, if defined. Otherwise, this step will continue until the chaos scenario ends.

          status: 500           # HTTP status code to be returned in this step.
          mime_type: "application/json" # MIME type of the response for this step.
          payload: |            # The response payload for this step.
            {
              "status":"internal server error"
            }
        - duration: 15
          status: 201
          mime_type: "application/json"
          payload: |
            {
              "status":"resource created"
            }
      POST:
        - duration: 15
          status: 401
          mime_type: "application/json"
          payload: |
            {
               "status": "unauthorized"
            }
        - duration: 15
          status: 404
          mime_type: "text/plain"
          payload: "not found"


```

### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - service_hijacking_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - service_hijacking_scenarios:
            - scenarios/service-hijack-1.yaml
            - scenarios/service-hijack-2.yaml
            - scenarios/service-hijack-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - service_hijacking_scenarios:
            - scenarios/service-hijack.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - network_chaos_scenarios:
            - scenarios/network-chaos.yaml
        - service_hijacking_scenarios:  # Same type can appear multiple times
            - scenarios/service-hijack-2.yaml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
