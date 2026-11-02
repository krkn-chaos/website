---
title: Developer Guide
linkTitle: Developer Guide
description: Build a custom Krkn scenario, package its image contract, and run it through Krkn Operator.
weight: 14
categories: [Developers Guide]
tags: [docs, plugins]
---

Develop a scenario once, then expose it through a container image that Krkn's
clients can discover and configure. This guide follows the full path from a
Python plugin to an execution managed by Krkn Operator.

The example is deliberately small: wait for a configurable number of seconds,
list pods in a namespace through `krkn-lib`, and report success or failure. It
lets you verify the integration without introducing a disruptive experiment.

**Companion repository:** [krkn-chaos/krkn-dev-demo](https://github.com/krkn-chaos/krkn-dev-demo)
contains the plugin skeleton, container files, and Kind and registry configuration
used throughout the lab.

## Start with the hands-on lab

[Build a custom scenario](/docs/developers-guide/custom-scenario/) takes you
through four stages:

1. **Implement the plugin.** Complete the two abstract methods and bind a
   scenario type to a YAML configuration.
2. **Package and test the image.** Add input metadata, render the configuration,
   and run the container with Podman.
3. **Run through the operator.** Install a private registry and Krkn Operator
   in Kind, publish the image, and execute it against a registered target.
4. **Diagnose the integration.** Recognize discovery, image pull, permission,
   kubeconfig, and plugin failures independently.

The lab builds a standalone scenario image from a custom Krkn base image. It
does not require a krkn-hub checkout or a rebuild of krknctl or the operator.
Target registration is supplied by the participant and is outside the lab.

## Understand the contracts

Read [Scenario architecture](/docs/developers-guide/scenario-architecture/)
for the responsibilities of the registry, operator, node runtime, image startup
script, Python plugin, and target cluster.

- [Scenario Plugin API](/docs/developers-guide/scenario_plugin_api/) defines
  discovery rules, method signatures, configuration binding, and return values.
- [Scenario image contract](/docs/developers-guide/krknctl-edits/) explains OCI
  labels and the typed input descriptors used by krknctl and the console.
- [Using and extending krkn-lib](/docs/developers-guide/krkn-lib/) explains how
  to reuse the authenticated clients supplied to a plugin.

## Validate and contribute

- [Testing changes](/docs/developers-guide/testing-changes/) covers the checks
  from plugin behavior through container startup and orchestration.
- [Adding tests](/docs/developers-guide/add-tests-krkn/) describes the project's
  unit and functional test suites.
- [Publishing through krkn-hub](/docs/developers-guide/editing-krkn-hub/) covers
  the optional path for adding a scenario to the community image collection.
- [Health check plugins](/docs/developers-guide/health-check-plugins/) covers
  monitoring that runs alongside chaos scenarios.

For upstream changes, follow the
[contribution guidelines](/docs/contribution-guidelines/) and include the
scenario's documentation and relevant tests. Development questions are welcome
in [#krkn on Kubernetes Slack](https://kubernetes.slack.com/archives/C05SFMHRWK1).
