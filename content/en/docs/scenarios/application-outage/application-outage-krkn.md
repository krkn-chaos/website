---
title: Application Outage Scenarios using Krkn
description: 
date: 2017-01-04
weight: 2
---
##### Sample scenario config
```yaml
application_outage:                                  # Scenario to create an outage of an application by blocking traffic
  duration: 600                                      # Duration in seconds after which the routes will be accessible
  namespace: <namespace-with-application>            # Namespace to target - all application routes will go inaccessible if pod selector is empty
  pod_selector: {app: foo}                            # Pods to target
  block: [Ingress, Egress]                           # It can be Ingress or Egress or Ingress, Egress
```

##### Debugging steps in case of failures
Kraken creates a network policy blocking the ingress/egress traffic to create an outage, in case of failures before reverting back the network policy, you can delete it manually by executing the following commands to stop the outage:
```bash
$ oc delete networkpolicy/kraken-deny -n <targeted-namespace>
```
