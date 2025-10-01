---
title: Developers Guide
description: Developers Guide Overview
type: "docs/scenarios"
weight: 6
categories: [New scenarios, Placeholders]
tags: [docs]
---
This document describes how to develop and add to Krkn. Before you start, it is recommended that you read the following documents first:

1. [Krkn Main README](../krkn/_index.md)
2. [List of all Supported Scenarios](../scenarios/_index.md)

Be sure to properly [install](../installation/_index.md) Krkn. Then you can start to develop krkn. The following documents will help you get started:

1. [Add k8s functionality to krkn-lib](./krkn-lib.md)
2. [Add a New Chaos Scenario using Plugin API](./scenario_plugin_api.md): Adding a new scenario into krkn
3. [Test your changes](./testing-changes.md) 


`NOTE: All base kubernetes functionality should be added into krkn-lib and called from krkn`

Once a scenario gets added to krkn, changes will be need in krkn-hub and krknctl as well. See steps below on help to edit krkn-hub and krknctl
- [Add New Scenario to Krkn-hub](./editing-krkn-hub.md) and test your changes
- [Add New Scenario to Krknctl](./krknctl-edits.md) and test your changes


## Questions?
For any questions or further guidance, feel free to reach out to us on the 
[Kubernetes workspace](https://kubernetes.slack.com/) in the `#krkn` channel. 
We’re happy to assist. Now, __release the Krkn!__


## Follow Contribution Guide

Once all you're happy with your changes, follow the [contribution](#docs/git-pointers.md) guide on how to create your own branch and squash your commits
 