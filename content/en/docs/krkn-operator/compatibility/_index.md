---
title: OCM/ACM Compatibility
description: Supported platforms and ACM/OCM versions for Krkn Operator
weight: 5
---

# OCM/ACM Compatibility

Krkn Operator supports multi-cluster chaos testing on Kubernetes and OpenShift. Cluster discovery can be manual or automated through ACM/OCM integration.

{{% notice info %}}
**Multi-cluster works without ACM/OCM.** Clusters registered manually through the web console have the exact same capabilities as clusters discovered via ACM. The integration is optional — it adds automatic discovery, not functionality.
{{% /notice %}}

---

## Platform Support

| Platform | Status |
|----------|--------|
| Kubernetes 1.19+ | Supported |
| OpenShift 4.x | Supported |

---

## ACM Compatibility

The following versions of Red Hat Advanced Cluster Management have been tested and validated with Krkn Operator:

| ACM Version | Status |
|-------------|--------|
| 2.14 | Tested |
| 2.15 | Tested |
| 2.16 | Tested |

## OCM Compatibility

The following versions of Open Cluster Management have been tested and validated:

| OCM Version | Status |
|-------------|--------|
| 1.1.0 | Tested |
| 1.2.0 | Tested |
| 1.3.1 | Tested |

{{% notice warning %}}
Older ACM versions may work but are not actively tested. We recommend running one of the validated versions above.
{{% /notice %}}

---

## How ACM Integration Works

When ACM is enabled (`--set acm.enabled=true` at install time), Krkn Operator deploys a dedicated component that connects to the ACM hub and automatically discovers managed clusters. Discovered clusters appear in the same cluster pool as manually registered targets — users select from both without distinction.

See [Provider Configuration](/docs/krkn-operator/administration/provider-configuration/) for setup details and [Installation](/docs/krkn-operator/installation/) for the Helm flag.

---

## Reference

- [Open Cluster Management (OCM)](https://open-cluster-management.io/)
- [OCM Releases](https://open-cluster-management.io/docs/release/)
- [Red Hat ACM Documentation](https://docs.redhat.com/en/documentation/red_hat_advanced_cluster_management_for_kubernetes/)
