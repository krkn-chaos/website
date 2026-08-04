---
title: Installation
description: Install Krkn Operator using Helm
weight: 1
custom_js: ["/js/krkn-operator-version.js"]
---

# Installation <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Deploy Krkn Operator on Kubernetes or OpenShift using Helm.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/3pIL-afzIN0" title="Installation Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Prerequisites

- **Kubernetes 1.19+** or **OpenShift 4.x**
- **Helm 3.0+**

---

## Quick Start

**Latest Version:** <code id="krkn-operator-version" style="color: var(--krkn-primary);">loading...</code>

```bash
helm install krkn-operator oci://quay.io/krkn-chaos/charts/krkn-operator \
  --version <VERSION> \
  --namespace krkn-operator-system \
  --create-namespace
```

Verify:

```bash
kubectl get pods -n krkn-operator-system -l app.kubernetes.io/name=krkn-operator
```

Access the console (local):

```bash
kubectl port-forward -n krkn-operator-system svc/krkn-operator-console 3000:3000
```

---

## Production Installation

Choose the method that matches your environment:

| Method | External Access |
|--------|----------------|
| **Kubernetes** | Gateway API (recommended) or Ingress |
| **OpenShift** | Routes (native) |

Install with a custom `values.yaml`:

```bash
helm install krkn-operator oci://quay.io/krkn-chaos/charts/krkn-operator \
  --version <VERSION> \
  --namespace krkn-operator-system \
  --create-namespace \
  -f values.yaml
```

### Kubernetes with Gateway API

```yaml
console:
  enabled: true
  gateway:
    enabled: true
    gatewayName: krkn-gateway
    hostname: krkn.example.com
    path: /
    pathType: PathPrefix
```

### Kubernetes with Ingress

```yaml
console:
  enabled: true
  ingress:
    enabled: true
    className: nginx
    hostname: krkn.example.com
    tls:
      - secretName: krkn-tls
        hosts:
          - krkn.example.com
```

### OpenShift with Routes

```yaml
console:
  enabled: true
  route:
    enabled: true
    hostname: krkn.apps.cluster.example.com
    tls:
      enabled: true
      termination: edge
      insecureEdgeTerminationPolicy: Redirect
```

{{% notice info %}}
**OpenShift Security**: The chart automatically detects OpenShift and configures the required Security Context Constraints (SCC). No manual SCC configuration is needed.
{{% /notice %}}

---

## OCM/ACM Integration

Enable automatic cluster discovery through [Open Cluster Management (OCM)](https://open-cluster-management.io/) or [Red Hat Advanced Cluster Management (ACM)](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/):

See the [OCM/ACM Compatibility](/docs/krkn-operator/compatibility/) page for tested versions.

```bash
helm install krkn-operator oci://quay.io/krkn-chaos/charts/krkn-operator \
  --version <VERSION> \
  --namespace krkn-operator-system \
  --create-namespace \
  --set acm.enabled=true
```

---

## Upgrade

```bash
helm upgrade krkn-operator oci://quay.io/krkn-chaos/charts/krkn-operator \
  --version <VERSION> \
  --namespace krkn-operator-system \
  -f values.yaml
```

## Uninstall

```bash
helm uninstall krkn-operator --namespace krkn-operator-system
```

{{% notice warning %}}
CRDs are preserved after uninstall to prevent data loss. To remove them manually:
```bash
kubectl delete crds -l app.kubernetes.io/name=krkn-operator
```
{{% /notice %}}

---

## Complete values.yaml Reference

<details>
<summary>Click to expand the full values.yaml reference</summary>

```yaml
namespaceOverride: ""

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
    level: info
    format: json
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

acm:
  enabled: false
  image: quay.io/krkn-chaos/krkn-operator-acm:latest
  replicaCount: 1
  config:
    secretName: "application-manager"
  service:
    port: 8080
    grpcPort: 50051
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

console:
  enabled: true
  image: quay.io/krkn-chaos/console:latest
  replicaCount: 1
  service:
    type: ClusterIP
    port: 3000
    nodePort: null
  ingress:
    enabled: false
    className: nginx
    hostname: krkn.example.com
    annotations: {}
    tls: []
  gateway:
    enabled: false
    gatewayName: krkn-gateway
    gatewayNamespace: ""
    sectionName: ""
    hostname: krkn.example.com
    path: /
    pathType: PathPrefix
    annotations: {}
  route:
    enabled: false
    hostname: ""
    tls:
      termination: edge
  resources:
    requests:
      cpu: 50m
      memory: 64Mi
    limits:
      cpu: 200m
      memory: 256Mi
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  nodeSelector: {}
  tolerations: []
  affinity: {}

pullSecrets: []

auth:
  jwtSecret: ""
  jwtExpiryHours: 24

rbac:
  create: true

serviceAccount:
  create: true
  name: ""
  annotations: {}

crds:
  keep: true

monitoring:
  enabled: false
  service:
    port: 8443
  serviceMonitor:
    enabled: false
    interval: 30s

networkPolicy:
  enabled: false
  ingress: []
  egress: []

updateStrategy:
  type: RollingUpdate

podDisruptionBudget:
  enabled: false
  minAvailable: 1

commonLabels: {}
commonAnnotations: {}
nameOverride: ""
fullnameOverride: ""
```

</details>
