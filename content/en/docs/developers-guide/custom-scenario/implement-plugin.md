---
title: Implement the Plugin
description: Complete the abstract interface and connect a scenario YAML file to krkn-lib operations.
weight: 10
categories: [Developers Guide]
tags: [docs, tutorial, plugins]
---

**Starting point:** complete the [workspace setup](/docs/developers-guide/custom-scenario/#prepare-the-workspace).
**Result:** a concrete plugin class that Krkn can discover and execute.

## Read the prepared behavior

Open `$KRKN_DEV_PLUGIN_DIR/dev_demo_scenario_plugin.py`. Its
`DevDemoScenarioPlugin` class already implements `execute_demo(scenario,
lib_telemetry)`. The method:

1. Reads the YAML file identified by `scenario`.
2. Requires `wait` to be an integer from `0` to `60`, and `namespace` to be a
   nonempty string. A YAML boolean is not accepted as an integer.
3. Sleeps for the requested duration.
4. Obtains the Kubernetes helper from `lib_telemetry` and checks namespace
   existence with `list_namespaces()`.
5. Lists pods with `list_pods(namespace)` and logs a distinctive banner.
6. Returns `0` on success and `1` on a missing namespace or another failure.

The input file is intentionally small:

```yaml
wait: 2
namespace: default
```

The helper uses the cluster client already initialized by Krkn:

```python
            kubernetes = lib_telemetry.get_lib_kubernetes()
            if namespace not in kubernetes.list_namespaces():
                logging.error(
                    "Development scenario: namespace '%s' does not exist", namespace
                )
                return 1

            pods = kubernetes.list_pods(namespace)
```

Checking the namespace list avoids intentionally triggering the library's
verbose `read_namespace_status` error path for a missing namespace. This demo
therefore requires permission to list namespaces as well as pods. An existing
namespace with no pods is a successful result and is logged as `(none)`.

## Implement the two abstract methods

Ensure these imports are present once at the top of the file:

```python
from krkn_lib.models.telemetry import ScenarioTelemetry
from krkn_lib.telemetry.ocp import KrknTelemetryOpenshift
```

Paste the following methods **inside `DevDemoScenarioPlugin`**, at the same
indentation level as `execute_demo()`. The four-space class indentation is
included for copying:

```python
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
```

`get_scenario_types()` supplies the configuration key that selects this class.
`run()` delegates to the helper, which contains the validation and exception
handling. The framework supplies the run identifier and telemetry record even
though this small helper does not need to use them directly.

The class remains abstract until both methods are implemented. Avoid renaming
the package to `dev_demo_plugin` or `dev_demo_scenario`: those directory names
violate the factory's naming rules. The module is
`dev_demo_scenario_plugin.py` and its class is `DevDemoScenarioPlugin`.

## Understand the configuration binding

The main Krkn configuration selects the type and its scenario file:

```yaml
kraken:
  chaos_scenarios:
    - dev_demo_scenarios:
        - scenarios/dev_demo.yaml
```

The engine calls `run(scenario="scenarios/dev_demo.yaml", ...)`. The plugin
opens that file and reads `wait` and `namespace`. The scenario type, file path,
and field names serve different purposes; changing one does not automatically
change the others.

For a source-based Krkn run, copy the sample and derive a dedicated main config:

```bash
cp "$KRKN_DEV_PLUGIN_DIR/scenario.yaml" "$KRKN_DIR/scenarios/dev_demo.yaml"
cp "$KRKN_DIR/config/config.yaml" "$KRKN_DIR/config/dev_demo_config.yaml"
```

Set the `kraken.chaos_scenarios` section in `dev_demo_config.yaml` to the example
above. The next part packages this same binding in the image's startup script,
so a source-based run is optional.

## Check before building

```bash
python3 -m py_compile "$KRKN_DEV_PLUGIN_DIR/dev_demo_scenario_plugin.py"
```

{{% alert title="Tip: what a syntax check proves" color="info" %}}
`py_compile` compiles the file without importing it or contacting Kubernetes.
Successful execution normally produces no output and writes bytecode under
`__pycache__`. It catches syntax and indentation errors, but does not prove
abstract-method completeness, plugin discovery, or Kubernetes permissions.
Those checks follow in the container tests.
{{% /alert %}}

The plugin keeps a nonzero result meaningful: an invalid input or missing
namespace must not be converted into success just to keep the container running.
For a real chaos action, add restoration and rollback behavior appropriate to
the resources it changes.

**Next:** [Package and test the image](/docs/developers-guide/custom-scenario/package-and-test/).
