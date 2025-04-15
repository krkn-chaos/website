---
title: Krkn RBAC
description: RBAC Authorization rules required to run Krkn scenarios.
weight: 2
---

# RBAC rules

Following is the compilation of all the rbac config required to run [run_kraken](https://github.com/redhat-chaos/krkn/blob/main/run_kraken.py) and each of the krkn test scenarios.

> **_NOTE:_** Below configuration assumes the user executing the krkrkn as `user1` and the user would be using the namespace `testnamespace` to test his application and run krn tests.

## [run_kraken](https://github.com/redhat-chaos/krkn/blob/main/run_kraken.py)

Allow the user to query prometheus metrics and get infrastructure,network level details.

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
openshift-monitoring   |  ""        |  "serviceaccounts/token" |   "create"
clusterRole    | "config.openshift.io"               | "networks","infrastructures","clusterversions" | "get","list"  

Allow the use user1 to view resources in test1 namespace
```
kubectl create rolebinding view-role-binding --clusterrole=view --user=user1 --namespace=testnamespace
```

## [Pod Scenarios](https://github.com/krkn-chaos/krkn/blob/main/docs/pod_scenarios.md)

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods"    | "delete"


## [Container Scenarios](https://github.com/krkn-chaos/krkn/blob/main/docs/container_scenarios.md) 

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec" | "get","create","delete"

## [Service Disruption Scenarios](https://github.com/krkn-chaos/krkn/blob/main/docs/service_disruption_scenarios.md) 

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec","services" | "get","create","delete"
testnamespace    | "apps"           | "daemonsets","statefulsets","replicasets","deployments" | "get","delete"

## [Application_outages](https://github.com/krkn-chaos/krkn/blob/main/docs/application_outages.md)

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | "networking.k8s.io"         | "networkpolicies" | "get","create","delete"

## [PVC scenario](https://github.com/krkn-chaos/krkn/blob/main/docs/pvc_scenario.md)

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec" | "get","create","delete"

## [Time Scenarios](https://github.com/krkn-chaos/krkn/blob/main/docs/time_scenarios.md)

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec" | "get","create","delete"

> ## **_NOTE:_** Grant the privileged SCC to the user running the pod, to execute all the below krkn testscenarios
```
oc adm policy add-scc-to-user privileged user1
```

## [Hog Scenarios: CPU, Memory](https://github.com/krkn-chaos/krkn/blob/main/docs/hog_scenarios.md)

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec" | "get","create","delete"
clusterRole    | ""               | "nodes","nodes/proxy" | "list","get"

## [Network_Chaos](https://github.com/krkn-chaos/krkn/blob/main/docs/network_chaos.md)

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec" | "get","create","delete"
testnamespace    | "batch"              | "jobs" | "get","delete","list","create"
clusterRole    | ""               | "nodes","nodes/proxy" | "list","get"

## [Pod Network Scenarios](https://github.com/krkn-chaos/krkn/blob/main/docs/pod_network_scenarios.md)

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec" | "get","create","delete"
testnamespace    | "batch"              | "jobs" | "get","delete","list","create"
clusterRole    | ""               | "nodes","nodes/proxy" | "list","get"
clusterRole    | "apiextensions.k8s.io"              | "customresourcedefinitions" | "get", "list", "watch"
clusterRole    | "config.openshift.io"               | "networks" | "get"

## Compounded list of all rbac rules

namespace/clusterRole  | apigroups  | resources | verb    
---------------------- | ---------- | --------- | ----
testnamespace    | ""               | "pods","pods/exec","services" | "get","create","delete"
testnamespace    | "batch"              | "jobs" | "get","delete","list","create"
clusterRole    | ""               | "nodes","nodes/proxy" | "list","get"
clusterRole    | "apiextensions.k8s.io"              | "customresourcedefinitions" | "get", "list", "watch"
clusterRole    | "config.openshift.io"               | "networks","infrastructures","clusterversions" | "get","list"