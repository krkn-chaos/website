---
title: Test Strategies and Methodology
description: 
categories: [Examples, Placeholders]
tags: [test, docs]
weight: 4
---

<!-- {{% pageinfo %}}
This is a placeholder page that shows you how to use this template site.
{{% /pageinfo %}} -->

Failures in production are costly. To help mitigate risk to service health, consider the following strategies and approaches to service testing:

* Be proactive vs reactive. We have different types of test suites in place - unit, integration and end-to-end - that help expose bugs in code in a controlled environment. Through implementation of a chaos engineering strategy, we can discover potential causes of service degradation. We need to understand the systems’ behavior under unpredictable conditions in order to find the areas to harden, and use performance data points to size the clusters to handle failures in order to keep downtime to a minimum.

* Test the resiliency of a system under turbulent conditions by running tests that are designed to disrupt while monitoring the systems adaptability and performance: 
    - Establish and define your steady state and metrics - understand the behavior and performance under stable conditions and define the metrics that will be used to evaluate the system’s behavior. Then decide on acceptable outcomes before injecting chaos.
    - Analyze the statuses and metrics of all components during the chaos test runs.
    - Improve the areas that are not resilient and performant by comparing the key metrics and Service Level Objectives (SLOs) to the stable conditions before the chaos. For example: evaluating the API server latency or application uptime to see if the key performance indicators and service level       indicators are still within acceptable limits.

