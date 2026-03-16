---
title: Usage
description: Learn how to run chaos scenarios with Krkn Operator
weight: 3
---

This guide walks you through the process of running chaos engineering scenarios using the Krkn Operator web interface.

## Overview

The Krkn Operator provides an intuitive web interface for executing chaos scenarios against your Kubernetes clusters. The workflow is straightforward: select your target clusters, choose a scenario registry, pick a scenario, configure it, and launch the experiment. The operator handles all the complexity of scheduling, execution, and monitoring.

## Step 1: Starting a Scenario Run

From the Krkn Operator home page, you'll see the main dashboard with an overview of your configured targets and recent scenario runs.

![Krkn Operator Main Screen](/images/krkn-operator/main-screen.png)

To begin running a chaos scenario, click the **Run Scenario** button. This will launch the scenario configuration wizard that guides you through the setup process.

## Step 2: Selecting Target Clusters

The first step in the wizard is selecting which clusters you want to target with your chaos experiment.

![Select Target Clusters](/images/krkn-operator/select-target.png)

One of the powerful features of Krkn Operator is its ability to run scenarios across multiple clusters simultaneously. If you have configured multiple target providers (such as manual targets and ACM-managed clusters), all available clusters will be presented in a unified view.

**Key capabilities:**

- **Multi-cluster selection**: Select one or more target clusters to run the same scenario across multiple environments
- **Unified view**: All clusters from all configured providers (manual targets, ACM, etc.) are displayed together
- **Parallel execution**: When multiple targets are selected, the scenario will execute on all of them concurrently

This is particularly useful for testing:
- Consistency of behavior across environments (dev, staging, production)
- Regional cluster resilience
- Multi-tenant cluster configurations
- Different Kubernetes distributions or versions

## Step 3: Selecting a Scenario Registry

After selecting your target clusters, you'll choose where to pull the chaos scenario container images from.

![Select Scenario Registry](/images/krkn-operator/select-registry.png)

Krkn Operator supports two types of registries:

### Quay.io (Default)

The default option is the official Krkn Chaos registry on Quay.io, which contains all the pre-built, tested chaos scenarios maintained by the Krkn community. This is the recommended choice for most users as it provides:

- Immediate access to 20+ chaos scenarios
- Regular updates and new scenario releases
- Pre-validated and tested scenario images

### Private Registry

For organizations with specific requirements, you can configure a private container registry. This is useful when you need to:

- Run custom or modified chaos scenarios
- Operate in restricted network environments
- Maintain full control over scenario versions
- Meet compliance or security requirements

{{% notice info %}}
**Air-Gapped and Disconnected Environments**: Krkn Operator uses the OCI registry itself as the backend for scenario metadata through OCI registry APIs. This means that in a private registry configuration, the operator can function completely in disconnected or air-gapped environments without requiring external connectivity. All scenario definitions, metadata, and images are stored and retrieved from your private registry.
{{% /notice %}}


To use a private registry, you'll need to:
1. Configure the private registry in the [Configuration](/docs/krkn-operator/configuration/#private-registry-configuration) section
2. Push the Krkn scenario images to your private registry
3. Ensure the operator has proper authentication credentials

---

**Next Steps**: Continue to the [Scenario Configuration](/docs/krkn-operator/usage/scenario-configuration/) guide to learn about selecting and configuring specific chaos scenarios.
