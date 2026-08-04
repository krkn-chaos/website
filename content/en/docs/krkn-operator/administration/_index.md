---
title: Administration
description: Platform administration for Krkn Operator
weight: 2
---

# Administration <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Administrators configure the platform infrastructure that users operate on. This includes registering clusters, managing users and groups, setting up private registries and configuring target providers.

---

## Permission Model

The Admin creates **groups** that define what users can do on the platform. Each group specifies:

- Which **clusters** are accessible
- Which **permissions** are granted (View, Run, Delete)
- Which **registries** are visible

Users inherit all permissions from their assigned group.

```text
Admin creates Group
      │
      ├── Assigns Clusters (target-1, target-2, ...)
      ├── Assigns Permissions (View, Run, Delete)
      └── Assigns Registry Visibility
            │
            └── Users in this group inherit everything
```

{{% notice warning %}}
Every user **must** belong to a group. A user without a group has no access to the platform.
{{% /notice %}}

---

## Admin Features

| Feature | Description |
|---------|-------------|
| [Cluster Management](cluster-management/) | Register and remove target Kubernetes clusters |
| [User Management](user-management/) | Create groups and users, assign permissions |
| [Registry Management](registry-management/) | Configure private container registries and visibility |
| [Provider Configuration](provider-configuration/) | Configure target providers (ACM integration) |
