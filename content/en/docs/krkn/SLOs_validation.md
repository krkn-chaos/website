---
title: SLO Validation
description: Validation points in krkn
weight: 2
---

## SLOs validation

Krkn has a few different options that give a Pass/fail based on metrics captured from the cluster is important in addition to checking the health status and recovery. Krkn supports:

For a detailed guide to configuring Prometheus alert health checks, evaluation phases, severity handling, and telemetry, see [Prometheus Alert Health Checks](health-checks/prometheus-alerts.md). These health checks provide the detailed metric-based validation used to assess SLOs during chaos experiments.

###  Checking for critical alerts post chaos 
If enabled, the check runs at the end of each scenario ( post chaos ) and Krkn exits in case `critical` alerts are firing to allow user to debug. You can enable it in the config:

```yaml
performance_monitoring:
    check_critical_alerts: False                          # When enabled will check prometheus for critical alerts firing post chaos
```

### Validation and alerting based on the queries defined by the user
Prometheus alert health checks take PromQL queries as input and evaluate them at configurable lifecycle phases. This is especially useful for automated CI runs. Configure them in the [config](https://github.com/krkn-chaos/krkn/blob/main/config/config.yaml) as follows:

```yaml
performance_monitoring:
    prometheus_url:                                       # The prometheus url/route is automatically obtained in case of OpenShift, please set it when the distribution is Kubernetes.
    prometheus_bearer_token:                              # The bearer token is automatically obtained in case of OpenShift, please set it when the distribution is Kubernetes. This is needed to authenticate with prometheus.
    enable_alerts: True                                   # Runs the queries specified in the alert profile and displays the info or exits 1 when severity=error.
    alert_profile: config/alerts.yaml                          # Path to alert profile with the prometheus queries.
    run_during: ["pre", "during", "post"]                # Evaluation phases
    exit_on_failure: True                                  # Critical/error failures block the run
    only_failures: False                                   # Include passing evaluations in telemetry
```

### Prometheus alert health-check parameters

| Parameter | Required | Description | Default |
|-----------|----------|-------------|---------|
| `prometheus_url` | Kubernetes only | URL of the Prometheus API. OpenShift routes are discovered automatically when available. | Auto-detected on OpenShift |
| `prometheus_bearer_token` | Kubernetes only | Bearer token used to authenticate with Prometheus. | Auto-detected on OpenShift |
| `enable_alerts` | Yes | Enables evaluation of the expressions in `alert_profile`. | `False` |
| `alert_profile` | Yes when alerts are enabled | Path or URL to the YAML file containing PromQL alert expressions. | `config/alerts.yaml` |
| `run_during` | No | Phase when expressions are evaluated: `pre`, `during`, `post`, or a list of phases. | `during` |
| `exit_on_failure` | No | Causes blocking alert failures to fail the run. `error` and `critical` severities are blocking. | `False` |
| `only_failures` | No | Includes only failed alert evaluations in telemetry and reports. | `False` |

The `during` evaluation uses the chaos duration and `tunings.wait_duration` to define its Prometheus range. It is evaluated after the scenario rather than polled at the regular HTTP health-check interval.

Pre and post expressions use one instant Prometheus query per alert. During expressions are evaluated once after chaos and the configured `wait_duration`, using a range query covering the chaos and wait window. They are not queried on the regular health-check interval.

Only `critical` and `error` alerts can fail the job when `exit_on_failure` is enabled. `warning` and `info` alerts remain non-blocking. Alert telemetry records the evaluation status and phase under `alerts`.

#### Alert profile
A couple of [alert profiles](https://github.com/krkn-chaos/krkn/tree/main/config) [alerts](https://github.com/krkn-chaos/krkn/blob/main/config/alerts.yaml) are shipped by default and can be tweaked to add more queries to alert on. User can provide a URL or path to the file in the [config](https://github.com/krkn-chaos/krkn/blob/main/config/config.yaml). The following are a few alerts examples:

```yaml
- expr: avg_over_time(histogram_quantile(0.99, rate(etcd_disk_wal_fsync_duration_seconds_bucket[2m]))[5m:]) > 0.01
  description: 5 minutes avg. etcd fsync latency on {{$labels.pod}} higher than 10ms {{$value}}
  severity: error

- expr: avg_over_time(histogram_quantile(0.99, rate(etcd_network_peer_round_trip_time_seconds_bucket[5m]))[5m:]) > 0.1
  description: 5 minutes avg. etcd network peer round trip on {{$labels.pod}} higher than 100ms {{$value}}
  severity: info

- expr: increase(etcd_server_leader_changes_seen_total[2m]) > 0
  description: etcd leader changes observed
  severity: critical
```

Krkn supports setting the severity for the alerts with each one having different effects:

```yaml
info: Prints an info message with the alarm description to stdout. By default all expressions have this severity.
warning: Prints a warning message with the alarm description to stdout.
error: Prints a error message with the alarm description to stdout and sets Krkn rc = 1
critical: Prints a fatal message with the alarm description to stdout and exits execution inmediatly with rc != 0
```

#### Metrics Profile
A couple of [metric profiles](https://github.com/krkn-chaos/krkn/tree/main/config), [metrics.yaml](https://github.com/krkn-chaos/krkn/blob/main/config/metrics.yaml), and [metrics-aggregated.yaml](https://github.com/krkn-chaos/krkn/blob/main/config/metrics-aggregated.yaml) are shipped by default and can be tweaked to add more metrics to capture during the run. The following are the API server metrics for example:

Metrics profiles are captured once, at the end of the Krkn run. The query window is derived automatically from the run start and end timestamps. To use the complete run duration in a PromQL range selector, use the `[.elapsed]` placeholder instead of entering a fixed duration manually:

```yaml
metrics:
  - query: rate(apiserver_request_total[.elapsed])
    metricName: APIRequestRate
```

For example, if the run lasts 7 minutes and 12 seconds, Krkn evaluates the query as `rate(apiserver_request_total[8m])`. The duration is rounded up to the next whole minute. This placeholder applies to metrics-profile queries; SLO alert expressions are evaluated through the SLO validation flow described above and do not currently expand `.elapsed`.

The metrics-profile capture and SLO scoring are separate. Metrics are collected once after the full run. Resiliency SLOs are evaluated at the end of each scenario window, and the final report aggregates those per-scenario results for multi-scenario runs.

```yaml
metrics:
# API server
  - query: histogram_quantile(0.99, sum(rate(apiserver_request_duration_seconds_bucket{apiserver="kube-apiserver", verb!~"WATCH", subresource!="log"}[2m])) by (verb,resource,subresource,instance,le)) > 0
    metricName: API99thLatency

  - query: sum(irate(apiserver_request_total{apiserver="kube-apiserver",verb!="WATCH",subresource!="log"}[2m])) by (verb,instance,resource,code) > 0
    metricName: APIRequestRate

  - query: sum(apiserver_current_inflight_requests{}) by (request_kind) > 0
    metricName: APIInflightRequests
```
