---
title: Overview
linkTitle: Overview
weight: -1
description: >
  Why chaos engineering matters, why we built Krkn, and how the repositories fit together.
---

## Why Chaos?

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

How can we best avoid this from happening? This is where **Chaos testing** can add value.

## Why Krkn?

There are many chaos-related projects out there including other ones within CNCF.

We decided to create Krkn to help face some challenges we saw:

- Have a lightweight application that had the ability to **run outside the cluster**
  - This gives us the ability to take down a cluster and still be able to get logs and complete our tests
- Ability to have both **cloud-based and Kubernetes-based scenarios**
- Wanted to have **performance at the top of mind** by completing metric checks during and after chaos
- Take into account the **resilience of the software** by post-scenario basic alert checks

Krkn is here to solve these problems.

## Repository Ecosystem

Below is a flow chart of all the Krkn-related repositories in the GitHub organization. They all build on each other, with krkn-lib being the lowest level of Kubernetes-based functions to full running scenarios, demos, and documentation.

<img src="https://raw.githubusercontent.com/krkn-chaos/website/refs/heads/main/assets/images/krkn-repo-flowchart.png" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;" class="contain" alt="Krkn repository flowchart">

- **[krkn-lib](https://github.com/krkn-chaos/krkn-lib)** — Our lowest-level repository containing all of the basic Kubernetes Python functions that make Krkn run. This also includes models of our telemetry data we output at the end of our runs and lots of functional tests. Unless you are contributing to Krkn, you won't need to explicitly clone this repository.

- **[Krkn](https://github.com/krkn-chaos/krkn)** — Our brain repository that takes in a YAML file of configuration and scenario files and causes chaos on a cluster. We suggest using this way of running to try out new scenarios or if you want to run a combination of scenarios in one run. **A CNCF Sandbox project.**

- **[Krkn-hub](https://github.com/krkn-chaos/krkn-hub)** — This is our containerized wrapper around Krkn that easily allows us to run with the respective environment variables without having to maintain and tweak files. This is great for CI systems. But note, with this way of running it only allows you to run one scenario at a time.

- **[krknctl](https://github.com/krkn-chaos/krknctl)** — A tool designed to run and orchestrate Krkn chaos scenarios utilizing container images from krkn-hub. Its primary objective is to streamline the usage of Krkn by providing features like scenario descriptions and detailed instructions, effectively abstracting the complexities of the container environment. This allows users to focus solely on implementing chaos engineering practices without worrying about runtime complexities. **This is our recommended way of running Krkn to get started.**

- **[website](https://github.com/krkn-chaos/website)** — All of the above repos are documented here. If you find any issues in this documentation, please [open an issue](https://github.com/krkn-chaos/website/issues/new).

- **[krkn-demos](https://github.com/krkn-chaos/krkn-demos)** — Bash scripts and a pre-configured config file to easily see all of what Krkn is capable of, along with checks to verify it in action.

---

Continue reading more details about each of the repositories in the sidebar. We recommend starting with [**"What is Krkn?"**](/docs/krkn/) to get details around all the features we offer before moving to [Installation](/docs/installation/) and the [Scenarios](/docs/scenarios/) we offer.
