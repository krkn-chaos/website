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


### Workflow
![Krkn workflow](images/kraken-workflow.png)

### Kraken scenario pass/fail criteria and report
It is important to check if the targeted component recovered from the chaos injection and if the Kubernetes cluster is healthy, since failures in one component can have an adverse impact on other components. Kraken does this by:
- Having built in checks for pod and node based scenarios to ensure the expected number of replicas and nodes are up. It also supports running custom scripts with the checks.
- Leveraging [Cerberus](../cerberus/_index.md) to monitor the cluster under test and consuming the aggregated go/no-go signal to determine pass/fail post chaos. 
    - It is highly recommended to turn on the Cerberus health check feature available in Kraken. Instructions on installing and setting up Cerberus can be found [here](../cerberus/_index.md) or can be installed from Kraken using the [instructions](../installation/_index.md). 
    - Once Cerberus is up and running, set cerberus_enabled to True and cerberus_url to the url where Cerberus publishes go/no-go signal in the Kraken config file. 
    - Cerberus can monitor [application routes](../cerberus/config.md) during the chaos and fails the run if it encounters downtime as it is a potential downtime in a customers or users environment. 
        - It is especially important during the control plane chaos scenarios including the API server, Etcd, Ingress, etc. 
        - It can be enabled by setting `check_application_routes: True` in the [Kraken config](https://github.com/krkn-chaos/krkn/blob/main/config/config.yaml) provided application routes are being monitored in the [cerberus config](https://github.com/krkn-chaos/krkn/blob/main/config/cerberus.yaml).
- Leveraging built-in alert collection feature to fail the runs in case of critical alerts.
    - See also: [SLOs validation](SLOs_validation.md) for more details on metrics and alerts 
Fail test if certain metrics aren't met at the end of the run

## Krkn Features

### Signaling
In CI runs or any external job it is useful to stop Krkn once a certain test or state gets reached. We created a way to signal to Krkn to pause the chaos or stop it completely using a signal posted to a port of your choice.

For example, if we have a test run loading the cluster running and Krkn separately running, we want to be able to know when to start/stop the Krkn run based on when the test run completes or when it gets to a certain loaded state

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
- [Config](config.md): See details on how to configure your krkn run
- [Scenarios](../scenarios/): Check out the scenarios we offer!
