---
title: Krkn-Chaos
description: Krkn-Chaos Org Explanations
linkTitle: Krkn-Chaos
type: "docs/scenarios"
menu: {main: {weight: 20}}
---


Welcome to Krkn-Chaos organization! We are a team of individuals excited about chaos and resiliency testing in Kubernetes clusters. 

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

How can we best avoid this from happening? This is where **Chaos testing** can add value


## Why Krkn? 
There are many chaos related projects out there including other ones within CNCF. 

We decided to create Krkn to help face some challenges we saw:
* Have a light weight application that had the ability to run outside the cluster
  * This gives us the ability to take down a cluster and still be able to get logs and complete our tests
* Ability to have both cloud based and kubernetes based scenarios
* Wanted to have performance at the top of mind by completing metric checks during and after chaos
* Take into account the resilience of the software by post scenario basic alert checks 

Krkn is here to solve these problems.

 Below is a flow chart of all the krkn related repositories in the github organization. They all build on eachother with krkn-lib being the lowest level of kubernetes based functions to full running scenarios and demos and documentations

<img src="/images/krkn-repo-flowchart.png" width="900px" class="krkn-chaos-flowchart img-fluid mb-3">

* First off, [**krkn-lib**](https://github.com/krkn-chaos/krkn-lib). Our lowest level repository containing all of the basic kubernetes python functions that make Krkn run. This also includes models of our telemetry data we output at the end of our runs and lots of functional tests.


* Krkn: Our brain repository that takes in a yaml file of configuration and scenario files and causes chaos on a cluster.
  We sugguest using this way of running to try out new scenarios or if you want to run a combination of scenarios in one run. **A CNCF sandbox project.** [Github](https://github.com/krkn-chaos/) 

* Krkn-hub: This is our containerized wrapper around krkn that easily allows us to run with the respective environment variables without having to maintain and tweak files! This is great for CI systems. But note, with this way of running it only allows you to run one scenario at a time

* [Krknctl](https://github.com/krkn-chaos/krknctl) is a tool designed to run and orchestrate krkn chaos scenarios utilizing container images from krkn-hub. Its primary objective is to streamline the usage of krkn by providing features like scenario descriptions and detailed instructions, effectively abstracting the complexities of the container environment. This allows users to focus solely on implementing chaos engineering practices without worrying about runtime complexities.
  **This is our recommended way of running krkn to get started**

* All of the above repos are documented in the [website](https://github.com/krkn-chaos/website) repository, if you find any issues in this documentation please open an issue here

* Finally, our [krkn-demos repo](https://github.com/krkn-chaos/krkn-demos), this gives you bash scripts and a pre configured config file to easily see all of what krkn is capable of along with checks to verify it in action


Continue reading more details about each of the repositories on the left hand side. We recommend starting with ["What is Krkn?"](krkn/_index.md) to get details around all the features we offer before moving to installation and description of the scenarios we offer