---
title: User Management
description: Manage groups and users on the platform
weight: 2
---

# User Management <span class="krkn-badge krkn-badge--admin">Admin</span>

Organize users through groups that define cluster access and permissions. The group is the central unit of the permission model — users inherit all capabilities from their assigned group.

<div class="krkn-video">
  <div class="krkn-video__placeholder">
    <p>Video: <strong>User & Group Management Walkthrough</strong></p>
    <p class="krkn-video__duration">~3 min</p>
  </div>
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
| **Read** | View jobs and execution results |
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
  ├── Permissions: Read, Run
  └── Members: alice, bob
        │
        ├── alice → can run scenarios on production-us, production-eu
        └── bob   → can run scenarios on production-us, production-eu
```
