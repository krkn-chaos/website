---
title: Fitness Function
description: Configuring Fitness Function
weight: 2
---

The **fitness function** is a crucial element in the Krkn-AI algorithm. It evaluates each Chaos experiment and generates a score. These scores are then used during the selection phase of the algorithm to identify the best candidate solutions in each generation.

- The fitness function can be defined as an SLO or as cluster metrics using a Prometheus query.
- Fitness scores are calculated for the time range during which the Chaos scenario is executed.

## Example

Let's look at a simple fitness function that calculates the total number of restarts in a namespace:

```yaml
fitness_function: 
  query: 'sum(kube_pod_container_status_restarts_total{namespace="robot-shop"})'
  type: point
```

This fitness function calculates the number of restarts that occurred during the test in the specified namespace. The resulting value is referred to as the **Fitness Function Score**. These scores are computed for each scenario in every generation and can be found in the scenario YAML configuration within the results. Below is an example of a scenario YAML configuration:

```yaml
generation_id: 0
scenario_id: 1
scenario:
  name: node-memory-hog(60, 89, 8, kubernetes.io/hostname=node1,
    [], 1, quay.io/krkn-chaos/krkn-hog)
cmd: 'krknctl run node-memory-hog --telemetry-prometheus-backup False --wait-duration
  0 --kubeconfig ./tmp/kubeconfig.yaml --chaos-duration "60" --memory-consumption
  "89%" --memory-workers "8" --node-selector "kubernetes.io/hostname=node1"
  --taints "[]" --number-of-nodes "1" --image "quay.io/krkn-chaos/krkn-hog" '
log: ./results/logs/scenario_1.log
returncode: 0
start_time: '2025-09-01T16:55:12.607656'
end_time: '2025-09-01T16:58:35.204787'
fitness_result:
  scores: []
  fitness_score: 2
job_id: 1
health_check_results: {}
```

In the above result, the fitness score of `2` indicates that two restarts were observed in the namespace while running the `node-memory-hog` scenario. The algorithm uses this score as feedback to prioritize this scenario for further testing.


## Types of Fitness Function

There are two types of fitness functions available in Krkn-AI: **point** and **range**.

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

Krkn-AI allows you to define multiple fitness function items in the YAML configuration, enabling you to track how individual fitness values vary for different scenarios in the final outcome.

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

Krkn-AI uses [krknctl](../../krknctl/) under the hood to trigger Chaos testing experiments on the cluster. As part of the CLI, it captures various feedback and returns a non-zero status code when a failure occurs. By default, feedback from these failures is included in the Krkn-AI Fitness Score calculation.

You can disable this by setting the `include_krkn_failure` to `false`.

```yaml
fitness_function:
    include_krkn_failure: false
    query: 'sum(kube_pod_container_status_restarts_total{namespace="robot-shop"})'
    type: point
```

## Health Check

Results from application health checks are also incorporated into the fitness score. You can learn more about health checks and how to configure them in more detail [here](./health_check.md).

## How to Define a Good Fitness Function

- **Scoring**: The higher the fitness score, the more priority will be given to that scenario for generating new sets of scenarios. This also means that scenarios with higher fitness scores are more likely to have an impact on the cluster and should be further investigated.

- **Normalization**: Krkn-AI currently does not apply any normalization, except when a fitness function is assigned with weights. While this does not significantly impact the algorithm, from a user interpretation standpoint, it is beneficial to use normalized SLO queries in PromQL. For example, instead of using the maximum CPU for a pod as a fitness function, it may be more convenient to use the CPU percentage of a pod.

- **Use-Case Driven**: The fitness function query should be defined based on your use case. If you want to optimize your cluster for maximum uptime, a good fitness function could be to capture restart counts or the number of unavailable pods. Similarly, if you are interested in optimizing your cluster to ensure no downtime due to resource constraints, a good fitness function would be to measure the maximum CPU or memory percentage.

