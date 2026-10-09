---
title: Provider Configuration
description: Configure target providers for cluster discovery
weight: 4
---

# Provider Configuration <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Configure target providers that integrate with external cluster management platforms. The provider configuration interface adapts dynamically based on the selected provider.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/oCCkchyGu9w" title="Provider Configuration Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Supported Providers

| Provider | Description |
|----------|-------------|
| **ACM / OCM** | Discover and synchronize managed Kubernetes clusters through Red Hat Advanced Cluster Management or Open Cluster Management |

![ACM Provider Configuration](/images/krkn-operator/provider-configuration-acm.png)

{{% notice info %}}
This section covers ACM/OCM cluster discovery. Cloud credentials are managed separately; see the section below.
{{% /notice %}}

---

## Cloud Provider Credentials

Some chaos scenarios interact with cloud infrastructure and need provider credentials to perform node-level operations. Administrators manage saved credentials on the [Cloud Credentials Management](../cloud-credentials-management/) page.

Users can select an authorized credential when configuring a [scenario](../../usage/run-scenarios/#load-cloud-credential) or a node in [Chaos Studio](../../usage/chaos-studio/#cloud-credentials-in-workflows). The Operator injects the corresponding secret values into the scenario pod; credentials are not stored as plaintext in the run configuration.
