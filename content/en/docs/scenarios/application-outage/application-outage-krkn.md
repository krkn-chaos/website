---
title: Application Outage Scenarios using Krkn
description: 
date: 2017-01-04
weight: 1
---
##### Sample scenario config
```yaml
application_outage:                                  # Scenario to create an outage of an application by blocking traffic
  duration: 600                                      # Duration in seconds after which the routes will be accessible
  namespace: <namespace-with-application>            # Namespace to target - all application routes will go inaccessible if pod selector is empty
  pod_selector: {app: foo}                           # Pods to target
  exclude_label: ""                                  # Optional label selector to exclude pods. Supports dict, string, or list format
  block: [Ingress, Egress]                           # It can be Ingress or Egress or Ingress, Egress
```

##### Debugging steps in case of failures
Kraken creates a network policy blocking the ingress/egress traffic to create an outage, in case of failures before reverting back the network policy, you can delete it manually by executing the following commands to stop the outage:
```bash
$ oc delete networkpolicy/kraken-deny -n <targeted-namespace>
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