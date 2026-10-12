---
title: Installation
description: Install Krkn Operator using Helm
weight: 1
custom_js: ["/js/krkn-operator-version.js"]
---
<img referrerpolicy="no-referrer-when-downgrade" src="https://static.scarf.sh/a.png?x-pxid=8544b80d-373c-4c02-b2f7-e25d80b51854" alt="" width="1" height="1" style="position:absolute; width:1px; height:1px; opacity:0; pointer-events:none;" />

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
# Default values for krkn-operator
# This is a YAML-formatted file.

## Global settings
global:
  # Namespace where to install (if empty, uses Release.Namespace)
  namespaceOverride: ""
## Images configuration
# NOTE: Tags are automatically updated during release by CI/CD workflow
# - Operator & Data Provider: match the release tag (e.g., v0.4.3-beta)
# - ACM: frozen to latest stable ACM tag at release time
# - Console: frozen to latest stable Console tag at release time
# Local development: uses :latest tags for all components
images:
  operator:
    image: krkn-chaos.docker.scarf.sh/krkn-chaos/krkn-operator:v1.1.0-rc7
    pullPolicy: IfNotPresent
  dataProvider:
    image: krkn-chaos.docker.scarf.sh/krkn-chaos/krkn-operator-data-provider:v1.1.0-rc7
    pullPolicy: IfNotPresent
  acm:
    image: krkn-chaos.docker.scarf.sh/krkn-chaos/krkn-operator-acm:v1.1.0-rc3
    pullPolicy: IfNotPresent
  console:
    image: krkn-chaos.docker.scarf.sh/krkn-chaos/krkn-operator-console:v1.1.0-rc8
    pullPolicy: IfNotPresent
  pullSecrets: []
  # - name: my-registry-secret
## Authentication & Security
auth:
  # JWT secret for token signing (base64 encoded)
  # If empty, a random one is generated by Helm
  # To provide your own: echo -n "your-secret-key" | base64
  jwtSecret: ""
  # JWT token expiry in hours (default: 24)
  # Passed to operator as JWT_EXPIRY_HOURS environment variable
  jwtExpiryHours: 24
  # Trusted reverse-proxy / load-balancer networks (comma-separated CIDRs).
  # Passed to the operator as the TRUSTED_PROXY_CIDRS environment variable.
  #
  # The auth endpoints (/api/v1/auth/register, /login, /is-registered) are
  # rate-limited per client IP. When the operator sits behind an ingress,
  # reverse proxy, or load balancer, the direct connection address is the
  # proxy's, so every client would share a single rate-limit bucket. Setting
  # this to the proxy network(s) makes the operator read the real client IP
  # from the X-Forwarded-For / X-Real-IP headers — but ONLY when the request
  # actually arrives from one of these CIDRs.
  #
  # Leave empty (default) when the operator is reached directly: forwarding
  # headers are then ignored and the connection address is used, so clients
  # cannot spoof the rate-limit key. Only set this if you trust the listed
  # networks to set the forwarding headers correctly.
  #
  # Example: "10.0.0.0/8,192.168.0.0/16"
  trustedProxyCIDRs: ""
  # WebSocket Origin enforcement (comma-separated list of allowed origins).
  # Passed to the operator as the WEBSOCKET_ALLOWED_ORIGINS environment variable.
  #
  # There IS an optional Origin-based access control for WebSocket upgrades
  # (cluster terminal, live log streaming), but it is OPT-IN and OFF by default:
  #
  #   - Empty (default): all origins are accepted. This is safe because
  #     WebSocket connections authenticate with a JWT sent in the
  #     Sec-WebSocket-Protocol subprotocol (not browser cookies), so cross-site
  #     WebSocket hijacking (CSWSH) is not exploitable — a malicious page cannot
  #     read the origin-scoped token and therefore cannot connect.
  #   - Non-empty: enables enforcement. Only same-origin requests and the listed
  #     origins may open WebSocket connections. Use this as optional
  #     defense-in-depth when you want to pin the allowed browser origins.
  #
  # Note: enabling enforcement can reject legitimate traffic behind proxies that
  # rewrite the Host header, so only turn it on if you understand your ingress.
  #
  # Example: "https://console.example.com,http://localhost:3000"
  websocketAllowedOrigins: ""
## Core Operator
operator:
  enabled: true
  replicaCount: 1
  olmBootstrap: false
  olmOpenShift: false
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  # Data provider sidecar resources
  dataProvider:
    resources:
      requests:
        cpu: 50m
        memory: 128Mi
      limits:
        cpu: 200m
        memory: 256Mi
  service:
    type: ClusterIP
    port: 8080
    grpcPort: 50051
  logging:
    level: info # debug, info, warn, error
    format: json # json or text
  securityContext:
    runAsNonRoot: true
    seccompProfile:
      type: RuntimeDefault
  nodeSelector: {}
  tolerations: []
  affinity: {}
  extraEnv: []
## ACM Integration (optional)
acm:
  enabled: false
  replicaCount: 1
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi
  service:
    type: ClusterIP
    port: 8080
    grpcPort: 50051
  config:
    # Secret name for ACM managed clusters (must exist - created by OpenShift ACM)
    secretName: "application-manager"
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
## Console (web UI)
console:
  enabled: true
  replicaCount: 1
  resources:
    requests:
      cpu: 50m
      memory: 64Mi
    limits:
      cpu: 200m
      memory: 256Mi
  service:
    type: ClusterIP
    port: 3000
    # NodePort (only used if type: NodePort)
    nodePort: 30080
  # Ingress configuration (Kubernetes - legacy)
  ingress:
    enabled: false
    className: "nginx"
    hostname: "krkn-operator.example.com"
    hosts: [] # Legacy list of host/path mappings; takes precedence when non-empty.
    tls:
      enabled: false
      secretName: "" # If empty, uses hostname to generate name
    # Annotations (for cert-manager, AWS ALB, etc.)
    annotations: {}
    # cert-manager.io/cluster-issuer: letsencrypt-prod
    # kubernetes.io/ingress.class: alb
  # Gateway API configuration (Kubernetes - recommended)
  # Requires Gateway API CRDs installed in the cluster
  # See: https://gateway-api.sigs.k8s.io/
  gateway:
    enabled: false
    # Name of the existing Gateway resource to attach to
    gatewayName: "krkn-gateway"
    # Namespace of the Gateway (if different from release namespace)
    # Leave empty to use the same namespace
    gatewayNamespace: ""
    # Optional: Listener/Section name on the Gateway to attach to
    # Useful when Gateway has multiple listeners
    sectionName: ""
    # Hostname for the HTTPRoute
    hostname: "krkn-operator.example.com"
    # Path configuration
    path: "/"
    pathType: "PathPrefix" # PathPrefix, Exact, or ImplementationSpecific
    # Annotations for the HTTPRoute resource
    annotations: {}
  # OpenShift Route configuration
  route:
    enabled: false
    # Leave empty to let OpenShift generate the Route hostname. Set this
    # explicitly only when the cluster has a configured DNS name for it.
    hostname: ""
    host: "" # Legacy hostname fallback.
    tls:
      enabled: true
      termination: edge # edge, passthrough, reencrypt
      insecureEdgeTerminationPolicy: Redirect
    annotations: {}
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
## RBAC
rbac:
  create: true
  # OLM creates the scenario-runner resources during bootstrap because the
  # ServiceAccount namespace is chosen at installation time.
  scenarioRunner:
    create: true
## ServiceAccount
serviceAccount:
  create: true
  name: ""
  annotations: {}
## CRDs
crds:
  # Keep CRDs on chart uninstall
  keep: true
## Monitoring (optional)
monitoring:
  enabled: false # SAFE DEFAULT for Kind/Minikube
  service:
    port: 8443
    annotations: {}
  serviceMonitor:
    enabled: false
    interval: 30s
    scrapeTimeout: 10s
    labels: {}
## Network Policy (optional)
networkPolicy:
  enabled: false
  ingress: []
  egress: []
## Update strategy
updateStrategy:
  type: RollingUpdate
  rollingUpdate:
    maxUnavailable: 0
    maxSurge: 1
## Pod disruption budget (for HA)
podDisruptionBudget:
  enabled: false
  minAvailable: 1
## Common labels/annotations
commonLabels: {}
commonAnnotations: {}
## Name overrides
nameOverride: ""
fullnameOverride: ""
```

</details>
