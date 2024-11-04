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

## Where should I go next?

- [Installation](/docs/installation/): Get started using krkn!
- [Scenarios](/docs/scenarios/): Check out the scenarios we offer!
