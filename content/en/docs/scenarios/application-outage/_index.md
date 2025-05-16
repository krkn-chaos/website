---
title: Application Outage Scenarios
description: 
date: 2017-01-04
---

### Application outages
Scenario to block the traffic ( Ingress/Egress ) of an application matching the labels for the specified duration of time to understand the behavior of the service/other services which depend on it during downtime. This helps with planning the requirements accordingly, be it improving the timeouts or tweaking the alerts etc.

## Overview

This scenario creates a network outage for selected pods by applying a NetworkPolicy that blocks ingress and/or egress traffic. After the specified duration, the NetworkPolicy is automatically removed, restoring normal network connectivity.

## Use Cases

- Test application resilience to network disruptions
- Validate service mesh retry and timeout configurations
- Simulate temporary network partitions between components
- Test failover mechanisms when connectivity is lost

## Configuration Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| namespace | string | Namespace where the NetworkPolicy will be applied | (Required) |
| pod_selector | dict | Pod selector labels for the NetworkPolicy (matchLabels) | (Required) |
| block | list | Traffic types to block (`Ingress`, `Egress`, or both) | [Ingress, Egress] |
| duration | int | Duration in seconds to keep traffic blocked | 60 |

> **Important**: The `pod_selector` parameter must be a non-empty dictionary of Kubernetes labels to select target pods. 
> A NetworkPolicy with an empty pod selector would apply to all pods in the namespace, which is not supported by this plugin.

You can add in your applications URL into the [health checks section](../../krkn/config.md#health-checks) of the config to track the downtime of your application during this scenario