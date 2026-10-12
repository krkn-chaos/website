---
title: Provider Configuration
description: Configure target providers for cluster discovery
weight: 4
---

# Provider Configuration <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Configure target providers that integrate with external cluster management platforms. The provider configuration interface adapts dynamically based on the selected provider.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/MPd9beJWrzY" title="Provider Configuration Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Supported Providers

| Provider | Description |
|----------|-------------|
| **ACM / OCM** | Automatically discover and synchronize managed Kubernetes clusters through Red Hat Advanced Cluster Management or Open Cluster Management |

![ACM Provider Configuration](/images/krkn-operator/provider-configuration-acm.png)

{{% notice info %}}
The provider configuration interface is designed to be extensible. As new integration operators are developed, their configuration panels will appear automatically in this section.
{{% /notice %}}

---

## Cloud Provider Configuration

Krkn Operator supports cloud scenarios that use saved provider credentials. Administrators create and manage these credentials through [Cloud Credentials Management](../cloud-credentials-management/). Users can select credentials their group is allowed to access.

The following scenarios interact with provider infrastructure and need the corresponding cloud or bare-metal credentials:

| Scenario | Why Cloud Provider Is Required |
|----------|-------------------------------|
| **node-scenarios** | Stops, terminates, or reboots nodes via the cloud provider API |
| **node-scenarios-bm** | Controls bare metal nodes via BMC/IPMI credentials |
| **power-outages** | Shuts down and restarts the entire cluster through the cloud provider |
| **zone-outages** | Simulates availability zone failures by manipulating cloud network resources |

{{% notice info %}}
Cloud credentials are stored as Kubernetes Secrets and injected into scenario pods through `SecretKeyRef`. Users must have access to the saved credential through their group. For setup and provider-specific fields, see [Cloud Credentials Management](../cloud-credentials-management/).
{{% /notice %}}
