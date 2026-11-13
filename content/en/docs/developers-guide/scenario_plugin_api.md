---
title: Scenario Plugin API
description: Naming, discovery, method signatures, and configuration binding for Krkn scenario plugins.
weight: 30
categories: [Developers Guide]
tags: [docs, plugins]
---

A scenario plugin extends `AbstractScenarioPlugin` and implements
`get_scenario_types()` and `run()`. The factory discovers it under
`krkn/scenario_plugins/`; adding a valid plugin does not require editing a
central registration list.

For a complete implementation exercise, follow
[Implement the plugin](/docs/developers-guide/custom-scenario/implement-plugin/).
The [abstract class](https://github.com/krkn-chaos/krkn/blob/main/krkn/scenario_plugins/abstract_scenario_plugin.py)
and [factory](https://github.com/krkn-chaos/krkn/blob/main/krkn/scenario_plugins/scenario_plugin_factory.py)
are the source of truth for the checked-out Krkn version.

## Package and naming rules

```text
krkn/
└── scenario_plugins/
    └── dev_demo/
        ├── __init__.py
        └── dev_demo_scenario_plugin.py
```

- Include `__init__.py` so the plugin directory is a Python package.
- The plugin directory must not contain `scenario` or `plugin` in its name.
- The module containing the plugin class ends with `_scenario_plugin.py`.
- The class ends with `ScenarioPlugin` and uses the module's corresponding
  CamelCase name: `dev_demo_scenario_plugin.py` becomes `DevDemoScenarioPlugin`.
- Each scenario type returned by the plugin must be unique across loaded plugins.

The factory instantiates classes while discovering their types. Keep
constructors free of cluster operations. If you override `__init__`, preserve
the base class's `scenario_type` argument and initialization.

## Abstract methods

The current interface is:

```python
from krkn_lib.models.telemetry import ScenarioTelemetry
from krkn_lib.telemetry.ocp import KrknTelemetryOpenshift

from krkn.scenario_plugins.abstract_scenario_plugin import AbstractScenarioPlugin


class DevDemoScenarioPlugin(AbstractScenarioPlugin):
    def get_scenario_types(self) -> list[str]:
        return ["dev_demo_scenarios"]

    def run(
        self,
        run_uuid: str,
        scenario: str,
        lib_telemetry: KrknTelemetryOpenshift,
        scenario_telemetry: ScenarioTelemetry,
    ) -> int:
        return self.execute_demo(scenario, lib_telemetry)

    # Implement execute_demo() with validation and exception handling.
```

The example shows the interface; `execute_demo()` is supplied by the
[demo repository](https://github.com/krkn-chaos/krkn-dev-demo).
The `run()` signature does not include a `krkn_config` argument.

### `get_scenario_types()`

Return a list of strings that can appear beneath `kraken.chaos_scenarios`.
One class can serve multiple types. Reusing a type already claimed by another
plugin causes the conflicting registration to fail and is reported in the
factory logs.

### `run()`

- **`run_uuid`** identifies the Krkn run.
- **`scenario`** is the path to the individual scenario configuration file,
  not its parsed contents. Read and validate that file in the plugin.
- **`lib_telemetry`** is the initialized `KrknTelemetryOpenshift` wrapper.
  Its Kubernetes and OpenShift helpers use the run's cluster credentials.
- **`scenario_telemetry`** is the telemetry record for this scenario execution.
  The engine manages its timing and exit status; use it for supported
  scenario-specific telemetry.

Return integer `0` on success and `1` on failure. Handle exceptions within the
plugin's execution path so they do not escape `run()`. Log enough context to
diagnose a failure without dumping sensitive HTTP headers or credentials.

## Bind a type to a configuration file

In the main Krkn configuration:

```yaml
kraken:
  chaos_scenarios:
    - dev_demo_scenarios:
        - scenarios/dev_demo.yaml
```

In `scenarios/dev_demo.yaml`:

```yaml
wait: 2
namespace: default
```

The engine finds the type returned by `get_scenario_types()` and passes
`scenarios/dev_demo.yaml` to `run()`. Relative paths are resolved from the
Krkn process's working directory. Discovery imports plugin modules even when
their types are not selected; do not perform experiments at import time.

## Use the injected library

```python
    kubernetes = lib_telemetry.get_lib_kubernetes()
    namespaces = kubernetes.list_namespaces()
    pods = kubernetes.list_pods(namespace)
```

Prefer these helpers to creating a second Kubernetes client and loading another
kubeconfig. Reusable Kubernetes or OpenShift operations belong in `krkn-lib`;
scenario-specific sequencing belongs in the plugin. See
[Using and extending krkn-lib](/docs/developers-guide/krkn-lib/).

## Before packaging

Check naming, unique type registration, configuration validation, failure
handling, and cleanup behavior. A Python syntax check alone does not verify
discovery or cluster access. Use the
[testing guide](/docs/developers-guide/testing-changes/) to cover those stages.
