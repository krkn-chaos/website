---
title: Pod Scenarios using Krkn
description: 
date: 2017-01-04
weight: 2
---
####  Example Config
The following are the components of Kubernetes for which a basic chaos scenario config exists today.


```yaml
kraken:
  chaos_scenarios:
    - plugin_scenarios:
      - path/to/scenario.yaml
```

You can then create the scenario file with the following contents:

```yaml
# yaml-language-server: $schema=../plugin.schema.json
- id: kill-pods
  config:
    namespace_pattern: ^kube-system$
    label_selector: k8s-app=kube-scheduler
    krkn_pod_recovery_time: 120
    
```

Please adjust the schema reference to point to the [schema file](https://github.com/krkn-chaos/krkn/blob/main/scenarios/plugin.schema.json). This file will give you code completion and documentation for the available options in your IDE.

#### Pod Chaos Scenarios

The following are the components of Kubernetes/OpenShift for which a basic chaos scenario config exists today.

| Component                | Description | Working  |
| ------------------------ |-------------| -------- |
| [Basic pod scenario](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kube/pod.yml) | Kill a pod. | :heavy_check_mark: |
| [Etcd](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/etcd.yml) | Kills a single/multiple etcd replicas. | :heavy_check_mark: |
| [Kube ApiServer](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/openshift-kube-apiserver.yml)| Kills a single/multiple kube-apiserver replicas. | :heavy_check_mark: |
| [ApiServer](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/openshift-apiserver.yml) | Kills a single/multiple apiserver replicas. | :heavy_check_mark: |
| [Prometheus](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/prometheus.yml) | Kills a single/multiple prometheus replicas. | :heavy_check_mark: |
| [OpenShift System Pods](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/regex_openshift_pod_kill.yml) | Kills random pods running in the OpenShift system namespaces. | :heavy_check_mark: |