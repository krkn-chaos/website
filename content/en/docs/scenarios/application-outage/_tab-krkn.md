##### Sample scenario config

Example scenario file: [app_outage.yaml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/app_outage.yaml)

```yaml
application_outage:                                  # Scenario to create an outage of an application by blocking traffic
  duration: 600                                      # Duration in seconds after which the routes will be accessible. Default if omitted: 60
  namespace: <namespace-with-application>            # Namespace to target - all application routes will go inaccessible if pod selector is empty
  pod_selector: {app: foo}                           # Pods to target
  exclude_label: ""                                  # Optional label selector to exclude pods. Supports dict, string, or list format
  block: [Ingress, Egress]                           # It can be Ingress or Egress or Ingress, Egress
```



## How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - application_outages_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - application_outages_scenarios:
            - scenarios/app-outage-1.yaml
            - scenarios/app-outage-2.yaml
            - scenarios/app-outage-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - application_outages_scenarios:
            - scenarios/app-outage.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - container_scenarios:
            - scenarios/container-kill.yaml
        - application_outages_scenarios:  # Same type can appear multiple times
            - scenarios/app-outage-2.yaml
```
{{% /alert %}}

### Run 

```bash
python run_kraken.py --config config/config.yaml
```
