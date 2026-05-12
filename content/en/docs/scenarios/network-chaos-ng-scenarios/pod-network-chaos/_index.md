---
title: Pod Network Chaos
description:
date: 2017-01-04
---
Injects network degradation (latency, packet loss, bandwidth restriction) into a target pod's network interfaces using Linux `tc` (traffic control) rules. Unlike pod-network-filter which blocks specific ports via iptables, this module shapes traffic at the interface level.

## How to Run Pod Network Chaos Scenarios

Choose your preferred method to run pod network chaos scenarios:

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

Example scenario file: [pod-network-chaos.yml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kube/pod-network-chaos.yml)
