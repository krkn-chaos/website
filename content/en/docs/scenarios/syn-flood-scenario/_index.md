---
title: Syn Flood Scenarios
description:
date: 2017-01-04
weight: 3
---

<krkn-hub-scenario id="syn-flood">
### Syn Flood Scenarios

This scenario generates a substantial amount of TCP traffic directed at one or more Kubernetes services within
the cluster to test the server's resiliency under extreme traffic conditions.
It can also target hosts outside the cluster by specifying a reachable IP address or hostname.
This scenario leverages the distributed nature of Kubernetes clusters to instantiate multiple instances
of the same pod against a single host, significantly increasing the effectiveness of the attack.
The configuration also allows for the specification of multiple node selectors, enabling Kubernetes to schedule
the attacker pods on a user-defined subset of nodes to make the test more realistic.



The attacker container source code is available [here](https://github.com/krkn-chaos/krkn-syn-flood).

</krkn-hub-scenario>

## How to Run Syn Flood Scenarios

Choose your preferred method to run syn flood scenarios:

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
