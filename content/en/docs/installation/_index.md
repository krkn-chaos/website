---
type: "docs/scenarios"
title: Installation
description: Details on how to install krkn and krkn-hub
categories: [Installation]
tags: [install, docs]
weight: 4
---

<!-- {{% pageinfo %}}
This is a placeholder page that shows you how to use this template site.
{{% /pageinfo %}} -->

The following ways are supported to run Krkn:
- **Krkn CLI (recommended)** - [krknctl](krknctl.md) - Streamlined CLI with auto-completion and input validation
- Standalone python program through Git - See specific documentation for [krkn](krkn.md)
- Containerized version using either Podman or Docker as the runtime via [Krkn-hub](krkn-hub.md)
- Kubernetes or OpenShift deployment ( unsupported )
- Web-based interface using a browser to run and visualize experiments via [krkn dashboard](../krkn-dashboard/_index.md)

{{% alert title="Note" %}} It is recommended to run Kraken external to the cluster ( Standalone or Containerized ) hitting the Kubernetes/OpenShift API as running it internal to the cluster might be disruptive to itself and also might not report back the results if the chaos leads to cluster's API server instability.{{% /alert %}}

{{% alert title="Note" %}} To run Kraken on Power (ppc64le) architecture, build and run a containerized version by following the instructions given [here](https://github.com/krkn-chaos/krkn/blob/main/containers/build_own_image-README.md).{{% /alert %}}


