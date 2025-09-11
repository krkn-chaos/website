---
title: Getting Started with Running Scenarios
# date: 2017-01-05
type: "docs/scenarios"
description: Getting started with Krkn-chaos 
weight : 4
categories: [Best Practices, Placeholders]
tags: [docs]
type: "docs/scenarios"
---

How to:
* [Run a Scenario with Krkn](#krkn)
* [Run a Scenario with Krkn-hub](#krkn-hub)
* [Run a Scenario with krknctl](#krknctl)


NOTE: krkn-hub and krknctl only allow you to run 1 scenario type and scenario file at a time (you can run multiple iterations of the same files). While krkn allows you to run multiple different types of scenarios and scenario files 

## Krkn
Get krkn set up with the help of these [directions](../installation/krkn.md) if you haven't already

See these [helpful hints](getting-started-krkn.md) on easy edits to the scenarios and config file to start running your own chaos scenarios

## Krkn-hub
Set up krkn-hub based on these [directions](../installation/krkn-hub.md)

See each scenario's documentation of how to run [krkn-hub](../scenarios/_index.md)


## krknctl
See how to run krkn through the dedicated CLI [`krknctl`](../krknctl/_index.md) then use the krknctl titles under each scenario under [use-cases](./use-cases.md) to get started running your first krknctl scenario
{{% alert title="Note" %}}
krknctl is the recommended and the easiest/safest way to run krkn scenarios
{{% /alert %}}

[Explore](../krknctl/usage.md) the features and how execute chaos scenarios directly from your terminal.

See each scenario's documentation of how to run [krknctl](../scenarios/_index.md)
