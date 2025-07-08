---
title: Krkn RBAC
description: RBAC Authorization rules required to run Krkn scenarios.
weight: 2
---

# RBAC Configurations

Krkn supports two types of RBAC configurations:

1. **Non-Privileged RBAC**: Provides namespace-scoped permissions for scenarios that only require access to resources within a specific namespace.
2. **Privileged RBAC**: Provides cluster-wide permissions for scenarios that require access to cluster-level resources like nodes.

> **_NOTE:_** The examples below use placeholders such as `target-namespace` and `krkn-namespace` which should be replaced with your actual namespaces. The service account name `krkn-sa` is also a placeholder that you can customize.

## RBAC YAML Files

### Non-Privileged Role

The non-privileged role provides permissions limited to namespace-scoped resources:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: krkn-non-privileged-role
  namespace: <target-namespace>
rules:
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch", "create", "delete"]
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "watch", "create", "delete"]
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create", "delete"]
```

### Non-Privileged RoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: krkn-non-privileged-rolebinding
  namespace: <target-namespace>
subjects:
- kind: ServiceAccount
  name: <krkn-sa>
  namespace: <target-namespace>
roleRef:
  kind: Role
  name: krkn-non-privileged-role
  apiGroup: rbac.authorization.k8s.io
```

### Privileged ClusterRole

The privileged ClusterRole provides permissions for cluster-wide resources:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: krkn-privileged-clusterrole
rules:
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch", "create", "delete", "update", "patch"]
- apiGroups: [""]
  resources: ["pods", "services"]
  verbs: ["get", "list", "watch", "create", "delete", "update", "patch"]
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets"]
  verbs: ["get", "list", "watch", "create", "delete", "update", "patch"]
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create", "delete", "update", "patch"]
```

### Privileged ClusterRoleBinding

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: krkn-privileged-clusterrolebinding
subjects:
- kind: ServiceAccount
  name: <krkn-sa>
  namespace: <krkn-namespace>
roleRef:
  kind: ClusterRole
  name: krkn-privileged-clusterrole
  apiGroup: rbac.authorization.k8s.io
```

## How to Apply RBAC Configuration

1. Customize the namespace in the YAML files:
   - Replace `target-namespace` with the namespace where you want to run Krkn scenarios
   - Replace `krkn-namespace` with the namespace where Krkn itself is deployed

2. Create a service account for Krkn:
   ```bash
   kubectl create serviceaccount krkn-sa -n <namespace>
   ```

3. Apply the RBAC configuration:
   ```bash
   # For non-privileged access
   kubectl apply -f rbac/non-privileged-role.yaml
   kubectl apply -f rbac/non-privileged-rolebinding.yaml
   
   # For privileged access
   kubectl apply -f rbac/privileged-clusterrole.yaml
   kubectl apply -f rbac/privileged-clusterrolebinding.yaml
   ```

## OpenShift-specific Configuration

For OpenShift clusters, you may need to grant the privileged Security Context Constraint (SCC) to the service account:

```bash
oc adm policy add-scc-to-user privileged -z krkn-sa -n <namespace>
```

## Krkn Scenarios and Required RBAC Permissions

The following table lists the available Krkn scenarios and their required RBAC permission levels:

| Scenario Type | Plugin Type | Required RBAC | Description |
|---------------|-------------|--------------|-------------|
| pod_disruption_scenarios | Namespace | Non-Privileged | Scenarios that disrupt or kill pods |
| container_scenarios | Namespace | Non-Privileged | Scenarios that affect containers |
| service_disruption_scenarios | Namespace | Non-Privileged | Scenarios that disrupt services |
| application_outages_scenarios | Namespace | Non-Privileged | Scenarios that cause application outages |
| pvc_scenarios | Namespace | Non-Privileged | Scenarios that affect persistent volume claims |
| pod_network_scenarios | Namespace | Non-Privileged | Scenarios that affect pod network connectivity |
| service_hijacking_scenarios | Namespace | Non-Privileged | Scenarios that hijack services |
| node_scenarios | Cluster | Privileged | Scenarios that affect nodes |
| zone_outages_scenarios | Cluster | Privileged | Scenarios that simulate zone outages |
| time_scenarios | Cluster | Privileged | Scenarios that manipulate system time |
| hog_scenarios | Cluster | Privileged | Scenarios that consume resources |
| cluster_shut_down_scenarios | Cluster | Privileged | Scenarios that shut down the cluster |
| network_chaos_scenarios | Cluster | Privileged | Scenarios that cause network chaos |
| network_chaos_ng_scenarios | Cluster | Privileged | Next-gen network chaos scenarios |
| syn_flood_scenarios | Cluster | Privileged | SYN flood attack scenarios |

**_NOTE:_** Grant the privileged SCC to the user running the pod, to execute all the below krkn testscenarios
```
oc adm policy add-scc-to-user privileged user1
```