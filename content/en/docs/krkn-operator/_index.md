---
title: Krkn Operator
linkTitle: Krkn Operator
weight: 8
description: >
  A Kubernetes-native platform for orchestrating Chaos Engineering experiments through a web interface.
---

Krkn Operator is a Kubernetes-native platform to deploy, configure and orchestrate Chaos Engineering experiments through a web console. Instead of manually executing scenarios, the Operator provides a complete platform to manage users, clusters, permissions and experiment execution from a single place.

---

## Personas

The platform defines two roles with different access levels.

### Admin

Full access to the platform. Administrators configure the infrastructure that users operate on.

- Register and remove target **clusters**
- Create **groups** with cluster access and permissions
- Create **users** and assign them to groups
- Configure **private registries** and their visibility
- Configure **target providers** (e.g. ACM integration)
- All operational features available to users

### User

Operational access scoped by group membership. Every user must belong to a group — the group determines which clusters, registries and features are accessible.

- View and manage **jobs** (based on View/Delete permissions)
- Use the **cluster terminal** (requires Run permission)
- **Run scenarios** on assigned clusters (requires Run permission)
- Design workflows in **Chaos Studio** (requires Run permission)
- Upload and manage **files** (scoped by group visibility)

{{% notice info %}}
Users only see jobs from their own group. A cluster-wide indicator shows the names of running scenarios across all groups, but no details.
{{% /notice %}}

---

## Permission Model

```text
        Admin
          │
    Creates Groups
          │
    ┌─────┴──────┐
    │             │
  Group A      Group B
    │             │
  Clusters     Clusters
  Permissions  Permissions
  (View,Run,   (View)
   Delete)
    │             │
  Users        Users
```

Permissions are assigned at the group level:

| Permission | Grants |
|------------|--------|
| **View** | View jobs and execution results |
| **Run** | Execute scenarios, use Chaos Studio, access cluster terminal |
| **Delete** | Remove jobs and execution history |

---

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Cluster Management | Register and manage target Kubernetes clusters |
| User & Group Management | Organize users through groups with granular permissions |
| Private Registries | Configure private container registries with group-based visibility |
| Chaos Studio | Design reusable visual workflows with serial and parallel execution |
| Multi-cluster Execution | Run experiments on one or more clusters simultaneously |
| Resiliency Score | Measure application resilience using PromQL-based metrics |
| Jobs | Monitor experiment progress and inspect execution logs |
| Cluster Terminal | Explore managed clusters using read-only kubectl and oc commands |
| File Management | Store reusable configuration files and PromQL queries |
| Provider Configuration | Configure target providers (ACM/OCM integration) |

---

## Compatibility

- Kubernetes
- OpenShift
- Open Cluster Management (OCM)
- Red Hat Advanced Cluster Management (ACM)

---

## Next Steps

- [Installation](installation/) — Deploy Krkn Operator with Helm
- [Administration](administration/) — Configure clusters, users, registries and providers
- [Usage](usage/) — Run scenarios, use Chaos Studio, manage jobs
