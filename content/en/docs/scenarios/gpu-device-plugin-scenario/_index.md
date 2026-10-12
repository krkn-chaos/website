---
title: GPU Device Plugin
description: Disrupt NVIDIA device plugin pods on GPU nodes and verify they recover
date: 2017-01-04
weight: 3
---

<!-- krkn-hub-scenario: none. This page runs the pod-scenarios image with parameters
     tuned to disrupt the NVIDIA device plugin pods on GPU nodes. The id belongs to
     /docs/scenarios/pod-scenarios/ which documents the image itself. Adding a marker
     here would make the id ambiguous and fail CI. -->

This scenario kills the NVIDIA device plugin pods on GPU nodes to simulate a device plugin crash, then verifies that the pods are rescheduled and become ready.

It runs as a [Pod Scenario](../pod-scenarios/) targeted at the device plugin pods, so you use the example config below with the tool of your choice.

## Prerequisites

- A cluster with GPU nodes.
- The [NVIDIA GPU Operator](https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html) installed (device plugin runs in the `nvidia-gpu-operator` namespace by default).
- GPU nodes labeled `nvidia.com/gpu.present=true`.

{{% alert title="Note" %}}
Adjust the namespace and labels to match your install. Check with `kubectl get pods -n nvidia-gpu-operator --show-labels`.
{{% /alert %}}

## How to Run

Choose your preferred method to run the GPU device plugin disruption scenario:

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" lang="krkn-hub" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}
