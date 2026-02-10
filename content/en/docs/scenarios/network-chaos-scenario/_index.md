---
title: Network Chaos Scenario
description:
date: 2017-01-04
weight: 3
---

<krkn-hub-scenario id="network-chaos">
Scenario to introduce network latency, packet loss, and bandwidth restriction in the Node's host network interface. The purpose of this scenario is to observe faults caused by random variations in the network.
</krkn-hub-scenario>

## How to Run Network Chaos Scenarios

Choose your preferred method to run network chaos scenarios:

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}
