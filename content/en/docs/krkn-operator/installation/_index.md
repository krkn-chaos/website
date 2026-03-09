---
title: Installation
description: Install krkn-operator using Helm
weight: 1
---

This guide walks you through installing krkn-operator using Helm, the recommended installation method.

## Prerequisites

- **Kubernetes 1.19+** or **OpenShift 4.x**
- **Helm 3.0+**
- A Kubernetes cluster (kind, minikube, or production cluster)

## Quick Start (kind/minikube)

Perfect for testing and local development, this minimal installation gets krkn-operator running quickly on kind or minikube.

### 1. Add the Helm Repository

```bash
helm repo add krkn-operator https://krkn-chaos.github.io/charts
helm repo update
```

### 2. Install krkn-operator

```bash
helm install krkn-operator krkn-operator/krkn-operator
```

This installs krkn-operator with default settings in the current namespace.

### 3. Verify Installation

```bash
kubectl get pods -l app.kubernetes.io/name=krkn-operator
```

Expected output:

```console
NAME                              READY   STATUS    RESTARTS   AGE
krkn-operator-xxxxxxxxx-xxxxx     2/2     Running   0          1m
```

### 4. Access the Console (Optional)

For local testing, use port-forwarding to access the web console:

```bash
kubectl port-forward svc/krkn-operator-console 3000:3000
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Installation

For production deployments, you'll want to customize the installation with a `values.yaml` file.

### Installation on Kubernetes

Create a `values.yaml` file:

```yaml
# Production values for Kubernetes

# Enable web console with Ingress
console:
  enabled: true
  ingress:
    enabled: true
    className: nginx  # or your ingress controller
    hostname: krkn.example.com
    annotations:
      cert-manager.io/cluster-issuer: letsencrypt-prod
    tls:
      - secretName: krkn-tls
        hosts:
          - krkn.example.com

# Operator configuration
operator:
  replicaCount: 2
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  logging:
    level: info
    format: json

# High availability
podDisruptionBudget:
  enabled: true
  minAvailable: 1

# Monitoring (if using Prometheus)
monitoring:
  enabled: true
  serviceMonitor:
    enabled: true
    interval: 30s
```

Install with your custom values:

```bash
helm install krkn-operator krkn-operator/krkn-operator \
  --namespace krkn-operator-system \
  --create-namespace \
  -f values.yaml
```

### Installation on OpenShift

OpenShift uses Routes instead of Ingress. Create an OpenShift-specific `values.yaml`:

```yaml
# Production values for OpenShift

# Enable web console with Route
console:
  enabled: true
  route:
    enabled: true
    hostname: krkn.apps.cluster.example.com
    tls:
      termination: edge

# Operator configuration
operator:
  replicaCount: 2
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault

# High availability
podDisruptionBudget:
  enabled: true
  minAvailable: 1
```

Install on OpenShift:

```bash
helm install krkn-operator krkn-operator/krkn-operator \
  --namespace krkn-operator-system \
  --create-namespace \
  -f values-openshift.yaml
```

---

## Advanced Configuration Options

### Enable ACM Integration

To enable Advanced Cluster Management (ACM) / Open Cluster Management (OCM) integration:

```yaml
acm:
  enabled: true
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 256Mi
```

Install with ACM enabled:

```bash
helm install krkn-operator krkn-operator/krkn-operator \
  --set acm.enabled=true \
  --namespace krkn-operator-system \
  --create-namespace
```

{{% notice info %}}
**ACM Integration**: When ACM is enabled, krkn-operator-acm will automatically discover and manage ACM-controlled clusters. See the [ACM Integration](../acm-integration/) guide for more details on configuration.
{{% /notice %}}

### Custom Namespace

Install in a custom namespace:

```bash
helm install krkn-operator krkn-operator/krkn-operator \
  --namespace my-chaos-platform \
  --create-namespace \
  --set namespaceOverride=my-chaos-platform
```

### Image Registry Override

If you're using a private registry or mirror:

```yaml
operator:
  image: myregistry.io/krkn-chaos/krkn-operator:v1.0.0
  pullPolicy: IfNotPresent

dataProvider:
  image: myregistry.io/krkn-chaos/data-provider:v1.0.0

pullSecrets:
  - name: my-registry-secret
```

### JWT Configuration

Customize JWT token settings for authentication:

```yaml
jwtSecret: bXktc2VjdXJlLWp3dC1rZXktYmFzZTY0LWVuY29kZWQ=  # Base64 encoded
jwtExpiryHours: 72  # 3 days
```

{{% notice warning %}}
**Security**: Always generate a secure, random JWT secret for production. Do not use default or predictable values.
{{% /notice %}}

---

## Complete values.yaml Reference

Here's a comprehensive `values.yaml` with all available options:

```yaml
# Namespace configuration
namespaceOverride: ""

# Image configuration
operator:
  image: quay.io/krkn-chaos/krkn-operator:latest
  pullPolicy: IfNotPresent
  enabled: true
  replicaCount: 1

  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi

  dataProvider:
    resources:
      requests:
        cpu: 50m
        memory: 64Mi
      limits:
        cpu: 200m
        memory: 256Mi

  service:
    type: ClusterIP
    port: 8080
    grpcPort: 50051

  logging:
    level: info  # debug, info, warn, error
    format: json  # json or text

  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault

  nodeSelector: {}
  tolerations: []
  affinity: {}
  extraEnv: []

dataProvider:
  image: quay.io/krkn-chaos/data-provider:latest

# ACM Integration (Optional)
acm:
  enabled: false
  image: quay.io/krkn-chaos/krkn-operator-acm:latest
  replicaCount: 1

  config:
    secretName: ""  # ACM cluster credentials secret

  service:
    port: 8081

  logging:
    level: info
    format: json

  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault

  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 200m
      memory: 256Mi

  nodeSelector: {}
  tolerations: []
  affinity: {}

# Web Console (Optional)
console:
  enabled: true
  image: quay.io/krkn-chaos/console:latest
  replicaCount: 1

  service:
    type: ClusterIP
    port: 3000
    nodePort: null  # Only for NodePort service type

  # Kubernetes Ingress
  ingress:
    enabled: false
    className: nginx
    hostname: krkn.example.com
    annotations: {}
    tls: []

  # OpenShift Route
  route:
    enabled: false
    hostname: ""
    tls:
      termination: edge  # edge, passthrough, or reencrypt

  resources:
    requests:
      cpu: 50m
      memory: 64Mi
    limits:
      cpu: 200m
      memory: 256Mi

  nodeSelector: {}
  tolerations: []
  affinity: {}

# Image pull secrets
pullSecrets: []

# JWT Authentication
jwtSecret: ""  # Base64 encoded; auto-generated if empty
jwtExpiryHours: 24

# RBAC
rbac:
  create: true

# Service Account
serviceAccount:
  create: true
  name: ""
  annotations: {}

# CRDs
crds:
  keep: true  # Keep CRDs after uninstall

# Monitoring
monitoring:
  enabled: false
  service:
    port: 8443
  serviceMonitor:
    enabled: false
    interval: 30s

# Network Policy
networkPolicy:
  enabled: false
  ingress: []
  egress: []

# Update Strategy
updateStrategy:
  type: RollingUpdate

# Pod Disruption Budget
podDisruptionBudget:
  enabled: false
  minAvailable: 1

# Common labels and annotations
commonLabels: {}
commonAnnotations: {}

# Naming
nameOverride: ""
fullnameOverride: ""
```

---

## Verification

After installation, verify all components are running:

```bash
# Check operator pods
kubectl get pods -n krkn-operator-system

# Check services
kubectl get svc -n krkn-operator-system

# Check CRDs
kubectl get crds | grep krkn

# View operator logs
kubectl logs -n krkn-operator-system -l app.kubernetes.io/name=krkn-operator -c manager
```

---

## Upgrading

To upgrade to a newer version:

```bash
helm repo update
helm upgrade krkn-operator krkn-operator/krkn-operator \
  --namespace krkn-operator-system \
  -f values.yaml
```

---

## Uninstalling

To remove krkn-operator:

```bash
helm uninstall krkn-operator --namespace krkn-operator-system
```

{{% notice warning %}}
**CRDs Persistence**: By default, Custom Resource Definitions (CRDs) are preserved after uninstallation to prevent data loss. To remove them manually:

```bash
kubectl delete crds -l app.kubernetes.io/name=krkn-operator
```
{{% /notice %}}

---

## Next Steps

- [Configure Target Clusters](../configuration/) - Set up target clusters for chaos testing
- [ACM Integration](../acm-integration/) - Enable Advanced Cluster Management integration
- [Create Your First Scenario](../scenarios/) - Start running chaos experiments
