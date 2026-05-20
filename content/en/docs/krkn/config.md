---
title: Krkn Config Explanations
description: Krkn configuration — what each feature is for, when to enable it, and field-by-field reference.
weight: 1
---

# Global configuration overview

The main Krkn YAML ties together **what chaos runs** (scenario files), **how often** (iterations, waits), **how you observe impact** (Cerberus, Prometheus, health checks), and **where artifacts go** (telemetry archives, optional Elasticsearch, optional upload endpoint).

Canonical examples live in the Krkn repository:

- [`config/config.yaml`](https://github.com/krkn-chaos/krkn/blob/main/config/config.yaml) — standard runs  
- [`config/config_performance.yaml`](https://github.com/krkn-chaos/krkn/blob/main/config/config_performance.yaml) — often used with automated dependency setup (may include keys Krkn itself does not read; see [Performance monitoring](#performance-monitoring))

{{< notice type="info" >}}
**YAML root keys:** Krkn still uses the historical root key **`kraken:`** (not `krkn:`) for core run settings. The headings below show both the human-readable name and the YAML key in parentheses.
{{< /notice >}}

## How a run uses this file (lifecycle)

At a high level, Krkn:

1. Loads the YAML and initializes Kubernetes/OpenShift clients (`kraken.kubeconfig_path` or in-cluster credentials).
2. Detects **OpenShift vs Kubernetes** from the API and may auto-fill Prometheus connection data on OpenShift.
3. Starts optional **HTTP signal server** when publishing status (`publish_kraken_status`).
4. Starts optional **background health plugins** (HTTP endpoints and/or KubeVirt SSH checks) for the whole run.
5. For each **iteration**, walks `kraken.chaos_scenarios` **in order**. Each entry is `{scenario_type: [list of scenario YAML paths]}`.
6. For each scenario file in that list: runs the scenario, optionally collects events/logs, calls **Cerberus** validation, then sleeps **`tunings.wait_duration`** seconds before the **next file**.
7. After all iterations: aggregates telemetry JSON, optional **Elasticsearch** writes, optional **remote upload**, optional **post-run alert/metrics profiles**, then chooses an **exit code**.

Use this page as the map; deeper behavior lives in [Telemetry](telemetry.md), [Resiliency scoring](resiliency-score.md), [Signals](signal.md), [SLOs / profiles](SLOs_validation.md), [Health checks](health-checks.md), and [Virt checks](virt-checks.md).

## Page map

| Section | YAML key | Why it matters |
| ------- | -------- | --------------- |
| [Krkn core](#krkn-core-kraken) | `kraken:` | Cluster access, scenario plan, signals, rollback |
| [Cerberus](#cerberus-integration-cerberus) | `cerberus:` | Go/no-go signal after each scenario |
| [Performance monitoring](#performance-monitoring) | `performance_monitoring:` | Prometheus + profiles + critical-alert gates |
| [Resiliency scoring](#resiliency-scoring) | `resiliency:` | SLO-based scoring (needs working Prometheus) |
| [Elasticsearch](#elasticsearch) | `elastic:` | Central indexing of telemetry/metrics/alerts |
| [Tunings](#tunings) | `tunings:` | Iterations, pacing, daemon mode |
| [Telemetry](#telemetry) | `telemetry:` | Archives, logs, optional upload pipeline |
| [HTTP health checks](#health-checks) | `health_checks:` | Probe apps during chaos |
| [KubeVirt checks](#kubevirt-checks) | `kubevirt_checks:` | SSH reachability to VMIs |

Equivalent CLI / hub mappings: [krknctl flags](../scenarios/all-scenario-env-krknctl.md) · [krkn-hub variables](../scenarios/all-scenario-env.md)

---

<a id="kraken"></a>
## Krkn core (`kraken`) {#krkn-core-kraken}

**What it is.** The primary block: kubeconfig, ordered chaos plan, optional HTTP control API for RUN/PAUSE/STOP, optional automated rollback hooks, and a flag that flows into Cerberus handling.

**Why use it.** This is how you declare **which experiments execute**, **which cluster** they touch, and whether automation can **pause or gate** a long-running campaign.

**When to tune.**

- Tight CI: explicit kubeconfig, narrow scenario lists, consider disabling daemon mode (see [Tunings](#tunings)).
- Operator-driven drills: enable `publish_kraken_status` and integrate with your orchestrator using [Signals](signal.md).
- Safer iteration on rollback plugins: start with `auto_rollback: false` until rollback artifacts are trusted.

**Trade-offs.** Signal endpoints bind to a network listener — restrict binding addresses and ports in locked-down environments. Scenario paths are resolved relative to the **process working directory** when Krkn starts.

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#kraken) · [krkn-hub variables](../scenarios/all-scenario-env.md#kraken)

### Minimal example

```yaml
kraken:
  kubeconfig_path: ~/.kube/config
  chaos_scenarios:
    - pod_disruption_scenarios:
        - scenarios/openshift/etcd.yml
```

### Distribution detection

Krkn detects **OpenShift vs Kubernetes** after client init. On OpenShift it may **automatically discover Prometheus URL and bearer token** when `performance_monitoring.prometheus_url` is empty. On plain Kubernetes you must set Prometheus URL and token yourself when using monitoring features.

If Prometheus auto-discovery fails on OpenShift, Krkn logs an error that mentions `krkn.platform`; **there is no `krkn.platform` field** consumed by `run_kraken.py` — treat that message as misleading and fix Prometheus connectivity or set URL/token explicitly.

### Chaos scenario plan

`chaos_scenarios` is an ordered list of objects; each object has **exactly one key**: the **scenario type string** expected by the plugin factory (see [Scenario type keys](#scenario-type-keys-reference)).

**Execution semantics (important).**

- Scenario **files** under one type run **sequentially**. Krkn **does not stop the whole list** when one file fails: failures are recorded and execution continues, then Cerberus runs after **each** file (`publish_kraken_status`).
- Between **every** scenario file Krkn sleeps `tunings.wait_duration` seconds.

Paths must exist **relative to the current working directory** when Krkn starts.

### Signal server (`publish_kraken_status`)

When `publish_kraken_status` is true, Krkn exposes an HTTP endpoint (see [signal.md](signal.md)) using `signal_address` and `port` (validated `0–65535`). Use **RUN / PAUSE / STOP** semantics to coordinate with external automation.

**Benefits:** safe human gates, integration with progressive delivery or custom controllers.

**Risks:** binds a listener (`0.0.0.0` exposes all interfaces — prefer tighter bindings when possible).

### Exit-on-failure interaction (`exit_on_failure`)

This boolean is loaded into Cerberus integration (`cerberus.exit_on_failure`). **`publish_kraken_status` is invoked after every scenario file.**

{{< notice type="warning" >}}
**Unexpected behavior:** When Cerberus is **disabled** or reports healthy (`True`), the integration branch treated as “healthy” still **`sys.exit(1)` whenever `exit_on_failure` is true**, with log text implying post-actions failed—even though that condition is **not** evaluated separately in code. **Leave `exit_on_failure: false` unless you are deliberately experimenting with this code path.**
{{< /notice >}}

When Cerberus is enabled and reports **not healthy**, Krkn exits from Cerberus validation **before** `exit_on_failure` semantics matter.

### Rollback

| Field | Type | Default | Notes |
| ----- | ---- | ------- | ----- |
| `auto_rollback` | boolean | `false` | When `false`, rollback modules are **not** executed automatically on scenario failure. |
| `rollback_versions_directory` | string | `""` → `~/.krkn/rollback` | Empty string triggers secure default directory (`0700`). |

**Why.** Lets scenarios emit rollback artifacts for optional automated mitigation.

**Trade-off.** Automatic rollback executes serialized rollback payloads — only enable when rollback modules are reviewed and tested.

### Krkn core reference (`kraken`)

In the tables below, **Default** is the value Krkn applies when the key is **omitted** (`get_yaml_item_value` in [`run_kraken.py`](https://github.com/krkn-chaos/krkn/blob/main/run_kraken.py)), unless noted otherwise. Use **—** when the key must still appear in a complete `config.yaml` (ship template) or behavior is fully context-dependent.

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `kubeconfig_path` | string | `""` | Path to kubeconfig (expanded `~`). If missing **and** no pod SA token at `/var/run/secrets/kubernetes.io/serviceaccount/token`, Krkn exits early. |
| `chaos_scenarios` | list | `[]` | Ordered `{scenario_type: [scenario.yml, …]}[]` list. |
| `publish_kraken_status` | boolean | `false` | Start HTTP signal server when `true`. |
| `signal_state` | string | `"RUN"` | Initial desired state (`RUN`, `PAUSE`, …); see [Signals](signal.md). |
| `signal_address` | string | `"0.0.0.0"` | Bind address (must be non-empty when publishing). |
| `port` | integer | `8081` | Listener port (`0`–`65535`). |
| `exit_on_failure` | boolean | `false` | Passed into Cerberus helper — see **Exit-on-failure interaction** earlier on this page. |
| `auto_rollback` | boolean | `false` | Controls automatic rollback execution. |
| `rollback_versions_directory` | string | `""` | Empty → `~/.krkn/rollback` (see [Rollback](#rollback)). |

---

<a id="cerberus"></a>
## Cerberus integration (`cerberus`) {#cerberus-integration-cerberus}

**What it is.** After **each scenario file**, Krkn can query a Cerberus endpoint that publishes a **go/no-go** byte string (`True` / `False`). Optionally it can scrape route downtime history for user-facing routes.

**Why use it.** Translate **cluster + workload health** into an automated pass/fail gate so chaos stops misleading “green” runs when customers would already be hurting.

**Benefits.** Strong linkage between experiment results and **production readiness** signals you already trust.

**Trade-offs.** Misconfigured Cerberus URLs or flaky routes history APIs cause **hard failures** (`sys.exit(1)`).

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#cerberus) · [krkn-hub variables](../scenarios/all-scenario-env.md#cerberus)

### Minimal example

```yaml
cerberus:
  cerberus_enabled: true
  cerberus_url: http://cerberus.cerberus:8080
```

### Behavior notes

- **`cerberus_enabled: true` requires `cerberus_url`.** Missing URL → exit.
- **Unhealthy signal or failed route history** → **`sys.exit(1)`** regardless of `exit_on_failure`.
- **`check_application_routes`** calls `{cerberus_url}/history?loopback=<minutes>` and fails if any **`route`** entries appear in the failures list.

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `cerberus_enabled` | boolean | `false` | Turn Cerberus validation on/off ([`krkn/cerberus/setup.py`](https://github.com/krkn-chaos/krkn/blob/main/krkn/cerberus/setup.py) — `get_yaml_item_value`). |
| `cerberus_url` | string | `""` | Base URL whose response body must equal `True` when healthy; **required** when `cerberus_enabled` is true. |
| `check_application_routes` | boolean | `false`* | Also validate monitored routes had no downtime window (`cerberus_url/history?loopback=…`). *If the key is omitted, the parser default is `''` (empty string), which behaves like off. |

More on Cerberus itself: [Cerberus docs](../cerberus/_index.md).

---

## Performance monitoring (`performance_monitoring`) {#performance-monitoring}

**What it is.** Prometheus connectivity plus optional **alert queries**, **metrics capture**, and **critical alert checks** after scenario batches.

**Why use it.** Chaos without observability is anecdotal — tying experiments to **real alerts and metrics** grounds remediation and regression detection.

**Benefits.**

- Post-run **alert profile** evaluation against Prometheus (when enabled).
- Optional **critical alert guardrail** immediately after each scenario type batch completes.

**Trade-offs.**

- `alert_profile` / `metrics_profile` must be **local filesystem paths** Krkn can `open()` — **remote URLs are not supported** in `prometheus/client.py`.
- Missing files → Krkn exits non-zero when those features are enabled.
- If Prometheus URL is blank or unreachable and resiliency was not already `disabled`, Krkn **forces resiliency scoring off**.

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#performance-monitoring) · [krkn-hub variables](../scenarios/all-scenario-env.md#performance-monitoring)

### `check_critical_alerts` scope

After each **`chaos_scenarios` batch**, Krkn queries firing critical alerts. If any post-chaos critical alerts are recorded, Krkn **breaks out of the scenario loop for that iteration only** — outer iterations can still continue. Know this when you assume “abort entire matrix.”

### Keys not consumed by `run_kraken.py`

Some sample YAML keys in automation-focused configs support **install/setup workflows** outside the core runner — Krkn’s main runner **does not read them**. Prefer documenting that automation beside those files, not in this runtime reference.

### Performance monitoring reference

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `prometheus_url` | string | `null` / unset | Prometheus API endpoint; on OpenShift, auto-filled when empty and discovery succeeds. |
| `prometheus_bearer_token` | string | `null` / unset | Bearer token; on OpenShift, auto-filled with URL when discovery succeeds. |
| `uuid` | string | unset → generated | Run correlation ID; random UUID string if omitted. |
| `enable_alerts` | boolean | `false` | After full run window, evaluate alert profile → logs / Elasticsearch. |
| `enable_metrics` | boolean | `false` | After full run window, evaluate metrics profile. |
| `alert_profile` | string | `null` / unset | **Local path** — YAML list (`expr`, `description`, `severity` per entry). Required when `enable_alerts` is true. |
| `metrics_profile` | string | `null` / unset | **Local path** — YAML with `metrics:` list (see [SLOs validation](SLOs_validation.md)). Required when `enable_metrics` is true. |
| `check_critical_alerts` | boolean | `false` | Query critical alerts after each scenario batch; may break inner loop. |

### Minimal example

```yaml
performance_monitoring:
  prometheus_url: https://prometheus-k8s.openshift-monitoring.svc:9091
  enable_alerts: true
  alert_profile: config/alerts.yaml
```

---

<a id="resiliency-score"></a>
## Resiliency scoring (`resiliency`) {#resiliency-scoring}

**What it is.** Optional scoring layer that evaluates Service Level Objectives (SLOs) backed by Prometheus data and embeds summaries into telemetry output.

**Why use it.** Condense multidimensional signals into a **comparable score** for dashboards, gates, or regression tracking across runs.

**When Prometheus is unavailable.** Krkn disables scoring (`run_mode` forced to `disabled`) when URL missing/blank or connectivity probe fails — log explicitly states resiliency features are disabled.

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#resiliency-score) · [krkn-hub variables](../scenarios/all-scenario-env.md#resiliency-score)

### Modes {#modes}

| `resiliency_run_mode` | Behavior |
| --------------------- | -------- |
| `standalone` (default) | Score embedded in telemetry payload. |
| `detailed` | Emit richer stdout-oriented reporting (common with krknctl). |
| `disabled` | Skip scoring entirely. |

Unknown values → warning + fallback to `standalone`.

### Resiliency reference

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `resiliency_run_mode` | string (`standalone` \| `detailed` \| `disabled`) | `standalone` | How scores are computed and surfaced (see [modes](#modes) above). Unknown values → `standalone`. |
| `resiliency_file` | string | falls back to `performance_monitoring.alert_profile`, then **`config/alerts.yaml`** | Path to SLO definitions YAML; file **must exist** when scoring is enabled (`run_mode != disabled`). |

### Minimal example

```yaml
resiliency:
  resiliency_run_mode: standalone
  resiliency_file: config/alerts.yaml
```

Deep dive: [Resiliency scoring](resiliency-score.md).

---

<a id="elastic"></a>
## Elasticsearch (`elastic`) {#elasticsearch}

**What it is.** Optional indexing of chaos telemetry plus alert/metric payloads into Elasticsearch indices.

**Why use it.** Centralized search and dashboards across many runs and clusters — especially when paired with enabled Prometheus profiles.

**Trade-offs.** Requires provisioning and operating an external Elasticsearch service (storage, retention, and access controls). Push failures are logged but do not stop scenario execution.

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#elastic) · [krkn-hub variables](../scenarios/all-scenario-env.md#elastic)

Indexing occurs only when `enable_elastic: true` **and** connectivity params resolve. Alerts/metrics Elasticsearch writes additionally respect `performance_monitoring.enable_alerts` / `enable_metrics`.

### Elasticsearch reference

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `enable_elastic` | boolean | `false` | Master toggle for Elasticsearch client and pushes. |
| `verify_certs` | boolean | `false` | TLS certificate verification for Elasticsearch. |
| `elastic_url` | string | `""` | Cluster hostname / URL fragment (used with port). |
| `elastic_port` | integer | `32766` | Elasticsearch port. |
| `username` | string | `""` | Basic auth user (do **not** commit real secrets). |
| `password` | string | `""` | Basic auth password. |
| `metrics_index` | string | `"krkn-metrics"` | Index for metrics uploads when enabled. |
| `alerts_index` | string | `"krkn-alerts"` | Index for alert objects when enabled. |
| `telemetry_index` | string | `"krkn-telemetry"` | Index for consolidated telemetry document. |
| `run_tag` | string | `""` | Tag stored on telemetry (`chaos_telemetry.tag`). |

### Minimal example

```yaml
elastic:
  enable_elastic: true
  elastic_url: elasticsearch.logging.svc
  elastic_port: 9200
```

---

## Tunings (`tunings`) {#tunings}

**What it is.** Controls **how long to pause between scenario files** and how many **top-level iterations** repeat the entire `chaos_scenarios` list.

**Why use it.** Lets blast radius dissipate between injections and supports soak testing.

### Tunings reference

| Parameter | Type | Default | Behavior |
| --------- | ---- | ------- | -------- |
| `wait_duration` | integer | `60` | Seconds to sleep **after each scenario file** (`time.sleep`). Upstream sample YAML often uses `1` for quick demos. |
| `iterations` | integer | `1` | How many times to repeat the full `chaos_scenarios` loop (unless daemon mode). |
| `daemon_mode` | boolean | `false` | When `true`, iterations become infinite and configured `iterations` is ignored. |

{{< notice type="info" >}}
**Sample YAML vs code defaults:** The checked-in [`config/config.yaml`](https://github.com/krkn-chaos/krkn/blob/main/config/config.yaml) may set `wait_duration: 1` for fast demos. Omitting the key in your own file yields **60s** per Krkn’s `get_yaml_item_value` default.
{{< /notice >}}

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#tunings) · [krkn-hub variables](../scenarios/all-scenario-env.md#tunings)

### Minimal example

```yaml
tunings:
  wait_duration: 60
  iterations: 1
```

---

## Telemetry (`telemetry`) {#telemetry}

**What it is.** Local archiving paths, optional Prometheus WAL snapshots, log scraping filters, cluster events capture, and optional **remote upload** when both `enabled` and `api_url` are set.

**Why use it.** Preserve evidence for retrospective debugging (metrics correlates, logs, events, archives) and optionally feed a centralized telemetry service.

**Benefits.** Repeatable incident timelines; easier collaboration across teams.

**Trade-offs.** Disk usage, credential exposure risk, upload retries on flaky networks.

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#telemetry) · [krkn-hub variables](../scenarios/all-scenario-env.md#telemetry)

Full pipeline details: [telemetry.md](telemetry.md)

### Upload gate

Remote upload runs **only when `enabled` is true AND `api_url` is non-empty**. If upload is skipped, Krkn logs **`api_url not set, skipping telemetry upload`** — even when `enabled` is `false` (message is generic).

### Archive directory

If `archive_path` is empty / unset, Krkn creates a **secure temporary directory** prefixed `krkn-archive-` and registers cleanup on exit — **not `/tmp` by default**.

### Prometheus backup

| Distribution | Behavior |
| ------------ | -------- |
| OpenShift | Uses OCP helpers when `prometheus_backup: true`. |
| Kubernetes | Requires **`prometheus_namespace`**, **`prometheus_pod_name`**, **`prometheus_container_name`** simultaneously or backup is skipped with a warning. |

### Kubernetes metadata log message

On non-OpenShift clusters Krkn logs **“telemetry disabled, skipping cluster metadata collection”** — this refers specifically to **OpenShift-only metadata enrichment**, not the whole telemetry subsystem.

### Telemetry reference (`telemetry`)

Most telemetry keys are read **without** `run_kraken.py` fallbacks — treat upstream [`config/config.yaml`](https://github.com/krkn-chaos/krkn/blob/main/config/config.yaml) as the completeness checklist. The **Default** column lists values applied in Python **when the key is omitted**, where implemented.

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `enabled` | boolean | `true` | With non-empty `api_url`, enables remote upload pipeline (`.get("enabled", True)`). |
| `api_url` | string | `""` | Telemetry upload endpoint; empty skips upload (message logged). |
| `archive_path` | string | unset → **secure temp dir** | Staging directory; empty/`None` creates `krkn-archive-*` + optional cleanup on exit. |
| `run_tag` | string | unset → omitted | Appended to `telemetry_request_id` when present (`telemetry.get("run_tag")`). |
| `username` | string | — | Credentials / identifiers for telemetry API — define explicitly (upstream template uses placeholders). |
| `password` | string | — | Same as `username`. |
| `prometheus_backup` | boolean | — | Snapshot Prometheus data when `true`; paths depend on distribution (see above). |
| `prometheus_namespace` | string | — | Kubernetes Prometheus backup: namespace (required with pod + container names). |
| `prometheus_pod_name` | string | — | Kubernetes Prometheus backup: pod name. |
| `prometheus_container_name` | string | — | Kubernetes Prometheus backup: container name. |
| `full_prometheus_backup` | boolean | — | When `false`, WAL-focused subset on supported paths (see [telemetry.md](telemetry.md)). |
| `backup_threads` | integer | — | Parallel chunk workers (upstream sample `5`). |
| `max_retries` | integer | — | Upload retries (`0` = retry indefinitely per upstream comments). |
| `archive_size` | integer | — | Chunk size (KB) for archives. |
| `telemetry_group` | string | — | Remote folder grouping (`default` when blank in paths). |
| `logs_backup` | boolean | — | Collect filtered logs when enabled. |
| `logs_filter_patterns` | list of strings | — | Regex patterns for log lines. |
| `oc_cli_path` | string | — | Path to `oc` CLI (optional). |
| `events_backup` | boolean | — | Capture Kubernetes events per scenario window when `true`. |

### Minimal example

```yaml
telemetry:
  enabled: false
  api_url: ""
  archive_path: ""
```

---

## HTTP health checks (`health_checks`) {#health-checks}

**What it is.** Background polling of HTTP endpoints while chaos runs, producing uptime/downtime structured telemetry.

**Why use it.** Translate user-visible availability into measurable intervals instead of inferring from logs alone.

**Trade-offs.** Synthetic probes add steady traffic; TLS verification and auth must mirror production clients.

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#health-checks) · [krkn-hub variables](../scenarios/all-scenario-env.md#health-checks)

Details & patterns: [health-checks.md](health-checks.md)

### Auth format

Use **`auth: "username,password"`** (comma-separated string) — Krkn splits into a `(user, pass)` tuple internally. Optional `bearer_token` adds `Authorization: Bearer …`.

### Failure propagation

Per-endpoint `exit_on_failure: true` sets the plugin return value to **`3`** when failures occur while `ret_value` was still `0` — influencing final process exit (see [Exit codes](#exit-codes)).

### Health checks reference

Top-level `health_checks`:

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `interval` | integer | `2` | Seconds between poll rounds ([`http_health_check_plugin.py`](https://github.com/krkn-chaos/krkn/blob/main/krkn/health_checks/http_health_check_plugin.py)). |
| `config` | list | — | List of per-endpoint objects (see below). Empty / missing URLs → plugin skips. |

Each entry in `config`:

| Field | Type | Default | Purpose |
| ----- | ---- | ------- | ------- |
| `url` | string | — | Endpoint to GET (required for that entry). |
| `bearer_token` | string | optional | Sent as `Authorization: Bearer …`. |
| `auth` | string | optional | Basic auth as **`"username,password"`** (comma-separated). |
| `verify_url` | boolean | `true` | TLS verification for HTTPS. |
| `exit_on_failure` | boolean | `false` | Set plugin exit **`3`** on sustained failure path when `true`. |

### Minimal example

```yaml
health_checks:
  interval: 2
  config:
    - url: https://console-openshift-console.apps.example.com/health
      verify_url: true
```

---

<a id="virt-checks"></a>
## KubeVirt checks (`kubevirt_checks`) {#kubevirt-checks}

**What it is.** Monitors **SSH-style reachability** to KubeVirt VMIs during chaos — complementary to Kubernetes API checks.

**Why use it.** Validates virtualization-layer UX during node/network chaos.

**Requirements.** **`namespace` must be non-empty** or the plugin skips entirely.

See equivalent parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#virt-checks) · [krkn-hub variables](../scenarios/all-scenario-env.md#virt-checks)

Details: [virt-checks.md](virt-checks.md)

### KubeVirt checks reference

| Parameter | Type | Default | Purpose |
| --------- | ---- | ------- | ------- |
| `interval` | integer | `2` | Seconds between checks ([`virt_health_check_plugin.py`](https://github.com/krkn-chaos/krkn/blob/main/krkn/health_checks/virt_health_check_plugin.py)). |
| `namespace` | string | `""` | **Required** — empty skips all virt checks. |
| `name` | string (regex) | `".*"` | VMI name filter. |
| `only_failures` | boolean | `false` | Telemetry verbosity. |
| `disconnected` | boolean | `false` | Disconnected SSH vs virtctl-oriented path. |
| `ssh_node` | string | `""` | Optional fallback SSH jump host. |
| `node_names` | string | `""` | Comma-separated worker filter (string form in samples). |
| `exit_on_failure` | boolean | `false` | Fail run via plugin return code when failures persist (see plugin behavior). |

### Minimal example

```yaml
kubevirt_checks:
  interval: 2
  namespace: runner
  name: ".*"
```

---

## Scenario type keys (reference) {#scenario-type-keys-reference}

Each `chaos_scenarios` entry must use a **scenario type string** registered by a loaded plugin. At startup Krkn logs the mapping (`ScenarioPluginFactory`).

Known types shipped with Krkn include:

| Scenario type key | Scenario focus |
| ----------------- | -------------- |
| `application_outages_scenarios` | Application-level outages |
| `cluster_shut_down_scenarios` | Whole-cluster shutdown drills |
| `container_scenarios` | Container-level chaos |
| `hog_scenarios` | CPU/memory/io pressure |
| `http_load_scenarios` | HTTP load testing |
| `managedcluster_scenarios` | Managed cluster / fleet scenarios |
| `network_chaos_scenarios` | Legacy network chaos plugin |
| `network_chaos_ng_scenarios` | Next-gen network chaos modules |
| `node_scenarios` | Node-level failure injection |
| `pod_disruption_scenarios` | Pod disruption budgets / eviction flows |
| `pvc_scenarios` | Storage/PVC oriented chaos |
| `service_disruption_scenarios` | Service routing disruption |
| `service_hijacking_scenarios` | Traffic hijack simulations |
| `syn_flood_scenarios` | SYN flood networking stress |
| `time_scenarios` | Clock / time manipulation |
| `zone_outages_scenarios` | Zone outage simulations |
| `storage_throttle_scenarios` | Storage throttle scenarios |
| `pod_network_scenarios` | Native Arcaflow pod network scenarios |
| `ingress_node_scenarios` | Native ingress-node shaping scenarios |
| `kubevirt_vm_outage` | KubeVirt VMI outage plugin |

If a key is unknown, Krkn logs **`ScenarioPluginNotFound`** and exits with code **`-1`**.

Scenario YAML specifics live under [Scenarios](../scenarios/).

---

## Exit codes {#exit-codes}

Krkn returns deterministic codes after shutdown:

| Code | Meaning |
| ---- | ------- |
| `0` | Success — no recorded scenario failures, health plugins clean, no lingering critical alerts flagged for exit. |
| `1` | One or more scenario files reported failure (`failed_post_scenarios`). |
| `2` | Critical Prometheus alerts still flagged post-run (`post_critical_alerts > 0`). |
| `≥ 3` | Health plugin failure (`HTTP` / **KubeVirt** plugins commonly use `3`). |
| `-1` | CLI/config errors (missing kubeconfig/token, missing config path, unknown scenario type, etc.). |

Priority ordering matches comments in `run_kraken.py`: scenario failures win before health plugins, health plugins before critical-alert exit.

---

## Sample configuration file {#sample-configuration}

The YAML below is illustrative — replace endpoints, credentials, and scenario paths for your environment.

```yaml
kraken:
    kubeconfig_path: ~/.kube/config
    exit_on_failure: False                                 # See Cerberus warning above — keep false unless intentional
    publish_kraken_status: False                           # Enable only when an external orchestrator needs RUN/PAUSE/STOP
    signal_state: RUN
    signal_address: 127.0.0.1                              # Keep loopback by default; widen only on trusted networks
    port: 8081
    auto_rollback: False
    rollback_versions_directory: ""                         # Defaults to ~/.krkn/rollback when empty
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/cpu-hog.yml
            - scenarios/kube/memory-hog.yml
            - scenarios/kube/io-hog.yml
        - application_outages_scenarios:
            - scenarios/openshift/app_outage.yaml
        - container_scenarios:
            - scenarios/openshift/container_etcd.yml
        - pod_network_scenarios:
              - scenarios/openshift/network_chaos_ingress.yml
              - scenarios/openshift/pod_network_outage.yml
        - pod_disruption_scenarios:
            - scenarios/openshift/etcd.yml
            - scenarios/openshift/regex_openshift_pod_kill.yml
            - scenarios/openshift/prom_kill.yml
            - scenarios/openshift/openshift-apiserver.yml
            - scenarios/openshift/openshift-kube-apiserver.yml
        - node_scenarios:
            - scenarios/openshift/aws_node_scenarios.yml
            - scenarios/openshift/vmware_node_scenarios.yml
            - scenarios/openshift/ibmcloud_node_scenarios.yml
        - time_scenarios:
            - scenarios/openshift/time_scenarios_example.yml
        - cluster_shut_down_scenarios:
            - scenarios/openshift/cluster_shut_down_scenario.yml
        - service_disruption_scenarios:
             - scenarios/openshift/regex_namespace.yaml
             - scenarios/openshift/ingress_namespace.yaml
        - zone_outages_scenarios:
            - scenarios/openshift/zone_outage.yaml
        - pvc_scenarios:
            - scenarios/openshift/pvc_scenario.yaml
        - network_chaos_scenarios:
            - scenarios/openshift/network_chaos.yaml
        - service_hijacking_scenarios:
              - scenarios/kube/service_hijacking.yaml
        - syn_flood_scenarios:
            - scenarios/kube/syn_flood.yaml

cerberus:
    cerberus_enabled: False
    cerberus_url:
    check_application_routes: False

performance_monitoring:
    prometheus_url: ''
    prometheus_bearer_token:
    uuid:
    enable_alerts: False
    enable_metrics: False
    alert_profile: config/alerts.yaml
    metrics_profile: config/metrics-report.yaml
    check_critical_alerts: False

resiliency:
    resiliency_run_mode: standalone
    resiliency_file: config/alerts.yaml

elastic:
    enable_elastic: False
    verify_certs: False
    elastic_url: ""
    elastic_port: 32766
    username: "elastic"
    password: "REPLACE_ME"
    metrics_index: "krkn-metrics"
    alerts_index: "krkn-alerts"
    telemetry_index: "krkn-telemetry"
    run_tag: ""

tunings:
    wait_duration: 60
    iterations: 1
    daemon_mode: False

telemetry:
    enabled: False
    api_url: ""                                             # Upload only when enabled=true AND api_url is non-empty
    username: REPLACE_ME
    password: REPLACE_ME
    prometheus_backup: True
    prometheus_namespace: ""
    prometheus_container_name: ""
    prometheus_pod_name: ""
    full_prometheus_backup: False
    backup_threads: 5
    archive_path: ""
    max_retries: 0
    run_tag: ''
    archive_size: 500000
    telemetry_group: ''
    logs_backup: True
    logs_filter_patterns:
     - "(\\w{3}\\s\\d{1,2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d+).+"
     - "kinit (\\d+/\\d+/\\d+\\s\\d{2}:\\d{2}:\\d{2})\\s+"
     - "(\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z).+"
    oc_cli_path: /usr/bin/oc
    events_backup: True

health_checks:
    interval: 2
    config:
        - url:
          bearer_token:
          auth:
          verify_url: true
          exit_on_failure: False

kubevirt_checks:
    interval: 2
    namespace:
    name:
    only_failures: False
    disconnected: False
    ssh_node: ""
    node_names: ""
    exit_on_failure: False
```
