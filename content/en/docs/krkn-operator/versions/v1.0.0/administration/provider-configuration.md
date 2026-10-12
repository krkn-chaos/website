---
title: Provider Configuration
description: Configure target providers for cluster discovery
weight: 4
operator_docs_version: v1.0.0
operator_docs_page_key: administration/provider-configuration
---

# Provider Configuration <a href="/docs/krkn-operator/versions/v1.0.0/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Configure target providers that integrate with external cluster management platforms. The provider configuration interface adapts dynamically based on the selected provider.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/MPd9beJWrzY" title="Provider Configuration Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<p class="krkn-operator-docs-video-caption">This walkthrough is retained with v1.0.0 documentation and may show an earlier interface.</p>
</div>

---

## Supported Providers

| Provider | Description |
|----------|-------------|
| **ACM / OCM** | Automatically discover and synchronize managed Kubernetes clusters through Red Hat Advanced Cluster Management or Open Cluster Management |

![ACM Provider Configuration](/operator-docs/v1.0.0/images/krkn-operator/provider-configuration-acm.png)

{{% notice info %}}
The provider configuration interface is designed to be extensible. As new integration operators are developed, their configuration panels will appear automatically in this section.
{{% /notice %}}

---

## Cloud Provider Configuration

Some chaos scenarios interact directly with cloud infrastructure and require cloud provider credentials (AWS, GCP, Azure, OpenStack, etc.) to perform node-level operations. The following scenarios are not currently available in Krkn Operator until cloud provider configuration support is added:

| Scenario | Why Cloud Provider Is Required |
|----------|-------------------------------|
| **node-scenarios** | Stops, terminates, or reboots nodes via the cloud provider API |
| **node-scenarios-bm** | Controls bare metal nodes via BMC/IPMI credentials |
| **power-outages** | Shuts down and restarts the entire cluster through the cloud provider |
| **zone-outages** | Simulates availability zone failures by manipulating cloud network resources |

{{% notice warning %}}
Cloud provider configuration is [not yet supported](https://github.com/krkn-chaos/krkn-operator/issues/43) in Krkn Operator. The scenarios above cannot be executed until cloud provider credential management is introduced. This page will be updated when that support becomes available.
{{% /notice %}}
