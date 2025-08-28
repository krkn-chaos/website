---
title: Chaos AI
weight: 7
---

**Chaos AI** let's you to automatically run Chaos scenarios and discovery the most effective experiments to evaluate your system's resilience.

### How does it work?

Chaos AI leverages Evolutionary Algorithm technique to generate experiments based on Krkn Scenarios. Using an user-defined objectives like SLOs and application health checks, it is able to identify the critical experiment that impacts the cluster.


1. Generate Chaos AI config file using [discover](./discover.md). Running this command will generate YAML file, that is pre-populated with Cluster component information and basic setup.
2. The config file can be further [customized](./config) as per your requirement for the Chaos AI testing. 
3. Start the Chaos AI testing
    - The evolutionary algorithm will use the cluster components specified in the config file as possible inputs that would be required to run the Chaos Scenarios. 
    - User defined SLOs and app health check feedback are taken into account to drive this algorithm.


## Getting Started

Follow the [installation steps](../installation/chaos-ai.md) to setup Chaos AI CLI. 
