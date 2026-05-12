---
title: Node Network Chaos
description:
date: 2017-01-04
---
Injects network degradation (latency, packet loss, bandwidth restriction) into a target node's network interfaces using Linux `tc` (traffic control) rules. Unlike node-network-filter which blocks specific ports via iptables, this module shapes traffic at the interface level. Includes safety checks for existing `tc` rules on the node.

## How to Run Node Network Chaos Scenarios

Choose your preferred method to run node network chaos scenarios:

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

Example scenario file: [node-network-chaos.yml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kube/node-network-chaos.yml)
