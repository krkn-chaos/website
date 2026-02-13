---
title: Pod Network Filter
description:
date: 2017-01-04
---
<krkn-hub-scenario id="pod-network-filter">
Creates iptables rules on one or more pods to block incoming and outgoing traffic on a port in the pod network interface. Can be used to block network based services connected to the pod or to block inter-pod communication.
</krkn-hub-scenario>

## How to Run Pod Network Filter Scenarios

Choose your preferred method to run pod network filter scenarios:

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
