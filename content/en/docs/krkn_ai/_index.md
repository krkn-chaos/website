---
title: What is krkn-ai?
weight: 3
---

**Krkn-AI** lets you automatically run Chaos scenarios and discover the most effective experiments to evaluate your system's resilience.

### How does it work?

Krkn-AI leverages evolutionary algorithms to generate experiments based on Krkn scenarios. By using user-defined objectives such as SLOs and application health checks, it can identify the critical experiments that impact the cluster.


1. Generate a Krkn-AI config file using [discover](/krkn-ai/discover/).
Running this command will generate a YAML file that is pre-populated with cluster component information and basic setup.
2. The config file can be further [customized](/krkn-ai/config/) to suit your requirements for Krkn-AI testing.

3. Start Krkn-AI testing:
    - The evolutionary algorithm will use the cluster components specified in the config file as possible inputs required to run the Chaos scenarios.
    - User-defined SLOs and application health check feedback are taken into account to guide the algorithm.
4. Analyze results, evaluate the impact of different Chaos scenarios on application liveness and their fitness scores.


## Getting Started

Follow the [installation steps](/installation/krkn-ai/) to set up the Krkn-AI CLI.

