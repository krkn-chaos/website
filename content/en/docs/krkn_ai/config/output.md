---
title: Output
description: Configuring output formatters
weight: 5
---

Krkn-AI generates various output files during the execution of chaos experiments, including scenario YAML files, graph visualizations, and log files. By default, these files follow a standard naming convention, but you can customize the file names using format strings in the configuration file.

## Available Parameters

The `output` section in your `krkn-ai.yaml` configuration file allows you to customize the naming format for different output file types:

### `result_name_fmt`

Specifies the naming format for scenario result YAML files. These files contain the complete scenario configuration and execution results for each generated scenario.

**Default:** `"scenario_%s.yaml"`

### `graph_name_fmt`

Specifies the naming format for graph visualization files. These files contain visual representations of the health check latency and success information.

**Default:** `"scenario_%s.png"`

### `log_name_fmt`

Specifies the naming format for log files. These files contain execution logs for each scenario run.

**Default:** `"scenario_%s.log"`

## Format String Placeholders

The format strings support the following placeholders:

- `%g` - Generation number
- `%s` - Scenario ID
- `%c` - Scenario Name (e.g pod_scenarios)

## Example

Here's an example configuration that customizes all output file names:

```yaml
output:
  result_name_fmt: "gen_%g_scenario_%s_%c.yaml"
  graph_name_fmt: "gen_%g_scenario_%s_%c.png"
  log_name_fmt: "gen_%g_scenario_%s_%c.log"
```

With this configuration, files will be named like:
- `gen_0_scenario_1_pod_scenarios.yaml`
- `gen_0_scenario_1_pod_scenarios.png`
- `gen_0_scenario_1_pod_scenarios.log`
