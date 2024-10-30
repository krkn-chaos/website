---
title: Chaos Testing Guide
description: 
categories: 
tags: 
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

### Kraken scenario pass/fail criteria and report
It is important to make sure to check if the targeted component recovered from the chaos injection and also if the Kubernetes cluster is healthy as failures in one component can have an adverse impact on other components. Kraken does this by:
- Having built in checks for pod and node based scenarios to ensure the expected number of replicas and nodes are up. It also supports running custom scripts with the checks.
- Leveraging [Cerberus](docs/cerberus) to monitor the cluster under test and consuming the aggregated go/no-go signal to determine pass/fail post chaos. It is highly recommended to turn on the Cerberus health check feature available in Kraken. Instructions on installing and setting up Cerberus can be found [here](docs/cerberus) or can be installed from Kraken using the [instructions](docs/installation). Once Cerberus is up and running, set cerberus_enabled to True and cerberus_url to the url where Cerberus publishes go/no-go signal in the Kraken config file. Cerberus can monitor [application routes](docs/cerberus/config.md) during the chaos and fails the run if it encounters downtime as it is a potential downtime in a customers, or users environment as well. It is especially important during the control plane chaos scenarios including the API server, Etcd, Ingress etc. It can be enabled by setting `check_applicaton_routes: True` in the [Kraken config](https://github.com/redhat-chaos/krkn/blob/main/config/config.yaml) provided application routes are being monitored in the [cerberus config](https://github.com/redhat-chaos/krkn/blob/main/config/cerberus.yaml).
- Leveraging built-in alert collection feature to fail the runs in case of critical alerts.

### Signaling
In CI runs or any external job it is useful to stop Kraken once a certain test or state gets reached. We created a way to signal to kraken to pause the chaos or stop it completely using a signal posted to a port of your choice.

For example if we have a test run loading the cluster running and kraken separately running; we want to be able to know when to start/stop the kraken run based on when the test run completes or gets to a certain loaded state.

More detailed information on enabling and leveraging this feature can be found [here](docs/signal.md).


### Performance monitoring
Monitoring the Kubernetes/OpenShift cluster to observe the impact of Kraken chaos scenarios on various components is key to find out the bottlenecks as it is important to make sure the cluster is healthy in terms if both recovery as well as performance during/after the failure has been injected. Instructions on enabling it can be found [here](docs/performance_dashboards.md).


### SLOs validation during and post chaos
- In addition to checking the recovery and health of the cluster and components under test, Kraken takes in a profile with the Prometheus expressions to validate and alerts, exits with a non-zero return code depending on the severity set. This feature can be used to determine pass/fail or alert on abnormalities observed in the cluster based on the metrics. 
- Kraken also provides ability to check if any critical alerts are firing in the cluster post chaos and pass/fail's. 

Information on enabling and leveraging this feature can be found [here](docs/SLOs_validation.md)


### OCM / ACM integration

Kraken supports injecting faults into [Open Cluster Management (OCM)](https://open-cluster-management.io/) and [Red Hat Advanced Cluster Management for Kubernetes (ACM)](https://www.krkn.com/en/technologies/management/advanced-cluster-management) managed clusters through [ManagedCluster Scenarios](docs/managedcluster_scenarios.md).
