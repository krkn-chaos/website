---
title: Application Outage Scenarios
description: 
date: 2017-01-04
weight: 3
---

### Application outages
Scenario to block the traffic ( Ingress/Egress ) of an application matching the labels for the specified duration of time to understand the behavior of the service/other services which depend on it during downtime. This helps with planning the requirements accordingly, be it improving the timeouts or tweaking the alerts etc.

You can add in your applications URL into the [health checks section](../../krkn/config.md#health-checks) of the config to track the downtime of your application during this scenario 

### Rollback Scenario Support

Krkn supports rollback for Application outages. For more details, please refer to the [Rollback Scenarios](../../rollback-scenarios/_index.md) documentation.