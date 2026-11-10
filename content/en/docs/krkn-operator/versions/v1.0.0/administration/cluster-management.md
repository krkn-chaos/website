---
title: Cluster Management
description: Register and manage target Kubernetes clusters
weight: 1
operator_docs_version: v1.0.0
operator_docs_page_key: administration/cluster-management
---

# Cluster Management <a href="/docs/krkn-operator/versions/v1.0.0/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Register target Kubernetes clusters that will be available for chaos scenario execution. The operator runs on a control plane cluster and executes scenarios against registered targets — it never runs chaos against itself.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/dSaA1BTQQBc" title="Cluster Management Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<p class="krkn-operator-docs-video-caption">This walkthrough is retained with v1.0.0 documentation and may show an earlier interface.</p>
</div>

---

## Operations

| Operation | Description |
|-----------|-------------|
| **Add Cluster** | Register a new target cluster by providing its name and kubeconfig |
| **View Clusters** | Browse all registered clusters and their status |
| **Delete Cluster** | Remove a cluster from the platform |

Once registered, clusters become available for assignment to groups through [User Management](../user-management/).

![Add New Target](/operator-docs/v1.0.0/images/krkn-operator/add-new-target.png)

![Target Clusters](/operator-docs/v1.0.0/images/krkn-operator/targets.png)
