Pass the global alert options to the scenario command:

```bash
krknctl run pod-scenarios \
  --prometheus-url http://prometheus.example.com \
  --prometheus-token "" \
  --enable-alerts True \
  --alerts-path config/alerts.yaml \
  --alerts-run-during '["pre", "during", "post"]' \
  --alerts-exit-on-failure True \
  --alerts-only-failures False
```
