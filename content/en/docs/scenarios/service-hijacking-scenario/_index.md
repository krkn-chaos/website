---
title: Service Hijacking Scenario
description:
date: 2017-01-04
weight: 3
---
<krkn-hub-scenario id="service-hijacking">
Service Hijacking Scenarios aim to simulate fake HTTP responses from a workload targeted by a Service already deployed in the cluster. This scenario is executed by deploying a custom-made web service and modifying the target Service selector to direct traffic to this web service for a specified duration.
</krkn-hub-scenario>

## How to Run Service Hijacking Scenarios

Choose your preferred method to run service hijacking scenarios:

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
