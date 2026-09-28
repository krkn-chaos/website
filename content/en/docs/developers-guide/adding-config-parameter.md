---
title: Adding a New Config Parameter (Global and Scenario Specific)
description: Checklist for adding a new parameter to the Krkn global configuration
weight: 4
categories: [Best Practices]
tags: [docs]
---

# Adding a New Global Config Parameter

When adding a new parameter to Krkn's global configuration (`config/config.yaml`), changes are required across multiple repositories to ensure the parameter is available through all run methods (Krkn, Krkn-hub, and Krknctl) and properly documented on the website.

## 1. Krkn (core)

**Repo:** [krkn-chaos/krkn](https://github.com/krkn-chaos/krkn)

1. Add the parameter with a default value to [`config/config.yaml`](https://github.com/krkn-chaos/krkn/blob/main/config/config.yaml) under the appropriate section (e.g., `kraken`, `telemetry`, `tunings`, etc.)
2. Update the code that reads and uses the config to handle the new parameter

## 2. Krkn-hub

**Repo:** [krkn-chaos/krkn-hub](https://github.com/krkn-chaos/krkn-hub)

1. Add the parameter to [`config.yaml.template`](https://github.com/krkn-chaos/krkn-hub/blob/main/config.yaml.template) with an environment variable placeholder (e.g., `$TELEMETRY_GENERATE_PDF_REPORT`)
2. Set a default value for the environment variable in [`env.sh`](https://github.com/krkn-chaos/krkn-hub/blob/main/env.sh)

## 3. Krknctl

**Repo:** [krkn-chaos/krkn-hub](https://github.com/krkn-chaos/krkn-hub)

Since krknctl discovers parameters from the `krknctl-input.json` files in krkn-hub, add the new parameter to the **global** [`krknctl-input.json`](https://github.com/krkn-chaos/krkn-hub/blob/main/containers/krknctl-input.json) so it appears as a CLI flag for all scenarios.

Add an entry matching the parameter type. See [Adding New Scenario to Krknctl](./krknctl-edits.md) for the full list of supported types (`enum`, `string`, `number`, `file`, `file_base64`).

Example for a boolean parameter:
```json
{
    "name": "<flag-name>",
    "short_description": "<short description>",
    "description": "<longer description>",
    "variable": "<ENV_VAR_NAME>",
    "type": "enum",
    "allowed_values": "True,False",
    "separator": ",",
    "default": "False",
    "required": "false",
    "group": "general"
}
```

## 4. Website documentation

**Repo:** [krkn-chaos/website](https://github.com/krkn-chaos/website)

Three files need to be updated on the website. Add the parameter to the matching section (Kraken, Cerberus, Telemetry, Tunings, etc.) in each file:

### a. Config reference page

**File:** [`content/en/docs/krkn/config.md`](https://github.com/krkn-chaos/website/blob/main/content/en/docs/krkn/config.md)

1. Add a field description under the appropriate section heading (e.g., `## Telemetry`)
2. Add the parameter with a default value and comment to the **Sample Config file** YAML block at the bottom of the page

### b. Krkn-Hub environment variables

**File:** [`content/en/docs/scenarios/all-scenario-env.md`](https://github.com/krkn-chaos/website/blob/main/content/en/docs/scenarios/all-scenario-env.md)

Add a row to the parameter table in the matching section:

```
`ENV_VAR_NAME` | Description of the parameter | Default
```

### c. Krknctl CLI flags

**File:** [`content/en/docs/scenarios/all-scenario-env-krknctl.md`](https://github.com/krkn-chaos/website/blob/main/content/en/docs/scenarios/all-scenario-env-krknctl.md)

Add a row to the parameter table in the matching section:

```
| `--flag-name` | Description of the parameter | Type | Possible Values | Default |
```

## Global Parameter Checklist

- [ ] Added parameter and default to `config/config.yaml` in **krkn**
- [ ] Updated krkn code to read and use the new parameter
- [ ] Added env var placeholder to `config.yaml.template` in **krkn-hub**
- [ ] Set default value in `env.sh` in **krkn-hub**
- [ ] Added entry to the global `krknctl-input.json` in **krkn-hub**
- [ ] Added field description to `config.md` on the **website**
- [ ] Added parameter to sample config YAML in `config.md` on the **website**
- [ ] Added env var row to `all-scenario-env.md` on the **website**
- [ ] Added CLI flag row to `all-scenario-env-krknctl.md` on the **website**
- [ ] Tested that the parameter works via all three run methods (Krkn, Krkn-hub, Krknctl)

---

# Scenario-Specific Config Parameters

When adding a new parameter to a specific scenario's configuration (e.g., a new field in `scenarios/kube/pod_scenario.yml`), the following changes are needed:

## 1. Krkn (core)

**Repo:** [krkn-chaos/krkn](https://github.com/krkn-chaos/krkn)

1. Add the parameter to the scenario's YAML config file (e.g., `scenarios/kube/pod_scenario.yml`)
2. Update the scenario plugin code to read and use the new parameter

## 2. Krkn-hub

**Repo:** [krkn-chaos/krkn-hub](https://github.com/krkn-chaos/krkn-hub)

1. Add the parameter with an environment variable placeholder to the scenario's template file (e.g., `pod-scenarios/pod_scenario.yaml.template`)
2. Set a default value for the environment variable in the scenario's `env.sh` (e.g., `pod-scenarios/env.sh`)

## 3. Krknctl

**Repo:** [krkn-chaos/krkn-hub](https://github.com/krkn-chaos/krkn-hub)

Add an entry for the new parameter in the scenario's `krknctl-input.json` file (e.g., `pod-scenarios/krknctl-input.json`). See [Adding New Scenario to Krknctl](./krknctl-edits.md) for the full list of supported types.

## 4. Website documentation

**Repo:** [krkn-chaos/website](https://github.com/krkn-chaos/website)

Update the scenario's page on the website under `content/en/docs/scenarios/<scenario-slug>/`:

1. **`_tab-krkn.md`** — Document the parameter in the Krkn tab content (YAML config example and description)
2. **`_tab-krkn-hub.md`** — Add the environment variable to the Krkn-hub tab content
3. **`_tab-krknctl.md`** — Add the CLI flag to the Krknctl tab content

See [Adding a New Chaos Scenario](https://krkn-chaos.dev/docs/scenarios/) for the tab file format and conventions.

## Scenario Parameter Checklist

- [ ] Added parameter to the scenario YAML config in **krkn**
- [ ] Updated scenario plugin code to read and use the new parameter
- [ ] Added env var placeholder to the scenario template in **krkn-hub**
- [ ] Set default value in the scenario's `env.sh` in **krkn-hub**
- [ ] Added entry to the scenario's `krknctl-input.json` in **krkn-hub**
- [ ] Updated `_tab-krkn.md` on the **website**
- [ ] Updated `_tab-krkn-hub.md` on the **website**
- [ ] Updated `_tab-krknctl.md` on the **website**
- [ ] Tested that the parameter works via all three run methods (Krkn, Krkn-hub, Krknctl)