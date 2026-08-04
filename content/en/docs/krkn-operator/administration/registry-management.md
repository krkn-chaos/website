---
title: Registry Management
description: Configure private container registries and visibility
weight: 3
---

# Registry Management <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Configure private container registries for chaos scenario images and control which groups can access them. By default, scenarios are pulled from the public Quay.io registry. Private registries enable air-gapped deployments and custom scenario images.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/3j9uQ475jv0" title="Registry Management Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Creating a Private Registry

Configure a private registry by providing its connection settings (URL, credentials, TLS configuration).

![Private Registry Configuration](/images/krkn-operator/private-registry.png)

---

## Visibility

Each registry has a visibility setting that controls who can use it:

| Visibility | Description |
|------------|-------------|
| **Everyone** | All users on the platform can select this registry |
| **Group-based** | Only users belonging to assigned groups can see and use this registry |

---

## Impact on Scenario Selection

When a user selects a private registry during scenario execution, only the scenarios that have been mirrored to that registry will be available. Scenarios not present in the private registry will not appear in the selection list.

{{% notice info %}}
**Air-Gapped Environments**: The operator uses OCI registry APIs for scenario metadata. A private registry configuration allows the platform to function completely in disconnected environments without external connectivity.
{{% /notice %}}
