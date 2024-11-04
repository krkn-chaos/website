---
title: Installation
description: 
categories: [Installation]
tags: [install, docs]
weight: 2
---

<!-- {{% pageinfo %}}
This is a placeholder page that shows you how to use this template site.
{{% /pageinfo %}} -->

The following ways are supported to run Kraken:
- Standalone python program through Git.
- Containerized version using either Podman or Docker as the runtime via [Krkn-hub](/docs/installation/krkn-hub.md)
- Kubernetes or OpenShift deployment ( unsupported )

{{% alert title="Note" %}} It is recommended to run Kraken external to the cluster ( Standalone or Containerized ) hitting the Kubernetes/OpenShift API as running it internal to the cluster might be disruptive to itself and also might not report back the results if the chaos leads to cluster's API server instability.{{% /alert %}}

{{% alert title="Note" %}} To run Kraken on Power (ppc64le) architecture, build and run a containerized version by following the instructions given [here](https://github.com/krkn-chaos/krkn/blob/main/containers/build_own_image-README.md).{{% /alert %}}

{{% alert title="Note" %}} Helper functions for interactions in Krkn are part of [krkn-lib](https://github.com/krkn-chaos/krkn-lib). Please feel free to reuse and expand them as you see fit when adding a new scenario or expanding the capabilities of the current supported scenarios. {{% /alert %}}
