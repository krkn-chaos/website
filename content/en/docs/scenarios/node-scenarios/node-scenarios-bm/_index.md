---
title: Node Scenarios on Bare Metal
description:
date: 2017-01-05
weight: 2
aliases:
  - /docs/scenarios/node-scenarios/node-scenarios-bm-krkn-hub/
---
<krkn-hub-scenario id="node-scenarios-bm">
Disrupts node(s) on a bare metal Kubernetes/OpenShift cluster by driving power state through the host's BMC (IPMI). Unlike the cloud-provider node scenarios, this flow requires IPMI credentials (either default or per-machine) and the OpenShift `oc` CLI on the runner host. Supported actions are inherited from the parent [Node Scenarios](../_index.md) page (start, stop, stop_start, terminate, reboot, kubelet stop/restart, disk detach/attach, and so on).
</krkn-hub-scenario>

## How to Run Node Scenarios on Bare Metal

Choose your preferred method to run baremetal node scenarios:

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

## Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/ANZY7HhPdWTNaWt4xMFanF6Q5.js" id="asciicast-ANZY7HhPdWTNaWt4xMFanF6Q5" async="true" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;"></script>
