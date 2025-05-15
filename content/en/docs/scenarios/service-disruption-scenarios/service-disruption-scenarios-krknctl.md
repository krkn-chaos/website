---
title: Service Disruption Scenario using Krknctl
description: 
date: 2017-01-04
weight: 2
---

```bash
krknctl run service-disruption-scenarios (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
~-~-namespace | Targeted namespace in the cluster (required) |string | openshift-etcd | 
~-~-label-selector | Label of the namespace to target. Set this parameter only if NAMESPACE is not set |string | 
~-~-delete-count | Number of namespaces to kill in each run, based on matching namespace and label specified |number | 1 | 
~-~-runs | Number of runs to execute the action |number | 1 |


To see all available scenario options 
```bash
krknctl run service-disruption-scenarios --help 
```