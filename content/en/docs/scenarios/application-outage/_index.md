---
title: Application Outage Scenarios
description: 
date: 2017-01-04
weight: 3
---

### Application outages
<krkn-hub-scenario id="application-outages">
Scenario to block the traffic ( Ingress/Egress ) of an application matching the labels for the specified duration of time to understand the behavior of the service/other services which depend on it during downtime. This helps with planning the requirements accordingly, be it improving the timeouts or tweaking the alerts etc.
</krkn-hub-scenario>
You can add in your applications URL into the [health checks section](../../krkn/config.md#health-checks) of the config to track the downtime of your application during this scenario 

### Rollback Scenario Support

Krkn supports rollback for Application outages. For more details, please refer to the [Rollback Scenarios](../../rollback-scenarios/_index.md) documentation.

### Debugging steps in case of failures
Kraken creates a network policy blocking the ingress/egress traffic to create an outage, in case of failures before reverting back the network policy, you can delete it manually by executing the following commands to stop the outage:
```bash
$ oc delete networkpolicy/kraken-deny -n <targeted-namespace>
```

## How to Run Application Outage Scenarios

Choose your preferred method to run application outage scenarios:

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

#### Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/452403.js" id="asciicast-452403" async="true" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;" ></script>