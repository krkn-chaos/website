---
title: Getting Started with Running Scenarios
# date: 2017-01-05
type: "docs/scenarios"
description: Getting started with Krkn-chaos
weight : 4
categories: [Best Practices, Placeholders]
tags: [docs]
---

## Quick Start with krknctl (Recommended)

{{% alert title="Recommended Approach" color="success" %}}
**krknctl is the recommended and easiest way to run krkn scenarios.** It provides command auto-completion, input validation, and abstracts the complexities of the container environment so you can focus on chaos engineering.
How to:
* [Run a Scenario with Krkn](#krkn)
* [Run a Scenario with Krkn-hub](#krkn-hub)
* [Run a Scenario with krknctl](#krknctl)
* [Run a Scenario with Krkn dashboard](#krkn-dashboard)


NOTE: krkn-hub and krknctl only allow you to run 1 scenario type and scenario file at a time (you can run multiple iterations of the same files). While krkn allows you to run multiple different types of scenarios and scenario files 

## Krkn
Get krkn set up with the help of these [directions](../installation/krkn.md) if you haven't already

See these [helpful hints](getting-started-krkn.md) on easy edits to the scenarios and config file to start running your own chaos scenarios

## Krkn-hub
Set up krkn-hub based on these [directions](../installation/krkn-hub.md)

See each scenario's documentation of how to run [krkn-hub](../scenarios/_index.md)


## krknctl
See how to run krkn through the dedicated CLI [`krknctl`](../krknctl/_index.md)

{{% alert title="Note" %}}
krknctl is the recommended and the easiest/safest way to run krkn scenarios
{{% /alert %}}

### Why krknctl?

See each scenario's documentation of how to run [krknctl](../scenarios/_index.md)

## Krkn-dashboard
Install and configure the krkn-dashboard based on these [directions](../installation/krkn-dashboard.md)

See each scenario's documentation of how to run [krkn dashboard](../scenarios/_index.md)
