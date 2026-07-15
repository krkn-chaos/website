---
title: Provider Configuration
description: Configure target providers for cluster discovery
weight: 4
---

# Provider Configuration <span class="krkn-badge krkn-badge--admin">Admin</span>

Configure target providers that integrate with external cluster management platforms. The provider configuration interface adapts dynamically based on the selected provider.

<div class="krkn-video">
  <div class="krkn-video__placeholder">
    <p>Video: <strong>Provider Configuration Walkthrough</strong></p>
    <p class="krkn-video__duration">~1.5 min</p>
  </div>
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
