---
title: Health Check Plugins
date: 2024-01-01
description: >
  How to use and create health check plugins in Krkn to monitor services during chaos experiments
categories: [Developers Guide]
tags: [health-checks, plugins, docs]
weight: 5
---

# Health Check Plugins

Health check plugins allow Krkn to continuously monitor the health of your services and infrastructure **during** chaos experiments. They run in background threads alongside the chaos scenario, detecting outages, tracking downtime duration, and collecting telemetry data.

## Overview

The health check system uses a plugin architecture:

- **`HealthCheckFactory`** — automatically discovers and loads all plugins from the `krkn.health_checks` package
- **`AbstractHealthCheckPlugin`** — base class all plugins must extend
- Plugins run in separate threads and write telemetry to a shared queue
- The factory tracks all active plugin instances and provides lifecycle management (`increment_all_iterations`, `stop_all`)

### Exit Codes

| Code | Meaning |
|------|---------|
| `0`  | Success — all health checks passed |
| `2`  | Critical alert detected during the run |
| `3`  | Health check failure (e.g. `exit_on_failure: true` triggered) |

---

## Built-in Plugins

### [HTTP Health Check](../krkn/health-checks.md) (`health_checks`)

Monitors HTTP endpoints by making periodic GET requests. Tracks status changes, measures downtime duration, and records telemetry for each state transition.

**Configuration example:**

```yaml
health_checks:
  interval: 2          # seconds between checks
  config:
    - url: "http://my-service/health"
      verify_url: true          # SSL certificate verification (default: true)
      exit_on_failure: false    # exit with code 3 if endpoint goes down (default: false)

    - url: "https://api.example.com/status"
      bearer_token: "your-token"   # Authorization: Bearer <token>
      exit_on_failure: true

    - url: "http://internal-service"
      auth: "username,password"    # HTTP basic auth
      verify_url: false
```

**Config fields:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `url` | string | yes | — | HTTP endpoint to monitor |
| `bearer_token` | string | no | — | Bearer token for Authorization header |
| `auth` | string | no | — | Basic auth as `"username,password"` |
| `verify_url` | bool | no | `true` | Verify SSL certificates |
| `exit_on_failure` | bool | no | `false` | Set exit code 3 when endpoint returns non-200 |

---

### [KubeVirt VM Health Check](../krkn/virt-checks.md) (`virt_health_check`)

Monitors KubeVirt VirtualMachineInstance (VMI) connectivity during chaos experiments. It tracks SSH/network access to VMs, detects disconnections, and records recovery data.

**Configuration example:**

```yaml
kubevirt_checks:
  interval: 5
  config:
    namespace: "my-namespace"
    node_name: "worker-1"        # optional: filter VMIs by node
    exit_on_failure: false
    disconnected_mode: false     # track VMs that become unreachable
    only_failures: true          # only record failed checks in telemetry
    batch_size: 10               # VMIs to check concurrently (0 = no limit)
    ssh_port: 22
    ssh_user: "cloud-user"
    ssh_private_key: "/path/to/key"
```

---

## Creating a Custom Health Check Plugin

You can add your own health check plugin by following these steps.

### 1. Naming Conventions

The factory enforces strict naming conventions for auto-discovery. Both the file name and class name must follow these rules:

| Rule | Example |
|------|---------|
| File must be in `krkn/health_checks/` | `krkn/health_checks/` |
| File name must end with `_health_check_plugin.py` | `my_service_health_check_plugin.py` |
| Class name must be CapitalCamelCase of the file name | `MyServiceHealthCheckPlugin` |
| Class name must end with `HealthCheckPlugin` | `MyServiceHealthCheckPlugin` |
| Class must inherit from `AbstractHealthCheckPlugin` | — |

The snake_case-to-CamelCase conversion is automatic — `my_service_health_check_plugin` becomes `MyServiceHealthCheckPlugin`. The factory will reject your plugin if these rules are not followed.

### 2. Create the Plugin File

Create `krkn/health_checks/my_service_health_check_plugin.py`:

```python
import logging
import queue
import time
from typing import Any

from krkn.health_checks.abstract_health_check_plugin import AbstractHealthCheckPlugin


class MyServiceHealthCheckPlugin(AbstractHealthCheckPlugin):
    """
    Health check plugin that monitors MyService during chaos experiments.
    """

    def __init__(
        self,
        health_check_type: str = "my_service_health_check",
        iterations: int = 1,
        **kwargs
    ):
        super().__init__(health_check_type)
        self.iterations = iterations
        self.current_iterations = 0

    def get_health_check_types(self) -> list[str]:
        """
        Returns the internal type identifiers for this plugin.
        One plugin can handle multiple type strings, but they must be
        unique across all plugins.
        """
        return ["my_service_health_check"]

    def get_config_key(self) -> str:
        """
        Returns the top-level config.yaml key this plugin reads from.
        The factory maps this key to the plugin so run_kraken.py discovers
        and starts it automatically — no code changes needed there.
        Must be unique across all plugins.
        """
        return "my_service_checks"

    def increment_iterations(self) -> None:
        """
        Called by the main run loop after each chaos iteration.
        Increment your counter so the plugin knows when to stop.
        """
        self.current_iterations += 1

    def run_health_check(
        self,
        config: dict[str, Any],
        telemetry_queue: queue.Queue,
    ) -> None:
        """
        Main health check loop. Runs in a background thread.

        - Check `self._stop_event.is_set()` to support cooperative shutdown
        - Check `self.current_iterations < self.iterations` to stop after the run
        - Put telemetry results into `telemetry_queue`
        - Set `self.ret_value = 3` to signal health check failure
        """
        if not config or not config.get("config"):
            logging.info("my_service_health_check config not defined, skipping")
            return

        interval = config.get("interval", 5)
        exit_on_failure = config.get("config", {}).get("exit_on_failure", False)
        endpoint = config.get("config", {}).get("endpoint")

        telemetry_results = []

        while self.current_iterations < self.iterations and not self._stop_event.is_set():
            healthy = self._check_my_service(endpoint)

            if not healthy:
                logging.warning(f"MyService at {endpoint} is unhealthy")
                if exit_on_failure and self.ret_value == 0:
                    self.ret_value = 3

            # Collect telemetry (structure depends on your needs)
            telemetry_results.append({
                "endpoint": endpoint,
                "status": healthy,
            })

            time.sleep(interval)

        # Always put results into the queue when done
        telemetry_queue.put(telemetry_results)

    def _check_my_service(self, endpoint: str) -> bool:
        """Check if the service is healthy. Returns True if healthy."""
        try:
            # Your service-specific health check logic here
            return True
        except Exception as e:
            logging.error(f"Health check failed: {e}")
            return False
```

### 3. Configure in `config.yaml`

Add a section using the key returned by `get_config_key()`. The factory discovers this mapping at startup — no changes to `run_kraken.py` are needed:

```yaml
my_service_checks:
  interval: 5
  config:
    endpoint: "http://my-service:8080"
    exit_on_failure: true
```

Each plugin owns its own top-level config key. Multiple plugins can be active simultaneously, each reading from their own section:

```yaml
health_checks:          # read by HttpHealthCheckPlugin
  interval: 2
  config:
    - url: "http://frontend/health"

my_service_checks:      # read by MyServiceHealthCheckPlugin
  interval: 5
  config:
    endpoint: "http://my-service:8080"
```

### 4. AbstractHealthCheckPlugin API Reference

Your plugin inherits the following from `AbstractHealthCheckPlugin`:

| Member | Type | Description |
|--------|------|-------------|
| `self._stop_event` | `threading.Event` | Set when the main loop requests shutdown. Check `self._stop_event.is_set()` in your loop. |
| `self.ret_value` | `int` | Return code. `0` = success, `3` = health check failure. |
| `stop()` | method | Called by the factory to signal your loop to exit. Do not override — check `_stop_event` instead. |
| `get_return_value()` | method | Returns `self.ret_value`. Used by the main loop to detect failures. |
| `set_return_value(value)` | method | Sets `self.ret_value`. |

**Methods you must implement:**

| Method | Description |
|--------|-------------|
| `run_health_check(config, telemetry_queue)` | Main health check loop, runs in a background thread |
| `get_health_check_types()` | Returns list of internal type identifier strings for this plugin |
| `get_config_key()` | Returns the top-level `config.yaml` key this plugin reads from (must be unique) |
| `increment_iterations()` | Increments your iteration counter when called by the factory |

### 5. Factory Auto-Discovery

The `HealthCheckFactory` uses `pkgutil.walk_packages` to scan the `krkn.health_checks` package at startup. Any file ending in `_health_check_plugin.py` that contains a class following the naming conventions will be automatically loaded. No registration step is needed beyond placing the file in the right directory.

You can verify your plugin was loaded by checking the factory's `loaded_plugins` dict:

```python
from krkn.health_checks.health_check_factory import HealthCheckFactory

factory = HealthCheckFactory()
print(factory.loaded_plugins.keys())
# dict_keys(['http_health_check', 'virt_health_check', 'my_service_health_check'])
```

If your plugin fails to load (naming violation, import error, duplicate type), it will appear in `factory.failed_plugins` as a list of `(module_name, class_name, error_message)` tuples.

---

## Questions?

For questions or guidance, reach out on the [Kubernetes Slack](https://kubernetes.slack.com/) in the `#krkn` channel.
