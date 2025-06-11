---
title: Application Outage Scenarios with Krkn
description: Blocking traffic to applications with Krkn
date: 2017-01-04
---

## Using Application Outage Scenarios with Krkn

The Application Outage scenario plugin enables simulating network connectivity issues for specific pods by creating temporary NetworkPolicies that block traffic.

### Sample Scenario File

Create a scenario file (e.g., `app_outage.yaml`) with the following content:

```yaml
application_outage:
  namespace: "app-namespace"  # Namespace containing your application
  pod_selector:               # Target specific pods with these labels
    app: backend
    tier: database
  block:                      # Traffic types to block
    - Ingress                 # Block only incoming traffic
    # - Egress                # Uncomment to also block outgoing traffic
  duration: 120               # Block for 2 minutes
```

### Configuration Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| namespace | string | Namespace where the NetworkPolicy will be applied | (Required) |
| pod_selector | dict | Pod selector labels for the NetworkPolicy (matchLabels) - must contain at least one key-value pair | (Required) |
| block | list | Traffic types to block (`Ingress`, `Egress`, or both) | [Ingress, Egress] |
| duration | int | Duration in seconds to keep traffic blocked | 60 |

> **Important**: The `pod_selector` parameter must be a non-empty dictionary of Kubernetes labels to select target pods. 
> A NetworkPolicy with an empty pod selector would apply to all pods in the namespace, which is not supported by this plugin.

### Adding to Krkn Configuration

Add this scenario to your Krkn configuration file:

```yaml
kraken:
  chaos_scenarios:
    - application_outages_scenarios:
        - scenarios/app_outage.yaml
```

### How It Works

1. The plugin creates a NetworkPolicy in the specified namespace with the given pod selector
2. The NetworkPolicy is configured with empty ingress/egress rules (which explicitly denies all traffic)
3. The policy targets only pods matching the selector labels
4. After the specified duration, the NetworkPolicy is deleted, restoring normal traffic

### Testing

#### Unit Tests

To run the unit tests for the application outage plugin:

```bash
# Run only the application outage tests
python -m unittest tests/application_outage_test.py

# Run all tests with coverage
python -m coverage run -m unittest discover -s tests/
python -m coverage report -m
```

#### Integration Tests

For testing with Kubernetes:

1. Set up a test configuration file:

```yaml
# Save this as test-config.yaml in your Kraken root directory
kraken:
  chaos_scenarios:
    - application_outages_scenarios:
        - /krkn/test_app_outage.yaml  # Full path to your scenario file
  kubeconfig_path: ~/.kube/config

tunings:
  wait_duration: 10
  iterations: 1
  daemon_mode: False

cerberus:
  cerberus_enabled: False
```

2. Create a test scenario:

```yaml
# Save this as test_app_outage.yaml in your Kraken root directory
application_outage:
  namespace: "default"                # Namespace containing your application pods
  pod_selector:                       # Target specific pods with these labels
    app: your-app-name                # Required: at least one label must be specified
    component: your-component         # Optional: add more labels for more specific targeting
  block:
    - Ingress                         # Block incoming traffic
    # - Egress                        # Uncomment to also block outgoing traffic
  duration: 30                        # Duration in seconds before traffic is restored
```

3. Run the integration test:

```bash
# Run through Kraken
python run_kraken.py --config test-config.yaml
```

### Manual Testing

To test the network policy creation and traffic blocking:

1. Create a test deployment:
```bash
kubectl create deployment nginx-test --image=nginx
kubectl label deployment nginx-test app=nginx test-selector=true
kubectl expose deployment nginx-test --port=80 --name=nginx-service
```

2. Verify initial connectivity:
```bash
kubectl run -i --rm test-pod --image=busybox --restart=Never -- wget -O- nginx-service
```

3. Run the application outage scenario
4. Verify connectivity is blocked during the outage
5. After the duration expires, verify connectivity is restored:
```bash
kubectl run -i --rm test-pod --image=busybox --restart=Never -- wget -O- nginx-service
```

### Troubleshooting

- Verify that the NetworkPolicy is created and deleted as expected with:
  ```
  kubectl get networkpolicy -n <namespace>
  ```
- Check application logs for connectivity issues during the test period
- Ensure the pod selector matches the intended pods
- If you see errors about empty pod selectors, make sure to specify at least one label in your pod_selector

### Manual Recovery

In case the scenario exits prematurely without cleaning up, you can manually delete the NetworkPolicy:

```bash
kubectl delete networkpolicy/krkn-deny-* -n <targeted-namespace>
```
