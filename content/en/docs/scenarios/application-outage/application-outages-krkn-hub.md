---
title: Application Outage Scenarios with Krkn-hub
description: Using Application Outage scenarios with Krkn-hub containers
date: 2017-01-04
---

## Using Application Outage Scenarios with Krkn-hub

Krkn-hub offers a containerized version of the Application Outage scenario that can be easily run with environment variables to configure the scenario parameters.

### Configuration

The Application Outage scenario in Krkn-hub can be configured using the following environment variables:

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| NAMESPACE | Namespace where the NetworkPolicy will be applied | (Required) |
| POD_SELECTOR | Pod selector labels in JSON format (e.g., `{"app":"nginx"}`) | (Required) |
| BLOCK_TRAFFIC_TYPE | Traffic types to block, can include "Ingress", "Egress", or both | [Ingress, Egress] |
| DURATION | Duration in seconds to keep traffic blocked | 60 |
| WAIT_DURATION | Wait time between iterations in seconds | 60 |
| ITERATIONS | Number of times to execute the scenario | 1 |
| DAEMON_MODE | If set to True, scenario runs indefinitely | False |

### Running with Docker

```bash
docker run --name=app-outage --net=host \
  -v ~/.kube/config:/root/.kube/config:Z \
  -e NAMESPACE="default" \
  -e POD_SELECTOR="{app: nginx}" \
  -e BLOCK_TRAFFIC_TYPE="[Ingress]" \
  -e DURATION="120" \
  -e WAIT_DURATION="60" \
  -e ITERATIONS="1" \
  -d quay.io/krkn-chaos/krkn-hub:application-outages
```

### Running with Podman

```bash
podman run --name=app-outage --net=host \
  -v ~/.kube/config:/root/.kube/config:Z \
  -e NAMESPACE="default" \
  -e POD_SELECTOR="{app: nginx}" \
  -e BLOCK_TRAFFIC_TYPE="[Ingress]" \
  -e DURATION="120" \
  -e WAIT_DURATION="60" \
  -e ITERATIONS="1" \
  -d quay.io/krkn-chaos/krkn-hub:application-outages
```

### Viewing Logs

To view the logs of a running container:

```bash
# For Docker
docker logs -f app-outage

# For Podman
podman logs -f app-outage
```

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

# For Podman
podman logs -f app-outage
```
