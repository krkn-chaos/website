Set these environment variables before starting the scenario container:

```bash
export PROMETHEUS_URL="http://prometheus.example.com"
export PROMETHEUS_TOKEN=""
export ENABLE_ALERTS=True
export ALERTS_PATH=config/alerts.yaml
export ALERTS_RUN_DURING='[pre, during, post]'
export ALERTS_EXIT_ON_FAILURE=True
export ALERTS_ONLY_FAILURES=False
```
