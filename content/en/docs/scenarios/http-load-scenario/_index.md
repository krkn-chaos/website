---
title: HTTP Load Scenarios
description:
date: 2017-01-04
weight: 3
---

<krkn-hub-scenario id="http-load">

### HTTP Load Scenarios

This scenario generates distributed HTTP load against one or more target endpoints using
[Vegeta](https://github.com/tsenart/vegeta) load testing pods deployed inside the Kubernetes cluster.
It leverages the distributed nature of Kubernetes clusters to instantiate multiple load generator pods,
significantly increasing the effectiveness of the load test.

The scenario supports multiple concurrent pods, configurable request rates, multiple HTTP methods
(GET, POST, PUT, DELETE, PATCH, HEAD), custom headers, request bodies, and comprehensive results
collection with aggregated metrics across all pods.

The configuration allows for the specification of multiple node selectors, enabling Kubernetes to schedule
the attacker pods on a user-defined subset of nodes to make the test more realistic.

The attacker container source code is available [here](https://github.com/krkn-chaos/krkn-http-load).

</krkn-hub-scenario>

## How to Run HTTP Load Scenarios

Choose your preferred method to run HTTP load scenarios:

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
