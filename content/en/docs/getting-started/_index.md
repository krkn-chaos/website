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
{{% /alert %}}

### Why krknctl?

krknctl is a dedicated CLI tool that streamlines running chaos scenarios by providing:
- **Command auto-completion** - Quick access to all available commands
- **Input validation** - Catch errors before they happen
- **Scenario descriptions** - Built-in documentation and instructions
- **Simple workflow** - No need to manage config files or containers

### Get Started in 3 Steps:

1. **Install krknctl** - Follow the [installation guide](../installation/krknctl.md)
2. **Explore features** - Learn about [krknctl usage](../krknctl/usage.md) and how to execute chaos scenarios
3. **Run scenarios** - Check out each [scenario's documentation](../scenarios/_index.md) for krknctl examples

---

## Alternative Methods

The following alternative methods are available for advanced use cases:

### Krkn-hub
Containerized version ideal for CI/CD systems. Set up krkn-hub based on these [directions](../installation/krkn-hub.md).

See each scenario's documentation for [krkn-hub examples](../scenarios/_index.md).

**Note:** krkn-hub only allows you to run 1 scenario type and scenario file at a time.

### Krkn
Standalone Python program for running multiple scenarios in a single run. Get krkn set up with the help of these [directions](../installation/krkn.md).

See these [helpful hints](getting-started-krkn.md) on easy edits to the scenarios and config file to start running your own chaos scenarios.

**Note:** Krkn allows you to run multiple different types of scenarios and scenario files in one execution, unlike krkn-hub and krknctl.
