---
title: Best Practices
# date: 2017-01-05
description: >
  Let us take a look at the best practices for an Kubernetes cluster.
categories: [Best Practices, Placeholders]
tags: [docs]
---

<!-- {{% pageinfo %}}
  Let us take a look at the best practices for an Kubernetes cluster.
{{% /pageinfo %}} -->

Now that we understand the test methodology, let us take a look at the best practices for an Kubernetes cluster. On that platform there are user applications and cluster workloads that need to be designed for stability and to provide the best user experience possible:
- Alerts with appropriate severity should get fired.
  - Alerts are key to identify when a component starts degrading, and can help focus the investigation effort on affected system components.
  - Alerts should have proper severity, description, notification policy, escalation policy, and SOP in order to reduce MTTR for responding SRE or Ops resources.
  - Detailed information on the alerts consistency can be found here.


- Minimal performance impact - Network, CPU, Memory, Disk, Throughput etc.
  - The system, as well as the applications, should be designed to have minimal performance impact during disruptions to ensure stability and also to avoid hogging resources that other applications can use. We want to look at this in terms of CPU, Memory, Disk, Throughput, Network etc.
  - We want to look at this in terms of CPU, Memory, Disk, Throughput, Network etc.

- Appropriate CPU/Memory limits set to avoid performance throttling and OOM kills.
  - There might be rogue applications hogging resources ( CPU/Memory ) on the nodes which might lead to applications underperforming or worse getting OOM killed. It is important to ensure that applications and system components have reserved resources for the kube-scheduler to take into consideration in order to keep them performing at the expected levels.

- Services dependent on the system under test need to handle the failure gracefully to avoid performance degradation and downtime - appropriate timeouts.
  - In a distributed system, services deployed coordinate with each other and might have external dependencies. Each of the services deployed as a deployment, pod, or container, need to handle the downtime of other dependent services gracefully instead of crashing due to not having appropriate timeouts, fallback logic etc.

- Proper node sizing to avoid cascading failures and ensure cluster stability especially when the cluster is large and dense
  - The platform needs to be sized taking into account the resource usage spikes that might occur during chaotic events. For example, if one of the main nodes goes down, the other two main nodes need to have enough resources to handle the load. The resource usage depends on the load or number of objects that are running being managed by the Control Plane ( Api Server, Etcd, Controller and Scheduler ). As such, it’s critical to test such conditions, understand the behavior, and leverage the data to size the platform appropriately. This can help keep the applications stable during unplanned events without the control plane undergoing cascading failures which can potentially bring down the entire cluster.

- Proper node sizing to avoid application failures and maintain stability.
  - An application pod might use more resources during reinitialization after a crash, so it is important to take that into account for sizing the nodes in the cluster to accommodate it. For example, monitoring solutions like Prometheus need high amounts of memory to replay the write ahead log ( WAL ) when it restarts. As such, it’s critical to test such conditions, understand the behavior, and leverage the data to size the platform appropriately. This can help keep the application stable during unplanned events without undergoing degradation in performance or even worse hog the resources on the node which can impact other applications and system pods.

- Minimal initialization time and fast recovery logic.
  - The controller watching the component should recognize a failure as soon as possible. The component needs to have minimal initialization time to avoid extended downtime or overloading the replicas if it is a highly available configuration. The cause of failure can be because of issues with the infrastructure on top of which it is running, application failures, or because of service failures that it depends on.

- High Availability deployment strategy.
  - There should be multiple replicas ( both Kubernetes and application control planes ) running preferably in different availability zones to survive outages while still serving the user/system requests. Avoid single points of failure.

- Backed by persistent storage
  - It is important to have the system/application backed by persistent storage. This is especially important in cases where the application is a database or a stateful application given that a node, pod, or container failure will wipe off the data.

- There should be fallback routes to the backend in case of using CDN, for example, Akamai in case of console.redhat.com - a managed service deployed on top of Kubernetes dedicated:
  - Content delivery networks (CDNs) are commonly used to host resources such as images, JavaScript files, and CSS. The average web page is nearly 2 MB in size, and offloading heavy resources to third-parties is extremely effective for reducing backend server traffic and latency. However, this makes each CDN an additional point of failure for every site that relies on it. If the CDN fails, its customers could also fail.
  - To test how the application reacts to failures, drop all network traffic between the system and CDN. The application should still serve the content to the user irrespective of the failure.

- Appropriate caching and Content Delivery Network should be enabled to be performant and usable when there is a latency on the client side.
  - Not every user or machine has access to unlimited bandwidth, there might be a delay on the user side ( client ) to access the API’s due to limited bandwidth, throttling or latency depending on the geographic location. It is important to inject latency between the client and API calls to understand the behavior and optimize things including caching wherever possible, using CDN’s or opting for different protocols like HTTP/2 or HTTP/3 vs HTTP.
