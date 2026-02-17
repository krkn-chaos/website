---
title: Reference
description: Technical specifications and API documentation
type: "docs/scenarios"
weight: 4
---

## Technical Documentation

Reference documentation provides accurate, complete technical descriptions of Krkn's components, APIs, configurations, and scenarios. Use this section to look up specific details, parameters, and specifications.

{{% alert title="Need Instructions?" color="info" %}}
Reference docs describe *what* things are, not *how* to use them. For step-by-step guides, see [How-To Guides](../how-to/). For learning, see [Tutorials](../tutorials/).
{{% /alert %}}

## Chaos Scenarios

### [Scenarios Catalog](scenarios/)

Complete listing of all chaos scenarios with configuration parameters, examples, and cloud provider compatibility.

**Browse by category:**
- [Pod & Container Disruptions](scenarios/#pod--container-disruptions)
- [Node & Cluster Failures](scenarios/#node--cluster-failures)
- [Network Disruptions](scenarios/#network-disruptions)
- [Application & Service Disruptions](scenarios/#application--service-disruptions)
- [Storage & Data Disruptions](scenarios/#storage--data-disruptions)
- [System & Time Disruptions](scenarios/#system--time-disruptions)

## Command-Line Interface

### CLI Reference

Complete command reference for all Krkn tools:

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="cli/krknctl/">krknctl</a></h3>
<p class="scenario-description">CLI tool commands, flags, and options</p>
</div>

<div class="scenario-card">
<h3><a href="cli/krkn/">krkn</a></h3>
<p class="scenario-description">Python program arguments and usage</p>
</div>

<div class="scenario-card">
<h3><a href="cli/cerberus/">cerberus</a></h3>
<p class="scenario-description">Cerberus monitoring tool CLI</p>
</div>

</div>

## Configuration

### Configuration Files

Complete specification of all configuration formats:

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="configuration/krkn-config/">Krkn Config</a></h3>
<p class="scenario-description">Main krkn config.yaml specification</p>
</div>

<div class="scenario-card">
<h3><a href="configuration/cerberus-config/">Cerberus Config</a></h3>
<p class="scenario-description">Cerberus monitoring configuration</p>
</div>

<div class="scenario-card">
<h3><a href="configuration/scenario-schemas/">Scenario Schemas</a></h3>
<p class="scenario-description">YAML schemas for all scenario types</p>
</div>

<div class="scenario-card">
<h3><a href="configuration/environment-variables/">Environment Variables</a></h3>
<p class="scenario-description">All supported environment variables</p>
</div>

</div>

## APIs & Data Formats

### API Specifications

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="api/prometheus-metrics/">Prometheus Metrics</a></h3>
<p class="scenario-description">Metrics exposed by Krkn and Cerberus</p>
</div>

<div class="scenario-card">
<h3><a href="api/telemetry-schema/">Telemetry Schema</a></h3>
<p class="scenario-description">JSON schema for telemetry data</p>
</div>

<div class="scenario-card">
<h3><a href="api/health-check-schema/">Health Check Schema</a></h3>
<p class="scenario-description">Health check configuration format</p>
</div>

<div class="scenario-card">
<h3><a href="api/cerberus-api/">Cerberus API</a></h3>
<p class="scenario-description">HTTP endpoints and response formats</p>
</div>

</div>

## Security & Access Control

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="rbac/">RBAC Requirements</a></h3>
<p class="scenario-description">Kubernetes permissions needed for each scenario</p>
</div>

<div class="scenario-card">
<h3><a href="security/">Security Model</a></h3>
<p class="scenario-description">Threat model, security considerations, and best practices</p>
</div>

</div>

## Monitoring & Observability

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="performance-dashboards/">Performance Dashboards</a></h3>
<p class="scenario-description">Grafana dashboards for monitoring chaos impact</p>
</div>

<div class="scenario-card">
<h3><a href="slo-validation/">SLO Validation</a></h3>
<p class="scenario-description">SLO validation configuration and Prometheus expressions</p>
</div>

</div>

## Compatibility & Requirements

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="compatibility-matrix/">Compatibility Matrix</a></h3>
<p class="scenario-description">Kubernetes versions, cloud providers, and feature support</p>
</div>

<div class="scenario-card">
<h3><a href="system-requirements/">System Requirements</a></h3>
<p class="scenario-description">Hardware, software, and network requirements</p>
</div>

</div>

## What Makes Reference Documentation?

Reference docs are **information-oriented**. They:

- ✅ Provide accurate, complete technical descriptions
- ✅ Use consistent structure (tables, lists, specs)
- ✅ Are neutral and factual (no "should" or "must")
- ✅ Are easy to scan and search
- ✅ Serve as authoritative source of truth

Reference docs are **not**:
- ❌ Step-by-step instructions (see [How-To Guides](../how-to/))
- ❌ Learning experiences (see [Tutorials](../tutorials/))
- ❌ Conceptual explanations (see [Explanations](../explanation/))

## Quick Lookup Tables

### Common Configuration Parameters

| Parameter | Location | Default | Description |
|-----------|----------|---------|-------------|
| `cerberus_enabled` | config.yaml | `false` | Enable Cerberus health monitoring |
| `chaos_scenarios` | config.yaml | `[]` | List of scenario files to run |
| `label_selector` | pod_scenario.yaml | required | Target pods matching label |
| `kill_count` | pod_scenario.yaml | `1` | Number of pods to kill |
| `namespace` | *_scenario.yaml | `default` | Target namespace |

See [Configuration Reference](configuration/) for complete details.

### Scenario Types Quick Reference

| Scenario Type | Config File Pattern | Cloud-Specific | In-Cluster |
|---------------|---------------------|----------------|------------|
| Pod Failures | `pod_scenarios` | No | Yes |
| Container Failures | `container_scenarios` | No | Yes |
| Node Failures | `node_scenarios` | Yes | No |
| Network Chaos | `network_chaos` | No | Yes |
| Zone Outages | `zone_outages` | Yes (AWS, GCP) | No |
| Time Skew | `time_scenarios` | No | Yes |

See [Scenarios Catalog](scenarios/) for full list.

## Need Something Else?

- **Learning Krkn?** → [Tutorials](../tutorials/)
- **Solving a problem?** → [How-To Guides](../how-to/)
- **Understanding concepts?** → [Explanations](../explanation/)
- **Contributing?** → [Developer's Guide](../developers-guide/)
