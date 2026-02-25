---
title: What is Krkn?
description: Understanding Krkn's purpose, design, and place in the chaos engineering ecosystem
type: "docs/scenarios"
---

## Overview

Krkn is a chaos and resiliency testing tool specifically designed for Kubernetes environments. It injects deliberate failures into Kubernetes clusters to verify whether they can withstand turbulent conditions and recover gracefully.

Unlike some chaos tools that run as in-cluster operators, Krkn runs **outside your cluster** and interacts with Kubernetes and cloud provider APIs to orchestrate chaos scenarios. This design choice has important implications we'll explore below.

## Who Uses Krkn?

Krkn serves three primary user personas:

### Site Reliability Engineers (SREs)

SREs use Krkn to enhance the resilience of Kubernetes platforms and the applications they host. They establish testing pipelines that ensure managed services follow best practices, reducing the risk of prolonged outages.

**Example workflow:**
- Deploy new Kubernetes cluster
- Run Krkn scenarios against control plane
- Verify cluster self-heals from node failures
- Validate monitoring alerts fire correctly
- Certify cluster for production use

### Application Developers & Engineers

Developers use Krkn to improve application robustness under failure conditions. By injecting faults during testing, they discover how their services behave when dependencies fail, networks degrade, or resources become constrained.

**Example workflow:**
- Deploy application to staging cluster
- Run pod failure scenarios during load test
- Observe degraded performance or failures
- Fix resilience bugs (missing retries, single replicas, etc.)
- Re-test until application stays available

### Kubernetes Administrators

Administrators use Krkn to ensure onboarded services comply with platform standards and won't cause extended downtime. They validate that teams follow best practices like running multiple replicas, setting resource limits, and implementing health checks.

**Example workflow:**
- Service team requests production deployment
- Admin runs Krkn pod chaos against service
- Scenario reveals service runs single replica (downtime risk)
- Team fixes issue before production deployment
- Admin certifies service meets resilience standards

## How Krkn Works

### High-Level Workflow

```
┌──────────────────┐
│   Krkn Config    │  Define which scenarios to run
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Scenario Loader  │  Load scenario configurations
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Chaos Injector  │  Execute chaos via K8s/cloud APIs
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    Cerberus      │  Monitor cluster health (optional)
│   (Optional)     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Health Validator │  Check recovery and validate SLOs
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Telemetry &     │  Report results and collect data
│    Reporting     │
└──────────────────┘
```

### Key Components

**1. Scenario Engine**
- Loads chaos scenario definitions (YAML files)
- Orchestrates scenario execution
- Manages timing, iterations, and intervals
- Handles scenario dependencies

**2. Chaos Injectors**
- Interface with Kubernetes API to delete pods, drain nodes, etc.
- Call cloud provider APIs for node/zone failures
- Use network tools (tc, eBPF) for network chaos
- Execute resource hogs and time skew scenarios

**3. Cerberus Integration (Optional)**
- Monitors cluster health continuously
- Checks pod health, node status, and API availability
- Optionally monitors application routes
- Provides go/no-go signal to Krkn
- Fails chaos run if cluster doesn't recover

**4. SLO Validation**
- Queries Prometheus for metrics during/after chaos
- Evaluates custom expressions (latency, error rates, etc.)
- Checks for critical alerts firing
- Determines pass/fail based on thresholds

**5. Telemetry Collection**
- Gathers cluster metadata (version, size, provider)
- Records scenario execution details
- Stores results in S3 or Elasticsearch (optional)
- Generates summary reports

## Why Run Outside the Cluster?

Krkn's **external design** distinguishes it from in-cluster chaos tools like LitmusChaos or ChaosMesh. Here's why:

### Advantages of External Execution

**1. Survives Cluster Failures**
- If the cluster control plane fails, Krkn keeps running
- Can observe and report on total cluster outages
- Not affected by network partitions or node failures
- Useful for testing catastrophic scenarios (zone outages, power failures)

**2. Tests Across Multiple Clusters**
- Single Krkn instance can test many clusters
- Ideal for managed cluster scenarios (ACM/OCM)
- Useful in CI/CD pipelines that create/destroy clusters
- Centralized chaos orchestration

**3. Simpler Setup for CI/CD**
- No in-cluster installation required
- Just run Krkn container with kubeconfig
- Easier to integrate with pipelines
- No cluster permissions needed beyond what scenarios require

**4. Cloud Provider Integration**
- Can call cloud APIs directly (AWS, GCP, Azure, etc.)
- Enables realistic node failures (terminate instances)
- Supports zone/region outage simulation
- Tests infrastructure-level resilience

### Tradeoffs

**1. Requires External Environment**
- Need a machine/container to run Krkn
- Must have network access to cluster
- Kubeconfig management required

**2. Network Dependency**
- If Krkn loses connectivity, it can't inject chaos
- Not ideal for testing network splits from Krkn's perspective
- (But Cerberus, running in-cluster, can still report)

**3. No Declarative CRDs**
- Not Kubernetes-native (no CustomResourceDefinitions)
- Can't leverage K8s RBAC as finely
- Scenarios defined in YAML, not K8s objects

These tradeoffs are intentional design decisions favoring robustness and flexibility over Kubernetes-native integration.

## Three Interfaces: krkn, krkn-hub, krknctl

Krkn provides three ways to run chaos scenarios, each optimized for different use cases:

### krkn (Python Program)

The original standalone Python application.

**Best for:**
- Running multiple scenario types in one execution
- Advanced customization and scripting
- Development and experimentation

**Key characteristic:** Configuration-driven, flexible, requires Python environment.

### krkn-hub (Containerized)

Containerized version with one container image per scenario type.

**Best for:**
- CI/CD integration (GitHub Actions, Tekton, Jenkins)
- Simplified deployments (just run a container)
- Consistent environments

**Key characteristic:** Pre-built images, simple, runs one scenario type at a time.

### krknctl (CLI Tool)

Dedicated command-line tool with auto-completion and validation.

**Best for:**
- Interactive usage and quick tests
- New users learning Krkn
- Developers testing locally

**Key characteristic:** User-friendly, validates input, no config files needed.

**When to use each:**
- **Learning?** → krknctl (easiest)
- **CI pipeline?** → krkn-hub (containerized)
- **Complex multi-scenario runs?** → krkn (most flexible)

See [krkn vs krkn-hub vs krknctl](krkn-vs-krkn-hub-vs-krknctl/) for a detailed comparison.

## Pass/Fail Criteria

Krkn determines whether a chaos scenario passed or failed using multiple signals:

### 1. Resource Recovery Checks

For pod and node scenarios, Krkn verifies:
- Expected number of replicas are back up
- Pods are in `Running` state
- Nodes return to `Ready` state

If resources don't recover within timeout, the scenario fails.

### 2. Cerberus Health Signal

When Cerberus is enabled:
- Cerberus monitors cluster health continuously
- Checks pod health, node status, API responsiveness
- Optionally monitors application routes (URL checks)
- Provides aggregated go/no-go signal

If Cerberus reports cluster unhealthy, scenario fails.

**Why this matters:** A pod might restart successfully, but if the control plane is degraded or other services fail, that's still a failure state.

### 3. SLO Validation

Krkn can query Prometheus for metrics:
- Evaluate custom expressions (e.g., p95 latency < 200ms)
- Check if critical alerts are firing
- Compare metrics before/during/after chaos

If metrics exceed thresholds or alerts fire, scenario fails.

### 4. Custom Scripts

Users can provide custom validation scripts:
- Run arbitrary health checks
- Query external systems
- Implement business-logic validation

Script exit code determines pass/fail.

### Why Multiple Signals?

Failures cascade. A pod might recover quickly, but:
- Did it cause database locks?
- Did error rates spike?
- Did alerts fire?
- Did user-facing routes experience downtime?

Krkn's multi-signal approach catches issues that simple "pod is back up" checks miss.

## Integration Ecosystem

Krkn integrates with several components:

### Cerberus (Cluster Health Monitor)
- Monitors cluster components continuously
- Watches pods, nodes, operators, routes
- Exposes HTTP endpoint with go/no-go signal
- See [How Cerberus Works](how-cerberus-works/)

### Chaos Recommender (AI-Powered Scenario Selection)
- Profiles your application services
- Recommends scenarios likely to cause issues
- Uses dependency graph analysis
- See [Understanding Chaos Recommender](chaos-recommender/)

### ACM/OCM (Managed Cluster Chaos)
- Injects chaos into managed clusters
- Leverages Open Cluster Management
- Useful for hub-spoke architectures
- See [Managed Cluster Chaos](managed-clusters/)

### Prometheus (Metrics & SLO Validation)
- Provides time-series data for analysis
- Enables SLO validation via PromQL
- Alerts integration
- See [How SLO Validation Works](how-slo-validation-works/)

## What Krkn Is Not

To clarify Krkn's scope:

**Not a chaos mesh controller**
- Krkn doesn't run continuously injecting faults
- You trigger Krkn runs explicitly (manually or via CI)
- It's a testing tool, not a continuous fault injection platform

**Not a monitoring tool**
- Krkn validates resilience, doesn't replace monitoring
- Use Prometheus/Grafana for observability
- Cerberus monitors *during chaos*, but isn't your primary monitoring

**Not an orchestration platform**
- Krkn runs scenarios, but doesn't orchestrate deployments
- Pair it with CI/CD tools like Tekton, ArgoCD, Jenkins

**Not just for OpenShift**
- While developed at Red Hat, Krkn works on any Kubernetes
- Supports cloud-specific scenarios for AWS, GCP, Azure, etc.
- No OpenShift dependency (though some scenarios are OpenShift-aware)

## Where Krkn Fits in Chaos Engineering

Krkn is part of the broader chaos engineering ecosystem:

### Chaos Engineering Spectrum

```
Simple ←──────────────────────────────────────────→ Complex

Manual       Scripted        Automated         Continuous
Tests        Chaos          Chaos Testing      Fault Injection
│            │               │                  │
│            │               ▼                  │
│            │            ┌────────┐            │
│            └───────────→│  Krkn  │            │
│                         └────────┘            │
│                             │                 │
│                             │                 │
└─────────────────────────────┴─────────────────┘
```

Krkn sits in the **automated chaos testing** category:
- More advanced than manual testing (repeatable, CI/CD integration)
- Less complex than continuous fault injection (runs on demand)
- Focused on validation (pass/fail) rather than exploration

### Comparison to Alternatives

**Krkn vs LitmusChaos:**
- LitmusChaos: In-cluster operator, CRD-based, continuous chaos
- Krkn: External runner, YAML scenarios, on-demand testing
- Use Krkn for: CI/CD, multi-cluster, catastrophic scenarios
- Use Litmus for: Declarative K8s-native chaos, chaos workflows

**Krkn vs ChaosMesh:**
- ChaosMesh: In-cluster operator, web dashboard, CRD-based
- Krkn: External runner, CLI/container-based, config files
- Use Krkn for: External orchestration, cloud provider scenarios
- Use ChaosMesh for: In-cluster control, GUI-driven chaos

**Krkn vs Gremlin:**
- Gremlin: Commercial SaaS platform, broad infrastructure support
- Krkn: Open-source, Kubernetes-focused, free
- Use Krkn for: Kubernetes-specific testing, cost-sensitive environments
- Use Gremlin for: Enterprise support, cross-stack chaos, compliance

See [Krkn vs Alternatives](krkn-vs-alternatives/) for detailed comparison.

## Learn More

### Practical Guides
- 📚 [Your First Chaos Experiment](../../tutorials/first-chaos-experiment/) - Hands-on tutorial
- 🎯 [How to Run Pod Chaos](../../how-to/run-pod-chaos/) - Quick start guide
- 🎯 [Install Krkn](../../installation/) - Installation methods

### Deeper Understanding
- 📖 [Krkn Features](../../krkn/) - All krkn features and configuration
- 📖 [Chaos Testing Guide](../../chaos-testing-guide/) - Methodology and best practices
- 📖 [Cerberus Monitoring](../../cerberus/) - Health monitoring deep dive

### Reference
- 📖 [Scenarios Catalog](../../scenarios/) - All available scenarios
- 📖 [Configuration Reference](../../krkn/config/) - Config options
- 📖 [krknctl Usage](../../krknctl/usage/) - CLI usage guide
