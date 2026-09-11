---
title: "Health Check Features"
description: "Advanced health check capabilities in Krkn"
weight: 10
---

Krkn provides comprehensive health check capabilities to monitor your applications and infrastructure during chaos testing.

## Health Check Types

- **[HTTP Health Checks](../#sample-health-check-config)** - Monitor HTTP/HTTPS endpoints
- **[KubeVirt Health Checks](../virt-checks.md)** - Monitor VMI SSH connectivity  
- **[Object State Health Checks](object-state.md)** - Monitor Kubernetes resource conditions

## Advanced Features

- **[Health Check Run Timing (`run_during`)](run-during.md)** - Control when health checks execute (pre, during, post chaos)
- **[Exit on Failure](run-during.md#exit-codes)** - Control chaos execution based on health check results
- **[Telemetry Integration](../telemetry.md)** - Track health metrics and downtime

## Quick Reference

### Run Timing Options

```yaml
health_checks:
    run_during: "pre"                    # Before chaos only
    run_during: "during"                 # During chaos only (default)
    run_during: "post"                   # After chaos only
    run_during: ["pre", "post"]          # Before and after (not during)
    run_during: ["pre", "during", "post"]  # All three stages
```

### Health Check Types in Config

```yaml
# HTTP endpoints
health_checks:
    interval: 5
    run_during: "during"
    config:
        - url: "http://my-app/health"

# VMI SSH connectivity
kubevirt_checks:
    interval: 10
    run_during: "during"
    namespace: "vms"

# Kubernetes object conditions
object_state_checks:
    interval: 5
    run_during: "during"
    config:
        - name: "etcd-ready"
          kind: "Pod"
          object_name: "etcd-.*"
          namespace: "kube-system"
          condition: {type: "Ready", status: "True"}
```
