---
title: Fitness Function
description: Configuring Fitness Function
weight: 2
---

The **fitness function** is a crucial element in the Chaos AI algorithm. It evaluates each Chaos experiment and generates a score. These scores are then used during the selection phase of the algorithm to identify the best candidate solutions in each generation.

- The fitness function can be defined as an SLO or as cluster metrics using a Prometheus query.
- Fitness scores are calculated for the time range during which the Chaos scenario is executed.


## Types of Fitness Function

There are two types of fitness functions available in Chaos AI: **point** and **range**.

### Point-Based Fitness Function

In the point-based fitness function type, we calculate the difference in the fitness function value between the end and the beginning of the Chaos experiment. This difference signifies the change that occurred during the experiment phase, allowing us to capture the delta. This approach is especially useful for Prometheus metrics that are counters and only increase, as the difference helps us determine the actual change during the experiment.

E.g SLO: Pod Restarts across "robot-shop" namespace.

```yaml
fitness_function: 
  query: 'sum(kube_pod_container_status_restarts_total{namespace="robot-shop"})'
  type: point
```

### Range-Based Fitness Function

Certain SLOs require us to consider changes that occur over a period of time by using aggregate values such as min, max, or average. For these types of value-based metrics in Prometheus, the **range** type of Fitness Function is useful.

Because the **range** type is calculated over a time interval—and the exact timing of each Chaos experiment may not be known in advance—we provide a `$range$` parameter that must be used in the fitness function definition.

E.g SLO: Max CPU observed for a container.

```yaml
fitness_function: 
  query: 'max_over_time(container_cpu_usage_seconds_total{namespace="robot-shop", container="mysql"}[$range$])'
  type: range
```

## Defining Multiple Fitness Functions

Chaos AI allows you to define multiple fitness function items in the YAML configuration, enabling you to track how individual fitness values vary for different scenarios in the final outcome.

You can assign a `weight` to each fitness function to specify how its value impacts the final score used during Genetic Algorithm selection. Each weight should be between 0 and 1. By default, if no weight is specified, it will be considered as 1.

```yaml
fitness_function:
  items:
  - query: 'sum(kube_pod_container_status_restarts_total{namespace="robot-shop"})'
    type: point
    weight: 0.3
  - query: 'sum(kube_pod_container_status_restarts_total{namespace="etcd"})'
    type: point
```

## Krkn Failures

Chaos AI uses [krknctl](../../krknctl/) under the hood to trigger Chaos testing experiments on the cluster. As part of the CLI, it captures various feedback and returns a non-zero status code when a failure occurs. By default, feedback from these failures is included in the Chaos AI Fitness Score calculation.

You can disable this by setting the `include_krkn_failure` to `false`.

```yaml
fitness_function:
    include_krkn_failure: false
    query: 'sum(kube_pod_container_status_restarts_total{namespace="robot-shop"})'
    type: point
```

