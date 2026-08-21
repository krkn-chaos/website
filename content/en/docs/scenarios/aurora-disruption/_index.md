---
title: Aurora Disruption Scenario
description: 
date: 2017-01-04
weight: 3
---

<!-- krkn-hub-scenario: none. This page runs the pod-network-filter image with
     parameters tuned for AWS Aurora. The id belongs to
     /docs/scenarios/network-chaos-ng-scenarios/pod-network-filter/ which documents the
     image itself. Adding a marker here would make the id ambiguous and fail CI. -->

This scenario blocks a pod's outgoing MySQL and PostgreSQL traffic, effectively preventing it from connecting to any AWS Aurora SQL engine. It works just as well for standard MySQL and PostgreSQL connections too.


This uses the pod network filter scenario but set with specific parameters to disrupt aurora

## How to Run Aurora Disruption Scenarios

Choose your preferred method to run aurora disruption scenarios:

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