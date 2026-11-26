---
title: GPU Power Limit
description: Lower the GPU board power cap to test workloads under a tighter power budget. Krkn verifies the enforced cap and restores the previous cap at teardown.
weight: 3
gpu_fault: power-limit
---

<!-- krkn-hub-scenario: none. This page uses the shared gpu-scenarios image
     with fault-type=power-limit. The id belongs to /docs/scenarios/gpu-vram-pressure/. -->

Lower the GPU board power cap to test workloads under a tighter power budget. Krkn verifies the enforced cap and restores the previous cap at teardown.

## Prerequisites

Use a Kubernetes or OpenShift cluster with physical NVIDIA GPUs, drivers, and the NVIDIA Container Toolkit. Replace `krkn-gpu-test` with an existing namespace that allows privileged worker pods, and adjust the target node name in the example.

Use dedicated GPUs and run one clock or power limit test at a time per GPU. The example uses 40 W on an NVIDIA L4 capped at 72 W; choose a value supported by your GPU.

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
