---
type: "docs/scenarios"
title: Installation
description: Details on how to install krkn, krkn-hub, and krknctl
categories: [Installation]
tags: [install, docs]
weight: 4
---

## Choose Your Installation Method

Krkn provides multiple ways to run chaos scenarios. Choose the method that best fits your needs:

| Tool                         | What is it?                   | Best For                          | Complexity      |
|------------------------------|-------------------------------|-----------------------------------|-----------------|
| **[krknctl](krknctl.md)**    | CLI tool with auto-completion | Quick testing, ease of use        | ⭐ Easy         |
| **[krkn-hub](krkn-hub.md)**  | Pre-built container images    | CI/CD pipelines, automation       | ⭐⭐ Moderate   |
| **[krkn](krkn.md)**          | Standalone Python program     | Full control, multiple scenarios  | ⭐⭐⭐ Advanced |

{{% alert title="Recommendation" color="success" %}}
**New to Krkn?** Start with **krknctl** - it's the easiest way to get started with chaos testing!
{{% /alert %}}

---

## Installation Methods

### krknctl (Recommended)

**What is it?** A dedicated command-line interface (CLI) tool that simplifies running Krkn chaos scenarios.

**Why use it?**
- Command auto-completion for faster workflows
- Built-in input validation to catch errors early
- No need to manage configuration files manually
- Runs scenarios via container runtime (Podman/Docker)

**Best for:** Users who want a streamlined, user-friendly experience without managing configs.

👉 **[Install krknctl →](krknctl.md)**

---

### krkn-hub

**What is it?** A collection of pre-built container images that wrap Krkn scenarios, configured via environment variables.

**Why use it?**
- No Python environment setup required
- Easy integration with CI/CD systems (Jenkins, GitHub Actions, etc.)
- Consistent, reproducible chaos runs
- Scenarios are isolated in containers

**Best for:** CI/CD pipelines, automated testing, and users who prefer containers over local Python setups.

{{% alert title="Note" %}}krkn-hub runs **one scenario type per execution**. For running multiple scenarios in a single run, use the standalone **krkn** installation.{{% /alert %}}

👉 **[Install krkn-hub →](krkn-hub.md)**

---

### krkn (Standalone Python)

**What is it?** The core Krkn chaos engineering tool, run as a standalone Python program cloned from Git.

**Why use it?**
- Full control over configuration and execution
- Run **multiple different scenario types** in a single execution
- Direct access to all features and customization options
- Ideal for development and advanced customization

**Best for:** Advanced users, developers contributing to Krkn, and scenarios requiring fine-grained control.

{{% alert title="Note" %}}Requires Python 3.9 environment and manual dependency management.{{% /alert %}}

👉 **[Install krkn →](krkn.md)**

---

## Important Considerations

{{% alert title="Run External to Cluster" color="warning" %}}
It is recommended to run Krkn **external to the cluster** (Standalone or Containerized) hitting the Kubernetes/OpenShift API. Running it inside the cluster might be disruptive to itself and may not report results if the chaos leads to API server instability.
{{% /alert %}}

{{% alert title="Power Architecture (ppc64le)" %}}
To run Krkn on Power (ppc64le) architecture, build and run a containerized version by following the instructions [here](https://github.com/krkn-chaos/krkn/blob/main/containers/build_own_image-README.md).
{{% /alert %}}