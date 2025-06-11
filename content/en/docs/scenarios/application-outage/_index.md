---
title: Application Outage Scenarios
description: 
date: 2017-01-04
---

### Application outages
Scenario to block the traffic ( Ingress/Egress ) of an application matching the labels for the specified duration of time to understand the behavior of the service/other services which depend on it during downtime. This helps with planning the requirements accordingly, be it improving the timeouts or tweaking the alerts etc.

You can add in your applications URL into the [health checks section](../../krkn/config.md#health-checks) of the config to track the downtime of your application during this scenario

## Overview

This scenario creates a network outage for selected pods by applying a NetworkPolicy that blocks ingress and/or egress traffic. After the specified duration, the NetworkPolicy is automatically removed, restoring normal network connectivity.

## Use Cases

- Test application resilience to network disruptions
- Validate service mesh retry and timeout configurations
- Simulate temporary network partitions between components
- Test failover mechanisms when connectivity is lost

## How It Works

1. The plugin creates a NetworkPolicy in the specified namespace with the given pod selector
2. The NetworkPolicy is configured with empty ingress/egress rules (which explicitly denies all traffic)
3. The policy targets only pods matching the selector labels
4. After the specified duration, the NetworkPolicy is deleted, restoring normal traffic

## Configuration

This scenario can be configured with parameters that control which pods are affected, 
what traffic is blocked, and how long the outage lasts. See the implementation-specific 
pages for detailed configuration:

- [Configuration with Krkn](./application-outage-krkn.md#configuration-parameters)
- [Configuration with Krkn-hub](./application-outages-krkn-hub.md#configuration)


### Requirements

- A working Kubernetes/OpenShift cluster
- kubectl/oc CLI tools configured
- NetworkPolicy support in your cluster
- Access to create and delete NetworkPolicies in the target namespace

### Monitoring and Validation

During the scenario run, you can:

1. Verify the NetworkPolicy creation:
   ```bash
   kubectl get networkpolicy -n <namespace>
   ```

2. Test connectivity is blocked:
   ```bash
   kubectl run -i --rm test-pod --image=busybox --restart=Never -n <namespace> -- wget -T 5 -O- <service-name>
   ```

3. Monitor application logs and metrics to observe impact.

After the duration expires, verify the NetworkPolicy is removed and traffic is restored.

## Troubleshooting

- Verify that the NetworkPolicy is created and deleted as expected with:
  ```
  kubectl get networkpolicy -n <namespace>
  ```
- Check application logs for connectivity issues during the test period
- Ensure the pod selector matches the intended pods
- If you see errors about empty pod selectors, make sure to specify at least one label in your pod_selector

## Manual Recovery

In case the scenario exits prematurely without cleaning up, you can manually delete the NetworkPolicy:

```bash
kubectl delete networkpolicy/krkn-deny-* -n <targeted-namespace>
```

## Demo

You can find a link to a demo of the scenario [here](https://asciinema.org/a/452403?speed=3&theme=solarized-dark)