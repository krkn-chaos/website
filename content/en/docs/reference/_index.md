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

### [Scenarios Catalog](../scenarios/)

Complete listing of all chaos scenarios with configuration parameters, examples, and cloud provider compatibility.

**Browse by category:**
- [Pod & Container Disruptions](../scenarios/#pod--container-disruptions)
- [Node & Cluster Failures](../scenarios/#node--cluster-failures)
- [Network Disruptions](../scenarios/#network-disruptions)
- [Application & Service Disruptions](../scenarios/#application--service-disruptions)
- [Storage & Data Disruptions](../scenarios/#storage--data-disruptions)
- [System & Time Disruptions](../scenarios/#system--time-disruptions)

## Command-Line Interface

### CLI Reference

Complete command reference for all Krkn tools:

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="../krknctl/usage/">krknctl</a></h3>
<p class="scenario-description">CLI tool commands, flags, and options</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/config/">krkn</a></h3>
<p class="scenario-description">Python program configuration and usage</p>
</div>

<div class="scenario-card">
<h3><a href="../cerberus/">cerberus</a></h3>
<p class="scenario-description">Cerberus monitoring tool documentation</p>
</div>

</div>

## Configuration

### Configuration Files

Complete specification of all configuration formats:

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="../krkn/config/">Krkn Config</a></h3>
<p class="scenario-description">Main krkn config.yaml specification</p>
</div>

<div class="scenario-card">
<h3><a href="../cerberus/config/">Cerberus Config</a></h3>
<p class="scenario-description">Cerberus monitoring configuration</p>
</div>

<div class="scenario-card">
<h3><a href="../scenarios/">Scenario Schemas</a></h3>
<p class="scenario-description">YAML schemas for all scenario types (see individual scenarios)</p>
</div>

<div class="scenario-card">
<h3>Environment Variables</h3>
<p class="scenario-description">Coming soon - see <a href="../krkn/config/">krkn config</a> and scenario docs</p>
</div>

</div>

## APIs & Data Formats

### API Specifications

<div class="scenario-grid">

<div class="scenario-card">
<h3>Prometheus Metrics</h3>
<p class="scenario-description">Coming soon - see <a href="../krkn/SLOs_validation/">SLO validation</a> for Prometheus integration</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/telemetry/">Telemetry Schema</a></h3>
<p class="scenario-description">JSON schema for telemetry data</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/health-checks/">Health Check Schema</a></h3>
<p class="scenario-description">Health check configuration format</p>
</div>

<div class="scenario-card">
<h3><a href="../cerberus/">Cerberus API</a></h3>
<p class="scenario-description">HTTP endpoints and response formats (see Cerberus docs)</p>
</div>

</div>

## Security & Access Control

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="../krkn/rbac/">RBAC Requirements</a></h3>
<p class="scenario-description">Kubernetes permissions needed for each scenario</p>
</div>

<div class="scenario-card">
<h3><a href="../security/">Security Model</a></h3>
<p class="scenario-description">Threat model, security considerations, and best practices</p>
</div>

</div>

## Monitoring & Observability

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="../performance_dashboards/">Performance Dashboards</a></h3>
<p class="scenario-description">Grafana dashboards for monitoring chaos impact</p>
</div>

<div class="scenario-card">
<h3><a href="../krkn/SLOs_validation/">SLO Validation</a></h3>
<p class="scenario-description">SLO validation configuration and Prometheus expressions</p>
</div>

</div>

## Compatibility & Requirements

<div class="scenario-grid">

<div class="scenario-card">
<h3>Compatibility Matrix</h3>
<p class="scenario-description">Coming soon - see individual <a href="../scenarios/">scenario pages</a> for cloud compatibility</p>
</div>

<div class="scenario-card">
<h3>System Requirements</h3>
<p class="scenario-description">Coming soon - see <a href="../installation/">installation guides</a> for requirements</p>
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
