---
title: VMI Network Chaos
description: "Injects network degradation (latency, packet loss, bandwidth) into KubeVirt VMI tap interfaces using Linux tc rules inside the virt-launcher network namespace."
date: 2017-01-04
weight: 6
---
Injects network degradation (latency, packet loss, bandwidth restriction) into KubeVirt Virtual Machine Instance (VMI) network interfaces. The scenario deploys a privileged pod on the VMI's node, enters the virt-launcher network namespace via `nsenter`, and applies Linux `tc` (traffic control) rules to the VMI's tap interface. Traffic shaping targets the tap device directly rather than the underlying bridge interface, isolating the impact to the VMI without affecting OVN or host-level network control traffic.

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

Example scenario file: [virt_network_chaos.yaml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/virt_network_chaos.yaml)
