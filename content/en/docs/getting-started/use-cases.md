---
title: Krkn Use cases
description: 
weight : 3
date: 2017-01-05
categories: [Best Practices, Placeholders]
tags: [docs]
---

# [Network Chaos NG](docs/scenarios/network-chaos-ng-scenario/_index.md)

{{< notice type="info" >}}To utilize the Node Network Filter and Pod Network Filter scenarios you'll need to run privileged pods on your cluster {{< /notice >}}

## Node Network Filter 

### AWS EFS (Elastic File System) disruption
#### Description
This scenario creates an outgoing firewall rule on specific nodes in your cluster, chosen by node name or a selector. This rule blocks connections to AWS EFS, leading to a temporary failure of any EFS volumes mounted on those affected nodes.

#### podman

```bash
podman run -v ~/.kube/config:/home/krkn/.kube/config:z -e TEST_DURATION="60" -e INGRESS="false" -e EGRESS="true" -e PROTOCOLS="tcp,udp" -e PORTS="2049" -e NODE_NAME="kind-control-plane" quay.io/krkn-chaos/krkn-hub:node-network-filter
```

#### krknctl 

```bash
krknctl run node-network-filter \
 --chaos-duration 60 \
 --node-name kind-control-plane \
 --ingress false \
 --egress true \
 --protocols tcp,udp \
 --ports 2049
```

### etcd split brain
#### Description
This scenario isolates an etcd node by blocking its network traffic. This action forces an etcd leader re-election. Once the scenario concludes, the cluster should temporarily exhibit a split-brain condition, with two etcd leaders active simultaneously. This is particularly useful for testing the etcd cluster's resilience under such a challenging state.


{{< notice type="danger" >}} This scenario carries a significant risk: it **might break the cluster API**, making it impossible to automatically revert the applied network rules. The `iptables` rules will be printed to the console, allowing for manual reversal via a shell on the affected node. This scenario is **best suited for disposable clusters** and should be **used at your own risk**. {{< /notice >}}



#### podman
```bash
podman run -v ~/.kube/config:/home/krkn/.kube/config:z -e TEST_DURATION="60" -e INGRESS="false" -e EGRESS="true" -e PROTOCOLS="tcp" -e PORTS="2379,2380" -e NODE_NAME="kind-control-plane" quay.io/krkn-chaos/krkn-hub:node-network-filter
```
#### krknctl
```bash
krknctl run node-network-filter \
 --chaos-duration 60 \
 --node-name kind-control-plane \
 --ingress false \
 --egress true \
 --protocols tcp \
 --ports 2379,2380
```
## Pod Network Filter
### Pod DNS outage
#### Description
This scenario blocks all outgoing DNS traffic from a specific pod, effectively preventing it from resolving any hostnames or service names.
#### podman
```bash
podman run -v ~/.kube/config:/home/krkn/.kube/config:z -e TEST_DURATION="60" -e INGRESS="false" -e EGRESS="true" -e PROTOCOLS="tcp,udp" -e PORTS="53" -e POD_NAME="target-pod" quay.io/krkn-chaos/krkn-hub:pod-network-filter
```
#### krknctl
```bash
krknctl run pod-network-filter \
 --chaos-duration 60 \
 --pod-name target-pod \
 --ingress false \
 --egress true \
 --protocols tcp,udp \
 --ports 53
```
### Pod AWS aurora Disruption
#### Description
This scenario blocks a pod's outgoing MySQL and PostgreSQL traffic, effectively preventing it from connecting to any AWS Aurora SQL engine. It works just as well for standard MySQL and PostgreSQL connections too.
#### podman
```bash
podman run -v ~/.kube/config:/home/krkn/.kube/config:z -e TEST_DURATION="60" -e INGRESS="false" -e EGRESS="true" -e PROTOCOLS="tcp" -e PORTS="3306,5432" -e POD_NAME="target-pod" quay.io/krkn-chaos/krkn-hub:pod-network-filter
```
#### krknctl
```bash
krknctl run pod-network-filter \
 --chaos-duration 60 \
 --pod-name target-pod \
 --ingress false \
 --egress true \
 --protocols tcp \
 --ports 3306,5432
```