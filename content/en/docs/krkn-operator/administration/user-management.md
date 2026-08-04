---
title: User Management
description: Manage groups and users on the platform
weight: 2
---

# User Management <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Organize users through groups that define cluster access and permissions. The group is the central unit of the permission model — users inherit all capabilities from their assigned group.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/gCh4xj8KmP8" title="User & Group Management Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Groups

A group defines what its members can access and do on the platform.

| Field | Description |
|-------|-------------|
| **Name** | Group identifier |
| **Description** | Purpose of the group |
| **Cluster Permissions** | Which registered clusters this group can target |

Groups also receive permission flags that control what operations their members can perform:

| Permission | What it grants |
|------------|---------------|
| **View** | View jobs and execution results |
| **Run** | Execute scenarios, use Chaos Studio, access cluster terminal |
| **Delete** | Remove jobs and execution history |

---

## Users

Users are created and assigned to a group during creation.

| Field | Description |
|-------|-------------|
| **User Data** | Username, credentials |
| **Group** | The group this user belongs to |

{{% notice warning %}}
**Group assignment is mandatory.** Every user must belong to exactly one group. A user cannot be created without selecting a group. The group determines which clusters the user can target and which operations they can perform.
{{% /notice %}}

---

## Permission Cascade

```text
Group "SRE Team"
  ├── Clusters: production-us, production-eu
  ├── Permissions: View, Run
  └── Members: alice, bob
        │
        ├── alice → can run scenarios on production-us, production-eu
        └── bob   → can run scenarios on production-us, production-eu
```
