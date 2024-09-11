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

- **What is it good for?**: What types of problems does your project solve? What
  are the benefits of using it?

- **What is it not good for?**: For example, point out situations that might
  intuitively seem suited for your project, but aren't for some reason. Also
  mention known limitations, scaling issues, or anything else that might let
  your users know if the project is not for them.

- **What is it _not yet_ good for?**: Highlight any useful features that are
  coming soon.

## Where should I go next?

Give your users next steps from the Overview. For example:

- [Getting Started](/docs/getting-started/): Get started using krkn!
- [Examples](/docs/examples/): Check out some example code!
