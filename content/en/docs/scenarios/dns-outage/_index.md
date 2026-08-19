---
title: DNS Outage Scenarios
description:
date: 2017-01-04
weight: 3
---

<!-- krkn-hub-scenario: none. This page runs the pod-network-filter image with
     parameters tuned for DNS traffic. The id belongs to
     /docs/scenarios/network-chaos-ng-scenarios/pod-network-filter/ which documents the
     image itself. Adding a marker here would make the id ambiguous and fail CI. -->

This scenario blocks all outgoing DNS traffic from a specific pod, effectively preventing it from resolving any hostnames or service names.


## How to Run DNS Outage Scenarios

Choose your preferred method to run DNS outage scenarios:

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
