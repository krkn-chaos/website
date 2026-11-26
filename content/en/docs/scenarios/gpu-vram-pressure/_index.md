---
title: GPU VRAM Pressure
description: Allocate and hold GPU memory to reduce the VRAM available to workloads.
weight: 3
gpu_fault: vram-pressure
---

<krkn-hub-scenario id="gpu-scenarios">

Allocate and hold GPU memory to reduce the VRAM available to workloads.

</krkn-hub-scenario>

## Prerequisites

Use a Kubernetes or OpenShift cluster with physical NVIDIA GPUs, drivers, and the NVIDIA Container Toolkit. Replace `krkn-gpu-test` with an existing namespace that allows privileged worker pods, and adjust the target node name in the example.

## How to run

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
<h3>Usage</h3>
{{< readfile file="_tab-krkn.md" >}}
{{< gpu-scenario-options "krkn" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" lang="krkn-hub" >}}
<h3>Usage</h3>
{{< readfile file="_tab-krkn-hub.md" >}}
{{< gpu-scenario-options "krkn-hub" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
<h3>Usage</h3>
{{< readfile file="_tab-krknctl.md" >}}
{{< gpu-scenario-options "krknctl" >}}
  {{< /tab >}}
{{< /tabpane >}}
