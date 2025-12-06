---
title: Getting Started
description: How to deploy sample microservice and run Krkn-AI test
weight : 1
categories: [Best Practices, Placeholders]
tags: [docs]
---

## Getting Started with Krkn-AI

This documentation details how to deploy a sample microservice application on Kubernetes Cluster and run Krkn-AI test.

### Prerequisites

- Follow this [guide](../installation/krkn-ai.md) to install Krkn-AI CLI. 
- Krkn-AI uses Thanos Querier to fetch SLO metrics by PromQL. You can easily install it by setting up [prometheus-operator](https://github.com/prometheus-operator/prometheus-operator) in your cluster.


### Deploy Sample Microservice

For demonstration purpose, we will deploy a sample microservice called [robot-shop](https://github.com/instana/robot-shop) on the cluster:

```bash
# Change to Krkn-AI project directory
cd krkn-ai/

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

Krkn-AI uses YAML configuration files to define experiments. You can generate a sample config file dynamically by running Krkn-AI [discover](./discover.md) command.

```bash
# Discover components in cluster to generate the config
$ uv run krkn_ai discover -k ./tmp/kubeconfig.yaml \
  -n "robot-shop" \
  -pl "service" \
  -nl "kubernetes.io/hostname" \
  -o ./tmp/krkn-ai.yaml \
  --skip-pod-name "nginx-proxy.*"
```

Discover command generates a `yaml` file as an output that contains the initial boilerplate for testing. You can modify this file to include custom SLO definitions, cluster components and configure algorithm settings as per your testing use-case.

### Running Krkn-AI

Once your test configuration is set, you can start Krkn-AI testing using the [run](./run.md) command. This command initializes a random population sample containing Chaos Experiments based on the Krkn-AI configuration, then starts the [evolutionary algorithm](./config/evolutionary_algorithm.md) to run the experiments, gather feedback, and continue evolving existing scenarios until the total number of generations defined in the config is met.  

```bash
# Configure Prometheus
# (Optional) In OpenShift cluster, the framework will automatically look for thanos querier in openshift-monitoring namespace. 
export PROMETHEUS_URL='https://Thanos-Querier-url'
export PROMETHEUS_TOKEN='enter-access-token'

# Start Krkn-AI test
uv run krkn_ai run -vv -c ./krkn-ai.yaml -o ./tmp/results/ -p HOST=$HOST
```

### Understanding the Results

In the `./tmp/results` directory, you will find the results from testing. The final results contain information about each scenario, their fitness evaluation scores, reports, and graphs, which you can use to further investigate.

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
    └── krkn-ai.yaml
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
