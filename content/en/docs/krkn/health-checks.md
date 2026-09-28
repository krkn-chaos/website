---
title: Health Checks
description: Health Checks to analyze down times of applications
weight: 2
---

### Health Checks

Health checks provide real-time visibility into the impact of chaos scenarios on application availability and performance. They run continuously in the background throughout the chaos run, detecting outages, measuring downtime duration, and recording results in telemetry.

Krkn supports multiple health check types through a plugin-based architecture:

- **`http_health_check`** — monitors HTTP/HTTPS endpoints (documented on this page)
- **Prometheus checks** — evaluates PromQL expressions from an alert profile before, during, and after chaos (see [Prometheus Alert Health Checks](health-checks/prometheus-alerts.md))
- **`virt_health_check`** — monitors KubeVirt VMI SSH connectivity (see [Kube Virt Checks](health-checks/virt-checks.md))
- **Object state checks** — monitors Kubernetes resource conditions such as Pod readiness and Deployment availability (see [Object State Health Checks](health-checks/object-state.md))
- **Custom plugins** — extend the system with your own health check logic (see [Health Check Plugins](../developers-guide/health-check-plugins.md))

Health checks are configured in the ```config.yaml``` under the `health_checks` key.

The `http_health_check` plugin periodically checks the provided URLs based on the defined interval and records the results in Telemetry. The telemetry data includes:

- Success response ```200``` when the application is running normally.
- Failure response other than 200 if the application experiences downtime or errors.

This helps users quickly identify application health issues and take necessary actions.

### Prometheus health checks

For the complete Prometheus alert health-check reference, see [Prometheus Alert Health Checks](health-checks/prometheus-alerts.md).

Prometheus health checks use the alert profile configured under `performance_monitoring.alert_profile`. They are configured in the same `performance_monitoring` section as the Prometheus connection settings:

```yaml
performance_monitoring:
  prometheus_url: "http://prometheus.example.com"
  prometheus_bearer_token: ""
  enable_alerts: true
  alert_profile: config/alerts.yaml
  run_during: ["pre", "during", "post"]
  exit_on_failure: true
  only_failures: false
```

Each alert profile entry contains an expression, description, and severity:

```yaml
- expr: sum(rate(apiserver_request_total{code=~"5.."}[5m])) > 0
  description: Kubernetes API server returned errors
  severity: critical
```

The query behavior depends on `run_during`:

- `pre`: each expression is queried once before chaos starts.
- `during`: expressions are not polled on an interval. After chaos completes and `wait_duration` elapses, each expression is queried once over the complete chaos and wait window.
- `post`: each expression is queried once after chaos completes.
- A list such as `["pre", "during", "post"]` enables multiple phases.

`critical` and `error` alerts are blocking when `exit_on_failure` is enabled. `warning` and `info` alerts are recorded but do not fail the job. With `only_failures: true`, passing alert evaluations are omitted from telemetry and reports. Otherwise, every evaluation is recorded with its status and phase.

The alert evaluations are available in telemetry under `alerts` and are displayed in the PDF and HTML reports. The configured resiliency alert file is also shown with per-scenario failed SLO details.

#### Sample health check config
```yaml
health_checks:
  interval: <time_in_seconds>                       # Defines the frequency of health checks, default value is 2 seconds
  config:                                           # List of application endpoints to check
    - url: "https://example.com/health"
      bearer_token: "hfjauljl..."                   # Bearer token for authentication if any
      auth:                                         
      exit_on_failure: True                         # If value is True exits when health check failed for application, values can be True/False
      verify_url: True                              # SSL Verification of URL, default to true
    - url: "https://another-service.com/status"
      bearer_token:
      auth: ("admin","secretpassword")              # Provide authentication credentials (username , password) in tuple format if any, ex:("admin","secretpassword")
      exit_on_failure: False
      verify_url: False  
    - url: http://general-service.com
      bearer_token:
      auth:
      exit_on_failure:  
      verify_url: False  
```
#### Sample health check telemetry
```json
"health_checks": [
            {
                "url": "https://example.com/health",
                "status": False,
                "status_code": "503",
                "start_timestamp": "2025-02-25 11:51:33",
                "end_timestamp": "2025-02-25 11:51:40",
                "duration": "0:00:07"
            },
            {
                "url": "https://another-service.com/status",
                "status": True,
                "status_code": 200,
                "start_timestamp": "2025-02-25 22:18:19",
                "end_timestamp": "22025-02-25 22:22:46",
                "duration": "0:04:27"
            },
            {
                "url": "http://general-service.com",
                "status": True,
                "status_code": 200,
                "start_timestamp": "2025-02-25 22:18:19",
                "end_timestamp": "22025-02-25 22:22:46",
                "duration": "0:04:27"
            }
        ],
```

### See Also

- [Kube Virt Checks](health-checks/virt-checks.md) — monitor KubeVirt VMI SSH connectivity during chaos
- [Object State Health Checks](health-checks/object-state.md) — monitor Kubernetes resource conditions during chaos
- [Health Check Plugins](../developers-guide/health-check-plugins.md) — create a custom health check plugin
