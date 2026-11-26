---
title: GPU SM Clock Limit
description: Limit GPU compute performance by locking the SM clock at the highest supported frequency at or below the configured ceiling.
weight: 3
gpu_fault: clock-limit
---

<!-- krkn-hub-scenario: none. This page uses the shared gpu-scenarios image
     with fault-type=clock-limit. The id belongs to /docs/scenarios/gpu-vram-pressure/. -->

Limit GPU compute performance by locking the SM clock at the highest supported frequency at or below the configured ceiling.

## Prerequisites

Use a Kubernetes or OpenShift cluster with physical NVIDIA GPUs, drivers, and the NVIDIA Container Toolkit. Replace `krkn-gpu-test` with an existing namespace that allows privileged worker pods, and adjust the target node name in the example.

Use dedicated GPUs that start with the default NVIDIA clock policy. Krkn resets the policy at teardown. Run one clock or power limit test at a time per GPU.

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
