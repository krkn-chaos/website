---
title: Krkn Operator
linkTitle: Krkn Operator
weight: 8
description: >
  A Kubernetes-native platform for orchestrating Chaos Engineering experiments through a web interface.
---

Krkn Operator is a Kubernetes-native platform to deploy, configure and orchestrate Chaos Engineering experiments through a web console. Instead of manually executing scenarios, the Operator provides a complete platform to manage users, clusters, permissions and experiment execution from a single place.

---

## Multi-Cluster Chaos Testing

Multi-cluster execution is a core capability of the platform. Every chaos scenario can target one or more clusters simultaneously, regardless of how those clusters were registered:

- **Manual targets** — clusters registered directly by an administrator through the web console
- **OCM/ACM discovery** — clusters discovered automatically through Open Cluster Management or Red Hat Advanced Cluster Management

Both methods produce the same unified cluster pool. When executing a scenario, users select any combination of available targets and the platform runs the experiment in parallel across all of them. This enables cross-environment resilience testing (dev, staging, production), regional failover validation, and multi-tenant chaos campaigns — all from a single execution.

{{% notice info %}}
**Multi-cluster is always available.** OCM/ACM integration is optional and adds automatic cluster discovery, but multi-cluster execution works identically with manually registered targets. No external cluster management platform is required.
{{% /notice %}}

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

Permissions are assigned at the group level and determine what users can do on clusters accessible to their group.

### View {#permission-view}

<span class="krkn-badge krkn-badge--view">View</span>

Allows users to see jobs and their execution results. Users with this permission can inspect single run outcomes, console logs, graph run nodes, and Resiliency Scores — but cannot execute or delete anything.

**Applies to:** [Jobs](/docs/krkn-operator/usage/jobs/)

### Run {#permission-run}

<span class="krkn-badge krkn-badge--run">Run</span>

Allows users to execute chaos experiments on the clusters assigned to their group. This includes running single scenarios, designing and executing Chaos Studio workflows, and accessing the cluster terminal for read-only inspection.

**Applies to:** [Run Scenarios](/docs/krkn-operator/usage/run-scenarios/) · [Chaos Studio](/docs/krkn-operator/usage/chaos-studio/) · [Cluster Terminal](/docs/krkn-operator/usage/cluster-terminal/)

### Delete {#permission-delete}

<span class="krkn-badge krkn-badge--delete">Delete</span>

Allows users to remove completed jobs and their execution history. Without this permission, jobs remain visible but cannot be deleted.

**Applies to:** [Jobs](/docs/krkn-operator/usage/jobs/)

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

See the [Compatibility Matrix](compatibility/) for tested ACM/OCM versions and platform details.

---

## Next Steps

- [Installation](installation/) — Deploy Krkn Operator with Helm
- [Administration](administration/) — Configure clusters, users, registries and providers
- [Usage](usage/) — Run scenarios, use Chaos Studio, manage jobs
- [Compatibility Matrix](compatibility/) — Supported platforms and ACM/OCM versions
