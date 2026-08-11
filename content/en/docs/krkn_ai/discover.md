---
title: Cluster Discovery
description: Automatically discover cluster components for Krkn-AI testing.
weight: 2
---

Krkn-AI uses a genetic algorithm to generate Chaos scenarios. These scenarios require information about the components available in the cluster, which is obtained from the `cluster_components` YAML field of the Krkn-AI configuration.

### CLI Usage

```bash
$ uv run krkn_ai discover --help
Usage: krkn_ai discover [OPTIONS]

  Discover components for Krkn-AI tests

Options:
  -k, --kubeconfig TEXT   Path to cluster kubeconfig file.
  -o, --output TEXT       Path to save config file.
  -n, --namespace TEXT    Namespace(s) to discover components in. Supports
                          Regex and comma separated values.
  -pl, --pod-label TEXT   Pod Label Keys(s) to filter. Supports Regex and
                          comma separated values.
  -nl, --node-label TEXT  Node Label Keys(s) to filter. Supports Regex and
                          comma separated values.
  -v, --verbose           Increase verbosity of output.
  --skip-pod-name TEXT    Pod name to skip. Supports comma separated values
                          with regex.
  -S, --save-strategy [skip|overwrite|merge]
                          How to save: skip, overwrite (replace), or merge
                          (add new components, keep your edits). Note: merge
                          does not preserve comments.
  --learned-weights TEXT  Path to a learned_weights.json from a previous run,
                          to prioritize fitness queries.
  --help                  Show this message and exit.
```

Alongside `cluster_components`, `discover` also fills in the [scenarios](./config/scenarios.md) your cluster can run, [health check URLs](./config/health_check.md) built from LoadBalancer services, and [fitness queries](./config/fitness_function.md) validated against your Prometheus.

### Example

The example below filters cluster components from namespaces that match the patterns `robot-.*` and `etcd`. In addition to namespaces, we also provide filters for pod labels and node labels. This allows us to narrow down the necessary components to consider when running a Krkn-AI test.

```bash
uv run krkn_ai discover -k ./tmp/kubeconfig.yaml \
  -n "robot-.*,etcd" \
  -pl "service,env" \
  -nl "disktype" \
  -o ./krkn-ai.yaml
```

The above command generates a config file that contains the basic setup to help you get started. You can customize the parameters as described in the [configs](./config/) documentation. If you want to exclude any cluster components—such as a pod, node, or namespace—from being considered for Krkn-AI testing, simply remove them from the `cluster_components` YAML field.

```yaml
# Path to your kubeconfig file
kubeconfig_file_path: "./path/to/kubeconfig.yaml"

# Duration to wait before running next scenario (seconds)
wait_duration: 30

# Algorithm selector
algorithm: genetic

# Genetic algorithm parameters
genetic:
  generations: 5
  population_size: 10
  composition_rate: 0.3
  population_injection_rate: 0.1
  scenario_mutation_rate: 0.6

# Specify how result filenames are formatted
output:
  result_name_fmt: "scenario_%s.yaml"
  graph_name_fmt: "scenario_%s.png"
  log_name_fmt: "scenario_%s.log"

# Fitness queries recommended from the cluster's Prometheus
fitness_function:
  include_krkn_failure: true
  include_health_check_failure: true
  include_health_check_response_time: true
  items:
  # pod-restarts:robot-shop
  - query: '(sum(increase(kube_pod_container_status_restarts_total{namespace="robot-shop"}[$range$]))) or vector(0)'
    type: range
    weight: 0.5
  # node-pressure
  - query: '(sum(kube_node_status_condition{condition=~"MemoryPressure|DiskPressure|PIDPressure", status="true"})) or vector(0)'
    type: range
    weight: 0.5

# Application endpoints discovered from LoadBalancer services
health_checks:
  stop_watcher_on_failure: false
  stop_timeout: 5
  applications:
  - name: "cart"
    url: "http://192.0.2.10:80/health"

# Chaos scenarios your cluster can run, decided during discovery
scenario:
  pod-scenarios:
    enable: true
  application-outages:
    enable: true
  container-scenarios:
    enable: true
  node-cpu-hog:
    enable: true
  node-memory-hog:
    enable: true
  kubevirt-scenarios:
    enable: false

# Cluster components to consider for Krkn-AI testing
cluster_components:
  namespaces:
  - name: robot-shop
    pods:
    - containers:
      - name: cart
      labels:
        service: cart
        env: dev
      name: cart-7cd6c77dbf-j4gsv
    - containers:
      - name: catalogue
      labels:
        service: catalogue
        env: dev
      name: catalogue-94df6b9b-pjgsr

    services:
    - labels:
        app.kubernetes.io/managed-by: Helm
      name: cart
      ports:
      - port: 8080
        protocol: TCP
        target_port: 8080
    - labels:
        app.kubernetes.io/managed-by: Helm
        service: catalogue
      name: catalogue
      ports:
      - port: 8080
        protocol: TCP
        target_port: 8080

  - name: etcd
    pods:
    - containers:
      - name: etcd
        labels:
          service: etcd
        name: etcd-0
    - containers:
      - name: etcd
        labels:
          service: etcd
        name: etcd-1
  nodes:
  - labels:
      kubernetes.io/hostname: node-1
      disktype: SSD
    name: node-1
    taints: []
  - labels:
      kubernetes.io/hostname: node-2
      disktype: HDD
    name: node-2
    taints: []
```

### Save Strategy

By default `discover` won't overwrite an existing output file. Control this with `--save-strategy`:

| Strategy         | Behavior                                              |
|------------------|-------------------------------------------------------|
| `skip` (default) | Keep the existing file, do nothing.                   |
| `overwrite`      | Replace the file with a fresh config.                 |
| `merge`          | Keep your edits, add newly discovered components.     |

```bash
uv run krkn_ai discover -k ./tmp/kubeconfig.yaml -o ./krkn-ai.yaml --save-strategy merge
```

`merge` preserves manual edits (e.g. `disabled: true`) and adds newly discovered components.

> **Note:** Comments inside `cluster_components` are not preserved after a merge.

The save strategy also decides how much of the config is regenerated. Scenario enablement and health checks are only worked out when the file is written fresh, either because it does not exist yet or because you passed `overwrite`. Fitness queries are also refreshed on `merge`.

| Strategy | Cluster components | Scenarios and health checks | Fitness queries |
|---|---|---|---|
| `skip` (file exists) | unchanged | unchanged | unchanged |
| `overwrite` | replaced | regenerated | regenerated |
| `merge` | added to | unchanged | new ones added |
