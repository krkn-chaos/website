---
title: EFS Disruption Scenarios
description:
date: 2017-01-04
weight: 3
---
This scenario creates an outgoing firewall rule on specific nodes in your cluster, chosen by node name or a selector. This rule blocks connections to AWS EFS, leading to a temporary failure of any EFS volumes mounted on those affected nodes.

## How to Run EFS Disruption Scenarios

Choose your preferred method to run EFS disruption scenarios:

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
