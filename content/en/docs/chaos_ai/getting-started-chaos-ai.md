---
title: Getting Started
description: How to deploy sample microservice and run Chaos AI test
weight : 1
categories: [Best Practices, Placeholders]
tags: [docs]
---

## Getting Started with Chaos AI

This documentation details how to deploy a sample microservice application on Kubernetes Cluster and run Chaos AI test.

### Prerequisites

- Follow this [guide](../installation/chaos-ai.md) to install Chaos-AI CLI. 
- Chaos AI uses Thanos Querier to fetch SLO metrics by PromQL. You can easily install it by setting up [prometheus-operator](https://github.com/prometheus-operator/prometheus-operator) in your cluster.


### Deploy Sample Microservice

For demonstration purpose, we will deploy a sample microservice called [robot-shop](https://github.com/instana/robot-shop) on the cluster:

```bash
# Change to Chaos AI project directory
cd chaos-ai/

# Namespace where to deploy the microservice application
export DEMO_NAMESPACE=robot-shop

# Whether the K8s cluster is an OpenShift cluster
export IS_OPENSHIFT=true
./scripts/setup-demo-microservice.sh

# Set context to the demo namespace
oc config set-context --current --namespace=$DEMO_NAMESPACE
# If you are using kubectl:
# kubectl config set-context --current --namespace=$DEMO_NAMESPACE

# Check whether pods are running
oc get pods
```

We will deploy a NGINX reverse proxy and a LoadBalancer service in the cluster to expose the routes for some of the pods.

```bash
# Setup NGINX reverse proxy for external access
./scripts/setup-nginx.sh

# Check nginx pod
oc get pods -l app=nginx-proxy

# Test application endpoints
./scripts/test-nginx-routes.sh

export HOST="http://$(kubectl get service rs -o json | jq -r '.status.loadBalancer.ingress[0].hostname')"
```

{{% alert title="Note" %}} If your cluster uses Ingress or custom annotation to expose the services, make sure to follow those steps.{{% /alert %}}

### 📝 Generate Configuration

Chaos AI uses YAML configuration files to define experiments. You can generate a sample config file dynamically by running Chaos AI discover command.

```bash
$ uv run chaos_ai discover --help
Usage: chaos_ai discover [OPTIONS]

  Discover components for Chaos AI tests

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
  --help                  Show this message and exit.

# Discover components in cluster to generate the config
$ uv run chaos_ai discover -k ./path/to/kubeconfig.yaml -n "robot-shop" -pl "service" -o ./chaos-ai.yaml
```

Discover command generates a `yaml` file as an output that contains the initial boilerplate for testing. You can modify this file to include custom SLO definitions, cluster components and configure algorithm settings as per your testing use-case.   

```yaml
# Path to your kubeconfig file
kubeconfig_file_path: "./path/to/kubeconfig.yaml"

# Genetic algorithm parameters
generations: 5
population_size: 10
composition_rate: 0.3
population_injection_rate: 0.1

# Fitness function configuration for defining SLO
# In the below example, we use Total Restarts in "robot-shop" namespace as the SLO
fitness_function: 
  query: 'sum(kube_pod_container_status_restarts_total{namespace="robot-shop"})'
  type: point
  # Whether to include non-zero exit code status in the fitness function scoring
  include_krkn_failure: true

# Health endpoints for synthetic monitoring of applications
health_checks:
  stop_watcher_on_failure: false
  applications:
  - name: cart
    url: "$HOST/cart/add/1/Watson/1"
  - name: catalogue
    url: "$HOST/catalogue/categories"

# Chaos scenarios to consider during testing
scenario:
  pod-scenarios:
    enable: true
  application-outages:
    enable: true
  container-scenarios:
    enable: false
  node-cpu-hog:
    enable: false
  node-memory-hog:
    enable: false

# Cluster components to consider for Chaos AI testing
cluster_components:
  namespaces:
  - name: robot-shop
    pods:
    - containers:
      - name: cart
      labels:
        service: cart
      name: cart-7cd6c77dbf-j4gsv
    - containers:
      - name: catalogue
      labels:
        service: catalogue
      name: catalogue-94df6b9b-pjgsr
  nodes:
  - labels:
      kubernetes.io/hostname: node-1
    name: node-1
  - labels:
      kubernetes.io/hostname: node-2
    name: node-2
```

### Running Chaos AI

Once your test configuration are set, you can start the Chaos AI testing by running the following command: 

```bash
$ uv run chaos_ai run --help
Usage: chaos_ai run [OPTIONS]

  Run Chaos AI tests

Options:
  -c, --config TEXT               Path to chaos AI config file.
  -o, --output TEXT               Directory to save results.
  -f, --format [json|yaml]        Format of the output file.
  -r, --runner-type [krknctl|krknhub]
                                  Type of chaos engine to use.
  -p, --param TEXT                Additional parameters for config file in
                                  key=value format.
  -v, --verbose                   Increase verbosity of output.
  --help                          Show this message and exit.


# Configure Prometheus
# (Optional) In OpenShift cluster, the framework will automatically look for thanos querier in openshift-monitoring namespace. 
export PROMETHEUS_URL='https://Thanos-Querier-url'
export PROMETHEUS_TOKEN='enter-access-token'

# Start Chaos AI test
uv run chaos_ai run -vv -c ./chaos-ai.yaml -o ./tmp/results/ -p HOST=$HOST
```

### Understanding the Results

Under the `./tmp/results` you should be able to find the results from testing.

```
.
└── results/
    ├── reports/
    │   ├── best_scenarios.yaml
    │   ├── health_check_report.csv
    │   └── graphs/
    │       ├── best_generation.png
    │       ├── scenario_1.png
    │       ├── scenario_2.png
    │       └── ...
    ├── yaml/
    │   ├── generation_0/
    │   │   ├── scenario_1.yaml
    │   │   ├── scenario_2.yaml
    │   │   └── ...
    │   └── generation_1/
    │       └── ...
    ├── log/
    │   ├── scenario_1.log
    │   ├── scenario_2.log
    │   └── ...
    └── config.yaml
```

**Reports Directory**:

- `health_check_report.csv`: Summary of application health checks containing details about the scenario, component, failure status and latency.
- `best_scenarios.yaml`: YAML file containing information about best scenario identified in each generation.
- `best_generation.png`: Visualization of best fitness score found in each generation.
- `scenario_<ids>.png`: Visualization of response time line plot for health checks and heatmap for success and failures.

**YAML**:
- `scenario_<id>.yaml`: YAML file detailing about the Chaos scenario executed which includes the krknctl command, fitness scores, health check metrices, etc. These files are organised under each `generation` folder.

**Log**:
- `scenario_<id>.log`: Logs captured from krknctl scenario.
