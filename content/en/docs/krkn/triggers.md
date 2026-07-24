---
title: Event-Driven Triggers
description: Delay chaos injection until specific conditions are met
weight: 10
---

The Triggers framework allows you to delay chaos injection until specific environmental conditions are met. Instead of simply waiting a fixed amount of time or relying entirely on manual signaling, Krkn can actively poll your environment and automatically proceed with the scenario once all your defined triggers are satisfied.

This is especially useful for event-driven chaos, such as waiting for a background deployment to finish, waiting for a service to become healthy, or synchronizing Krkn with an external CI/CD pipeline.

## Configuration

Triggers are configured inside your Krkn scenario files under the `triggers` block.

```yaml
triggers:
  mode: all_of      # Optional: all_of | any_of (default: all_of)
  timeout: 300      # Optional: Max time to wait in seconds (default: 300)
  interval: 5       # Optional: Polling interval in seconds (default: 5)
  on_timeout: skip  # Optional: skip | fail | run_anyway (default: skip)
  conditions:
    - type: command
      cmd: "kubectl get pods -n my-app | grep Running"
    - type: http
      url: "http://my-service.default.svc:8080/health"
      expected_status: 200
```

### Global Trigger Settings

| Parameter | Description | Default |
|-----------|-------------|---------|
| `mode` | `all_of` requires all conditions to pass. `any_of` proceeds when at least one condition passes. | `all_of` |
| `timeout` | Maximum time (in seconds) to wait for conditions to be met before timing out. | `300` |
| `interval` | How often (in seconds) Krkn polls the conditions. | `5` |
| `on_timeout`| Behavior if timeout is reached. `skip`: skips scenario. `fail`: fails scenario. `run_anyway`: proceeds with chaos anyway. | `skip` |

## Trigger Types

### 1. Command Trigger

The `command` trigger runs a shell command and passes if the command exits with a `0` (success) return code.

```yaml
  - type: command
    cmd: "kubectl get nodes | grep Ready"
```

| Field | Description |
|-------|-------------|
| `type` | Must be `command` |
| `cmd` | The shell command to execute. |

### 2. HTTP Trigger

The `http` trigger polls an HTTP/HTTPS endpoint and passes when the endpoint returns the expected status code and (optionally) matches a substring in the response body.

```yaml
  - type: http
    url: "https://api.my-app.com/ready"
    method: "GET"
    expected_status: 200
    bearer_token: "my-secret-token"
    body_contains: "status: healthy"
```

| Field | Description | Default |
|-------|-------------|---------|
| `type` | Must be `http` | |
| `url` | The URL to poll. | (Required) |
| `method` | The HTTP method (`GET`, `POST`, etc.). | `GET` |
| `expected_status` | The HTTP status code required to pass. | `200` |
| `headers` | A dictionary of custom HTTP headers. | `{}` |
| `bearer_token` | Automatically sets the `Authorization: Bearer <token>` header. | |
| `body_contains` | If set, the response body must contain this exact substring. | |
