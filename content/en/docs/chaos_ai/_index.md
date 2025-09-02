---
title: Chaos AI
weight: 7
---

**Chaos AI** lets you automatically run Chaos scenarios and discover the most effective experiments to evaluate your system's resilience.

### How does it work?

Chaos AI leverages evolutionary algorithms to generate experiments based on Krkn scenarios. By using user-defined objectives such as SLOs and application health checks, it can identify the critical experiments that impact the cluster.


1. Generate a Chaos AI config file using [discover](./discover.md). Running this command will generate a YAML file that is pre-populated with cluster component information and basic setup.
2. The config file can be further [customized](./config) to suit your requirements for Chaos AI testing.
3. Start Chaos AI testing:
    - The evolutionary algorithm will use the cluster components specified in the config file as possible inputs required to run the Chaos scenarios.
    - User-defined SLOs and application health check feedback are taken into account to guide the algorithm.


## Getting Started

Follow the [installation steps](../installation/chaos-ai.md) to set up the Chaos AI CLI.
