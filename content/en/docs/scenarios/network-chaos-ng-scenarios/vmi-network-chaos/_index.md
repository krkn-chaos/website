---
title: VMI Network Chaos
description:
date: 2017-01-04
---
<krkn-hub-scenario id="vmi-network-chaos">
Injects network degradation into a KubeVirt Virtual Machine Instance (VMI) by shaping traffic on the VM's tap interface inside the virt-launcher network namespace. Supports configurable bandwidth limiting, latency injection, and packet loss. Unlike node or pod network chaos, this scenario targets the tap device that connects QEMU to the bridge, so only the specific VMI is affected without disrupting OVN's BFD heartbeats or other workloads on the same node.
</krkn-hub-scenario>

## How to Run VMI Network Chaos Scenarios

Choose your preferred method to run VMI network chaos scenarios:

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
