---
title: krkn
description: Chaos and Resiliency Testing Tool for Kubernetes
weight: 1
---

**krkn** is a chaos and resiliency testing tool for Kubernetes. Kraken injects deliberate failures into Kubernetes clusters to check if it is resilient to turbulent conditions.

## Why do I want it?

There are a couple of false assumptions that users might have when operating and running their applications in distributed systems: 
- **The network is reliable** 
- **There is zero latency** 
- **Bandwidth is infinite**
- **The network is secure** 
- **Topology never changes**
- **The network is homogeneous** 
- **Consistent resource usage with no spikes**
- **All shared resources are available from all places**

Various assumptions led to a number of outages in production environments in the past. The services suffered from poor performance or were inaccessible to the customers, leading to missing Service Level Agreement uptime promises, revenue loss, and a degradation in the perceived reliability of said services.

How can we best avoid this from happening? This is where **Chaos testing** can add value

### Workflow
![Kraken workflow](images/kraken-workflow.png)

### How to Get Started
Instructions on how to setup, configure and run Kraken can be found at [Installation](docs/installation.md).

You may consider utilizing the chaos recommendation tool prior to initiating the chaos runs to profile the application service(s) under test. This tool discovers a list of Krkn scenarios with a high probability of causing failures or disruptions to your application service(s). The tool can be accessed at [Chaos-Recommender](docs/chaos-recommender.md).

See the [getting started doc](docs/getting-started.md) on support on how to get started with your own custom scenario or editing current scenarios for your specific usage.

After installation, refer back to the below sections for supported scenarios and how to tweak the kraken config to load them on your cluster.


#### Running Kraken with minimal configuration tweaks
For cases where you want to run Kraken with minimal configuration changes, refer to [krkn-hub](https://github.com/krkn-chaos/krkn-hub). One use case is CI integration where you do not want to carry around different configuration files for the scenarios.


### Config
Instructions on how to setup the config and the options supported can be found at [Config](docs/config.md).
## Where should I go next?

- [Installation](/docs/installation/): Get started using krkn!
- [Scenarios](/docs/scenarios/): Check out the scenarios we offer!
