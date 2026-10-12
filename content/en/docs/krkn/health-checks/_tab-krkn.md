Configure the `performance_monitoring` section in `config.yaml`:

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
