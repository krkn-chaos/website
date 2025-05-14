---
title: What is Krkn?
description: Chaos and Resiliency Testing Tool for Kubernetes
weight: 1
---

**krkn** is a chaos and resiliency testing tool for Kubernetes. Krkn injects deliberate failures into Kubernetes clusters to check if it is resilient to turbulent conditions.


### Use Case and Target Personas
Krkn is designed for the following user roles:
- Site Reliability Engineers aiming to enhance the resilience and reliability of the Kubernetes platform and the applications it hosts. They also seek to establish a testing pipeline that ensures managed services adhere to best practices, minimizing the risk of prolonged outages.
- Developers and Engineers focused on improving the performance and robustness of their application stack when operating under failure scenarios.
- Kubernetes Administrators responsible for ensuring that onboarded services comply with established best practices to prevent extended downtime.


### Why do I want it?
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
![Krkn workflow](images/kraken-workflow.png)


### How to Get Started
Instructions on how to setup, configure and run Krkn can be found at [Installation](../installation.md).

You may consider utilizing the chaos recommendation tool prior to initiating the chaos runs to profile the application service(s) under test. This tool discovers a list of Krkn scenarios with a high probability of causing failures or disruptions to your application service(s). The tool can be accessed at [Chaos-Recommender](../chaos-recommender.md).

See the [getting started doc](../getting-started/_index.md.md) on support on how to get started with your own custom scenario or editing current scenarios for your specific usage.

After installation, refer back to the below sections for supported scenarios and how to tweak the Krkn config to load them on your cluster.


#### Running Krkn with minimal configuration tweaks
For cases where you want to run Krkn with minimal configuration changes, refer to [krkn-hub](https://github.com/krkn-chaos/krkn-hub). One use case is CI integration where you do not want to carry around different configuration files for the scenarios.


### Config
Instructions on how to setup the config and the options supported can be found at [Config](config.md).


### Krkn scenario pass/fail criteria and report
It is important to make sure to check if the targeted component recovered from the chaos injection and also if the Kubernetes cluster is healthy as failures in one component can have an adverse impact on other components. Krkn does this by:
- Having built in checks for pod and node based scenarios to ensure the expected number of replicas and nodes are up. 
- Leveraging [Cerberus](../cerberus/_index.md) to monitor the cluster under test and consuming the aggregated go/no-go signal to determine pass/fail post chaos. It is highly recommended to turn on the Cerberus health check feature available in Krkn. Instructions on installing and setting up Cerberus can be found [here](../cerberus/_index.md) or can be installed from Krkn using the [instructions](../installation/_index.md). 
- Leveraging built-in alert collection feature to fail the runs in case of critical alerts.
- Fail test if certain metrics aren't met at the end of the run

## Krkn Features

### Signaling
In CI runs or any external job it is useful to stop Krkn once a certain test or state gets reached. We created a way to signal to Krkn to pause the chaos or stop it completely using a signal posted to a port of your choice.

For example if we have a test run loading the cluster running and Krkn separately running; we want to be able to know when to start/stop the Krkn run based on when the test run completes or gets to a certain loaded state.

More detailed information on enabling and leveraging this feature can be found [here](signal.md).


### Performance monitoring
Monitoring the Kubernetes/OpenShift cluster to observe the impact of Krkn chaos scenarios on various components is key to find out the bottlenecks as it is important to make sure the cluster is healthy in terms if both recovery as well as performance during/after the failure has been injected. Instructions on enabling it witihn the config can be found [here](config.md#performance-monitoring).


### SLOs validation during and post chaos
- In addition to checking the recovery and health of the cluster and components under test, Krkn takes in a profile with the Prometheus expressions to validate and alerts, exits with a non-zero return code depending on the severity set. This feature can be used to determine pass/fail or alert on abnormalities observed in the cluster based on the metrics. 
- Krkn also provides ability to check if any critical alerts are firing in the cluster post chaos and pass/fail's. 

Information on enabling and leveraging this feature can be found [here](SLOs_validation.md)


### Health Checks 
Health checks provide real-time visibility into the impact of chaos scenarios on application availability and performance. The system periodically checks the provided URLs based on the defined interval and records the results in Telemetry. To read more about how to properly configure health checks in your krkn run and sample output see [health checks](health-checks.md) document. 


### Telemetry
We gather some basic details of the clsuter configuration and scenarios ran as part of a `telemetry` set of data that is printed off at the end of each krkn run. You can also opt in to the telemetry being stored in AWS S3 bucket or elasticsearch for long term storage. Find more details and configuration specifics [here](telemetry.md)


### OCM / ACM integration

Krkn supports injecting faults into [Open Cluster Management (OCM)](https://open-cluster-management.io/) and [Red Hat Advanced Cluster Management for Kubernetes (ACM)](https://www.krkn.com/en/technologies/management/advanced-cluster-management) managed clusters through [ManagedCluster Scenarios](..//managedcluster_scenarios.md).

## Where should I go next?

- [Installation](../installation/): Get started using krkn!
- [Scenarios](../scenarios/): Check out the scenarios we offer!
