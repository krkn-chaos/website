---
title: Cluster Management
description: Register and manage target Kubernetes clusters
weight: 1
---

# Cluster Management <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Register target Kubernetes clusters for chaos scenario execution. Krkn Operator runs on a management cluster and executes scenarios against registered targets; it does not run scenarios against itself.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/3zf14bN_8zc" title="Cluster Management Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Operations

| Operation | Description |
|-----------|-------------|
| **Add Cluster** | Register a new target cluster by providing its name and kubeconfig |
| **View Clusters** | Browse all registered clusters and their status |
| **Delete Cluster** | Remove a cluster from the platform |

Once registered, clusters become available for assignment to groups through [User Management](../user-management/).

![Add New Target](/images/krkn-operator/add-new-target.png)

![Target Clusters](/images/krkn-operator/targets.png)
