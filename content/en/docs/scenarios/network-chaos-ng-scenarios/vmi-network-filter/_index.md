---
title: VMI Network Filter
description:
date: 2017-01-04
---
<krkn-hub-scenario id="vmi-network-filter">
Injects iptables-based network filtering into a KubeVirt Virtual Machine Instance (VMI) by applying INPUT and OUTPUT rules inside the virt-launcher network namespace via nsenter. Supports port and protocol-specific filtering so you can selectively block DNS, SSH, HTTP, or any other traffic without cutting all connectivity. The tap interface (tap0) is targeted directly so only the specific VMI is isolated, leaving OVN's BFD heartbeats and other node workloads unaffected.
</krkn-hub-scenario>

## How to Run VMI Network Filter Scenarios

Choose your preferred method to run VMI network filter scenarios:

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
