---
title: "Health Check Run Timing (run_during)"
description: "Control when health checks execute: pre-chaos, during chaos, or post-chaos"
weight: 1
---

## Overview

Health checks in Krkn can run at three different timings using the `run_during` configuration:

1. **Pre-checks** (`run_during: "pre"`): Run once before chaos scenarios to verify baseline health
2. **During checks** (`run_during: "during"`): Run continuously during chaos to monitor degradation  
3. **Post-checks** (`run_during: "post"`): Run once after chaos scenarios to verify recovery

You can combine timings using a list: `run_during: ["pre", "post"]` to run the same health check at multiple points.

## Configuration

Configure health checks with the `run_during` option in your `config.yaml`:

```yaml
health_checks:
    interval: 2                      # For continuous checks (run_during: "during")
    run_during: "during"             # When to run: "pre", "during", "post", or ["pre", "post"]
    exit_on_failure: False           # If True: pre-checks block chaos, post-checks fail the run
    config:
        - url: "http://my-app.example.com/health"
          bearer_token: "my-token"

kubevirt_checks:
    interval: 2                      # For continuous checks (run_during: "during")
    run_during: "during"             # When to run: "pre", "during", "post", or ["pre", "post"]
    exit_on_failure: False           # If True: pre-checks block chaos, post-checks fail the run
    namespace: "my-namespace"
    name: "my-vmi-.*"                # Regex pattern for VMI names

object_state_checks:
    interval: 5
    run_during: "during"
    exit_on_failure: False
    config:
        - name: "etcd-pods-ready"
          kind: "Pod"
          object_name: "etcd-.*"
          namespace: "kube-system"
          condition: {type: "Ready", status: "True"}
```

## Supported Values

| Value | Behavior |
|-------|----------|
| `"pre"` | Run once before chaos scenarios |
| `"during"` | Run continuously during chaos (default) |
| `"post"` | Run once after chaos scenarios |
| `["pre", "post"]` | Run at multiple timings (any combination) |

## Use Cases

### Pre-Check Only: Ensure Clean Baseline

Verify your system is healthy before starting chaos:

```yaml
health_checks:
    run_during: "pre"
    exit_on_failure: True
    config:
        - url: "http://my-app.example.com/health"
```

### Post-Check Only: Verify Recovery

Verify your system has recovered after chaos:

```yaml
health_checks:
    run_during: "post"
    exit_on_failure: True
    config:
        - url: "http://my-app.example.com/health"
```

### Pre and Post: Baseline and Recovery

Run the same check before and after chaos:

```yaml
health_checks:
    run_during: ["pre", "post"]
    exit_on_failure: True
    config:
        - url: "http://my-app.example.com/health"
```

### Complete Monitoring: Pre, During, and Post

Monitor health at all stages:

```yaml
health_checks:
    interval: 5
    run_during: ["pre", "during", "post"]
    exit_on_failure: True
    config:
        - url: "http://my-app.example.com/health"
```

## Exit Codes

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | Post-scenario failure |
| 2 | Critical Prometheus alerts |
| 3 | Continuous health check failure (`run_during: "during"`) |
| 4 | Pre or post health check failure (when `exit_on_failure: True`) |

## Backward Compatibility

If `run_during` is not specified, health checks default to `"during"`:

```yaml
# This (existing configs)
health_checks:
    interval: 5
    config:
        - url: "http://my-app/health"

# Is equivalent to
health_checks:
    interval: 5
    run_during: "during"  # Default
    config:
        - url: "http://my-app/health"
```
