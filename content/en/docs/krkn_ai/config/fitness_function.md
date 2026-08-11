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

> **Note:** `query` and `items` are alternatives. If both are set, `query` is used and `items` is ignored.

## Krkn Failures

Krkn-AI uses [krknctl](../../krknctl/) under the hood to trigger Chaos testing experiments on the cluster. As part of the CLI, it captures various feedback and returns a non-zero status code (exit status 2) when a failure occurs. By default, feedback from these failures is included in the Krkn-AI Fitness Score calculation.

You can disable this by setting the `include_krkn_failure` to `false`.

```yaml
fitness_function:
    include_krkn_failure: false
    query: 'sum(kube_pod_container_status_restarts_total{namespace="robot-shop"})'
    type: point
```

> **Note:** If a Krkn scenario exits with a non-zero status code other than 2, Krkn-AI assigns a fitness score of **-1** and stops the calculation of health scores. This typically indicates a misconfiguration or another issue with the scenario. For more details, please refer to the Krkn logs for the scenario.

## Health Check

Results from application health checks are also incorporated into the fitness score, controlled by `include_health_check_failure` and `include_health_check_response_time`. Both default to `true`. You can learn more about health checks and how to configure them in more detail [here](./health_check.md).

## Automatic Recommendations

Writing valid PromQL for an unfamiliar cluster is usually the slowest part of a first run, so [discover](../discover.md) proposes fitness queries that are already verified against your cluster's Prometheus.

Krkn-AI ships a catalog of queries covering common failure signals, in [catalog.yaml](https://github.com/krkn-chaos/krkn-ai/blob/main/krkn_ai/utils/catalog.yaml). Each entry is a PromQL template plus the metrics it depends on.

| Category | Example queries |
|-----------------|-----------------------------------------------------------------|
| `availability`  | `pod-restarts`, `crashloop-pods`, `deployment-replicas-missing` |
| `resource`      | `oom-kills`, `cpu-throttle`                                     |
| `node`          | `node-pressure`, `node-not-ready`                               |
| `control_plane` | `apiserver-errors`, `apiserver-latency`                         |
| `etcd`          | `etcd-request-latency`, `etcd-leader-changes`                   |
| `storage`       | `pvc-pending`                                                   |

For every entry, Krkn-AI checks:

- **Are the metrics available?** Every metric the query needs must be scraped by your Prometheus, otherwise the query is rejected.
- **Which namespaces?** Namespace scoped queries are generated once per discovered namespace, named `<key>:<namespace>`, for example `pod-restarts:robot-shop`.
- **Does it return a single value?** The query is run against Prometheus and must return one series, since a fitness function has to produce one number.
- **How much should it count?** Accepted queries are given weights that add up to 1.

Accepted queries are written under `items`. Rejected ones are commented out with the reason, so you can see what your cluster is missing.

```yaml
fitness_function:
  include_krkn_failure: true
  include_health_check_failure: true
  include_health_check_response_time: true
  # Fitness queries validated against the cluster's Prometheus.
  items:
  # pod-restarts:robot-shop
  - query: '(sum(increase(kube_pod_container_status_restarts_total{namespace="robot-shop"}[$range$]))) or vector(0)'
    type: range
    weight: 0.5
  # node-pressure
  - query: '(sum(kube_node_status_condition{condition=~"MemoryPressure|DiskPressure|PIDPressure", status="true"})) or vector(0)'
    type: range
    weight: 0.5
  # cpu-throttle:robot-shop (metric(s) not scraped: container_cpu_cfs_throttled_periods_total)
  # - query: '...'
  #   type: range
```

Every query is wrapped in `or vector(0)`. A Prometheus query that matches nothing returns an empty result, which would fail the scenario; the wrapper turns "nothing happened" into a score of `0`.

### Prometheus Access

Krkn-AI needs to reach Prometheus during `discover` to validate the queries.

On OpenShift, the URL is discovered from the Thanos Query route and the token from your kubeconfig credentials. If token discovery comes back empty, as it does for exec or certificate-based auth, set `PROMETHEUS_TOKEN` explicitly. On other clusters, set the URL yourself:

```bash
export PROMETHEUS_URL="http://localhost:9090"
export PROMETHEUS_TOKEN="<token>"
```

If Prometheus cannot be reached, `discover` still succeeds and writes a single default query that you can replace later.

### Learned Weights

Not every fitness query is equally useful. A query whose value is the same for every scenario tells the algorithm nothing.

After a run, Krkn-AI writes `learned_weights.json` into the run's output directory, scoring each query by how much its value varied across scenarios. Feed that back into the next `discover` to bias the weights towards the queries that actually distinguish scenarios:

```bash
uv run krkn_ai discover -k ./tmp/kubeconfig.yaml -o ./krkn-ai.yaml \
  --learned-weights ./results/<run-uuid>/learned_weights.json
```

Weights are matched per query and namespace, so they only apply when you discover the same namespaces again. They are used as a starting point and are still normalized to add up to 1.

### Adding a Query to the Catalog

To contribute a query, add an entry to [catalog.yaml](https://github.com/krkn-chaos/krkn-ai/blob/main/krkn_ai/utils/catalog.yaml):

```yaml
- key: my-metric
  category: availability
  name: Human readable name
  query_template: 'sum(increase(my_metric_total{namespace="$ns"}[$range$]))'
  requires: [my_metric_total]
  scope: namespace
```

- `key` and `query_template` are the only required fields.
- `$ns` is replaced with each discovered namespace and `$range$` with the scenario duration. Use `scope: cluster` for queries that are not namespace specific.
- The query must aggregate to a single series, so wrap it in `sum()`, `max()` or `avg()`.
- List every metric the query reads in `requires`, so Krkn-AI can skip it on clusters that do not scrape them.
- Do not add `or vector(0)` yourself, Krkn-AI adds it.

Run `discover` against a cluster that has the metric and check that your entry comes back enabled.

## How to Define a Good Fitness Function

- **Scoring**: The higher the fitness score, the more priority will be given to that scenario for generating new sets of scenarios. This also means that scenarios with higher fitness scores are more likely to have an impact on the cluster and should be further investigated.

- **Normalization**: Krkn-AI currently does not apply any normalization, except when a fitness function is assigned with weights. While this does not significantly impact the algorithm, from a user interpretation standpoint, it is beneficial to use normalized SLO queries in PromQL. For example, instead of using the maximum CPU for a pod as a fitness function, it may be more convenient to use the CPU percentage of a pod.

- **Use-Case Driven**: The fitness function query should be defined based on your use case. If you want to optimize your cluster for maximum uptime, a good fitness function could be to capture restart counts or the number of unavailable pods. Similarly, if you are interested in optimizing your cluster to ensure no downtime due to resource constraints, a good fitness function would be to measure the maximum CPU or memory percentage.

