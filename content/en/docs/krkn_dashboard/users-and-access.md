---
title: Users, groups, and access control
linkTitle: Users and access
description: Platform roles, groups, group roles, and cluster permissions in the Krkn Dashboard.
weight: 5
---

The dashboard uses platform roles, groups, group roles, and cluster policies to restrict access.

---

## Platform roles

| Role | Capabilities |
|------|----------------|
| **Admin** | Full control: create users, manage groups and membership, view the audit trail for all users, see all runs. This is done in the **Administration** tab. When managing groups, kubeconfigs, and users, required fields are marked. |
| **User** | Run experiments, view past runs, manage their account, upload kubeconfigs for their groups. Users cannot create users or assign people to groups. |

Platform admins also have the **Administration** item in the side menu. Platform users use **Account Settings** for their profile, password, and group kubeconfig uploads.

---

## Groups

Teams are organized into **groups**. Past runs and kubeconfigs always belong to a group, not a private user list. A user only sees runs for groups he or she is part of. Replaying a run by default uses the original run’s group.

On first startup with an empty database, the server creates a **`default-group`** and places the initial platform admin in that group.

### Group roles

| Group role | Capabilities |
|------------|----------------|
| **Group viewer** | Only observe current or past runs. |
| **Group user** | Run, view, and cancel runs on top of the viewer role’s capabilities. |
| **Group admin** | Manage that group’s policies and kubeconfigs on top of the user role’s abilities. |

**Important:** Platform **User** accounts can only be a **group user** or **group viewer**, not **group admin**. Only platform **Admin** accounts may be assigned the **group admin** role.

Group admins manage their group from **Account Settings** → **Manage group** (policies and kubeconfigs for that group). Platform admins manage all groups, users, and kubeconfigs from **Administration**.

---

## Cluster permissions

Each group has **policies** per cluster. A policy grants one of these permissions for a cluster key (the API server URL from the kubeconfig):

| Permission | Meaning |
|------------|---------|
| **view** | See runs and data for that cluster. |
| **run** | Start chaos runs (includes view). |
| **cancel** | Cancel runs (includes run and view). |
| **admin** | Full policy management for that cluster (includes cancel, run, and view). |

Policies are assigned to **groups** in **Administration** (platform admins) or on **Manage group** (group admins). A user must be a member of the group, have a group role that allows the action, and have a matching cluster policy for the kubeconfig’s cluster key.

Platform admins bypass group and policy checks for authorization.

---

## Kubeconfigs

- **Platform admins** can upload and manage kubeconfigs for any group in **Administration**.
- **Group members** can upload kubeconfigs for groups they belong to under **Account Settings**.
- **Group admins** can rename or delete kubeconfigs for their group on **Manage group**.

When you start a run, the dashboard checks that your group has the right cluster policy for the selected kubeconfig.

---

## Audit trail

Platform admins can open the **Audit** tab under **Administration** to review actions across users (sign-ins, administration changes, and related events).

---

## Account settings

All signed-in users can open **Account Settings** from the side menu to:

- Change their password
- Upload kubeconfigs for groups they belong to
- Open **Manage group** for groups where they are a **group admin**

---

## Related documentation

- [Install Krkn Dashboard](/docs/installation/krkn-dashboard/) — first-time initial admin username and password
- [Using the UI](/docs/krkn_dashboard/using-the-ui/) — Run Kraken, Past Runs, and Elastic Runs
