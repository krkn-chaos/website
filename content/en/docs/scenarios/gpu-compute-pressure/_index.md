---
title: GPU Compute Pressure
description: Run FP32 CUDA batches to create compute contention on the selected GPUs.
weight: 3
gpu_fault: compute-pressure
---

<!-- krkn-hub-scenario: none. This page uses the shared gpu-scenarios image
     with fault-type=compute-pressure. The id belongs to /docs/scenarios/gpu-vram-pressure/. -->

Run FP32 CUDA batches to create compute contention on the selected GPUs.

## Prerequisites

Use a Kubernetes or OpenShift cluster with physical NVIDIA GPUs, drivers, and the NVIDIA Container Toolkit. Replace `krkn-gpu-test` with an existing namespace that allows privileged worker pods, and adjust the pod label and target namespace in the example.

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
