---
title: Power Outage Scenarios
description:
date: 2017-01-04
weight: 3
---

This scenario shuts down Kubernetes/OpenShift cluster for the specified duration to simulate power outages, brings it back online and checks if it's healthy.

## How to Run Power Outage Scenarios

Choose your preferred method to run power outage scenarios:

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

## Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/r0zLbh70XK7gnc4s5v0ZzSXGo.js" id="asciicast-r0zLbh70XK7gnc4s5v0ZzSXGo" async="true"  style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;"></script>
