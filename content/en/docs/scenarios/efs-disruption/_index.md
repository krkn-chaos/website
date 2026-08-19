---
title: EFS Disruption Scenarios
description:
date: 2017-01-04
weight: 3
---

<!-- krkn-hub-scenario: none. This page runs the node-network-filter image with
     parameters tuned for AWS EFS. The id belongs to
     /docs/scenarios/network-chaos-ng-scenarios/node-network-filter/ which documents the
     image itself. Adding a marker here would make the id ambiguous and fail CI. -->

This scenario creates an outgoing firewall rule on specific nodes in your cluster, chosen by node name or a selector. This rule blocks connections to AWS EFS, leading to a temporary failure of any EFS volumes mounted on those affected nodes.


## How to Run EFS Disruption Scenarios

Choose your preferred method to run EFS disruption scenarios:

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
