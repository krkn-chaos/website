---
title: Prometheus Alert Health Checks
description: Evaluate PromQL alert expressions before, during, and after chaos experiments
weight: 2
---

Prometheus alert health checks evaluate PromQL expressions from an alert profile during a Krkn run. They let you verify cluster SLOs and automatically identify health regressions caused by a chaos scenario.

## Prerequisites

- Prometheus must be reachable from the machine running Krkn.
- On OpenShift, Krkn can discover the Prometheus route and bearer token. On Kubernetes, set `prometheus_url` and `prometheus_bearer_token`.
- An alert profile must contain one or more PromQL expressions.

## Configuration

Configure alert health checks under `performance_monitoring`:

```yaml
performance_monitoring:
    prometheus_url: "http://prometheus.example.com"
    prometheus_bearer_token: ""
    enable_alerts: True
    alert_profile: config/alerts.yaml
    run_during: ["pre", "during", "post"]
    exit_on_failure: True
    only_failures: False
```

| Field | Description | Default |
|-------|-------------|---------|
| `prometheus_url` | Prometheus API URL. | Auto-detected on OpenShift |
| `prometheus_bearer_token` | Bearer token used to authenticate with Prometheus. | Auto-detected on OpenShift |
| `enable_alerts` | Enable alert-profile evaluation. | `False` |
| `alert_profile` | Path or URL to the alert profile. | `config/alerts.yaml` |
| `run_during` | Phase or phases when expressions are evaluated. | `during` |
| `exit_on_failure` | Fail the run when a blocking alert fails. | `False` |
| `only_failures` | Include only failed evaluations in telemetry and reports. | `False` |

## Alert Profile

Each entry contains a PromQL expression, a description, and an optional severity:

```yaml
- expr: sum(rate(apiserver_request_total{code=~"5.."}[5m])) > 0
  description: Kubernetes API server returned errors
  severity: critical

- expr: increase(etcd_server_leader_changes_seen_total[2m]) > 0
  description: etcd leader changes observed
  severity: warning
```

Krkn ships example profiles in the [Krkn `config` directory](https://github.com/krkn-chaos/krkn/tree/main/config). Copy and adapt `alerts.yaml` for the cluster and SLOs being tested.

## Evaluation Phases

Set `run_during` to one phase or a list of phases:

| Value | Behavior |
|-------|----------|
| `pre` | Evaluate each expression once before chaos starts. |
| `during` | Evaluate once after chaos and `wait_duration`, using a range covering the chaos and wait window. It is not polled on the regular health-check interval. |
| `post` | Evaluate each expression once after chaos completes. |
| `["pre", "during", "post"]` | Evaluate at all three phases. |

Use a pre-check to establish a baseline, a post-check to verify recovery, or both:

```yaml
performance_monitoring:
    enable_alerts: True
    alert_profile: config/alerts.yaml
    run_during: ["pre", "post"]
    exit_on_failure: True
```

## Severity and Failure Behavior

Alert severity controls how a failed expression is reported:

- `info` and `warning` evaluations are reported but are non-blocking.
- `error` and `critical` evaluations are blocking when `exit_on_failure: True`.
- With `only_failures: True`, passing evaluations are omitted from telemetry and reports.

The phase and evaluation result are included in alert telemetry. Alert results are also shown in the generated HTML and PDF reports.

## Configuration by Runner

The same alert health-check settings are available through Krkn, Krkn-Hub, and Krknctl:

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-Hub**" lang="krkn-hub" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}

The alert profile must be available at the path supplied to the container, or be provided as a URL supported by Krkn.

## Related Documentation

- [Health Check Features](./)
- [Health Check Run Timing](run-during.md)
- [SLO Validation](../SLOs_validation.md)
- [Telemetry](../telemetry.md)
