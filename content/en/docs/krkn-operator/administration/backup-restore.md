---
title: Backup and Restore
description: Back up and restore Krkn Operator configuration state
weight: 7
---

# Backup and Restore <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

The Krkn Operator includes a built-in backup and restore feature accessible from the web console. Backups contain portable operator configuration for:

- **Admin settings**
- **Cluster targets**
- **Users and groups**
- **Private registries**
- **Elasticsearch configuration**

The backup also includes the operator-managed secrets required for these settings.

This feature is not a complete Kubernetes or cluster backup. It does not include runtime registration objects, ACM integration data, uploaded files, file metadata, or the JWT signing key.

---

## Creating a Backup

1. Navigate to the **Backup & Restore** card in the console.
2. Click **Download Backup**.
3. The operator creates a compressed `.tar.gz` archive and saves it to your local machine.

{{% notice warning %}}
**Security:** Backup archives contain sensitive configuration data, including target connection details and operator-managed credentials. Store backups securely and restrict access to authorized administrators.
{{% /notice %}}

---

## Restoring from a Backup

1. Open the **Backup & Restore** card in the console.
2. Click **Upload & Restore**.
3. Select a previously downloaded `.tar.gz` backup archive and confirm the restore.
4. Monitor the restore progress from the same page.

Only one restore can run at a time. The maximum upload size is 100 MB.

The restore runs asynchronously. Existing resources are updated with the corresponding configuration from the backup, while resources that do not exist are created. Resources absent from the backup are not deleted.

After the restore completes, the operator refreshes the connectivity status of restored target clusters.

{{% notice warning %}}
Restoring a backup changes the current operator configuration. Before restoring an older archive, create a backup of the current state.
{{% /notice %}}

---

## Restore Status

Restore status is available from the same page and can be:

- **In progress**
- **Completed**
- **Failed**

Restore job status is held in memory and is not persisted across operator restarts.