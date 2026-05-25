---
title: What is krknctl-assist?
description: Natural language chaos scenario discovery
weight: 12
---

`krknctl-assist` is a local assistant designed to help users discover [krkn](../krkn/) chaos scenarios through natural-language prompts.
It works alongside [krknctl](../krknctl/) by translating plain-English testing intent into relevant scenario recommendations.

Its primary objective is to make scenario discovery faster by providing the following features:

- Takes a natural-language query and returns the relevant scenario match
- Runs locally via a container runtime (no hosted dependency)
- Integrates neatly in your `krknctl` workflow

This allows users to focus on the chaos experiment they want to run without needing to know the exact scenario name in advance.

Follow the [installation steps](../installation/krknctl-assist.md) to install and run `krknctl-assist`.
