---
title: Elasticsearch Storage
description: Storing telemetry, metrics, and alerts in Elasticsearch or OpenSearch
weight: 2
---

Krkn can push the data it collects at the end of each run into Elasticsearch (or OpenSearch) so you can query, visualize, and compare results across many runs over time. Three separate indices are written: one for telemetry, one for Prometheus metrics snapshots, and one for firing alerts.

See equivalent config parameters: [krknctl flags](../scenarios/all-scenario-env-krknctl.md#elastic) · [krkn-hub variables](../scenarios/all-scenario-env.md#elastic) · [krkn config file](config.md#elastic)

---

### Configuration

```yaml
elastic:
    enable_elastic: True           # set to True to enable all three indices
    verify_certs: False
    elastic_url: "https://my-elasticsearch.example.com"
    elastic_port: 9200
    username: "elastic"
    password: "changeme"
    telemetry_index: "krkn-telemetry"   # index for telemetry data
    metrics_index: "krkn-metrics"       # index for Prometheus metric snapshots
    alerts_index: "krkn-alerts"         # index for firing alerts
```

- **`enable_elastic`**: Set to `True` to activate Elasticsearch storage. Telemetry is always written when enabled. Metrics are written only when `performance_monitoring.enable_metrics: True`. Alerts are written only when `performance_monitoring.enable_alerts: True`.
- **`verify_certs`**: Set to `True` to enforce SSL certificate verification.
- **`elastic_url`**: Full URL of your Elasticsearch or OpenSearch server (include `https://` if using TLS).
- **`elastic_port`**: Port to connect on. Default is `9200` for most deployments; some managed services use `443`.
- **`metrics_index`**: Index where Prometheus metric snapshots are stored.
- **`alerts_index`**: Index where Prometheus alerts are stored.
- **`telemetry_index`**: Index where the full chaos run telemetry document is stored.

Krkn auto-detects whether the backend is Elasticsearch or OpenSearch by querying the cluster info endpoint — no extra config is needed to switch between them.

---

### Telemetry Index

One document per krkn run is written to `telemetry_index`. It contains all the fields printed in the [telemetry output](telemetry.md#telemetry-output-field-reference) plus several additional fields that are only populated when running in a CI environment.

#### Top-level fields

| Field | Type | Description |
|---|---|---|
| `run_uuid` | keyword | Unique run identifier — use this to join across all three indices |
| `timestamp` | text | ISO 8601 timestamp when telemetry was captured |
| `job_status` | bool | `true` = run passed overall |
| `cloud_infrastructure` | text | Cloud provider (e.g. `GCP`, `AWS`, `Azure`, `baremetal`) |
| `cloud_type` | text | `self-managed` or managed service type |
| `cluster_version` | text | Full version string of the cluster |
| `major_version` | text | Major.minor extracted from `cluster_version` |
| `total_node_count` | integer | Total node count at time of run |
| `network_plugins` | text (multi) | CNI plugins active on the cluster |
| `kubernetes_objects_count` | nested | Map of resource type → count (e.g. `Pod: 294`) |
| `fips_enabled` | bool | Whether FIPS mode was enabled on the cluster |
| `etcd_encryption_enabled` | bool | Whether etcd encryption at rest was enabled |
| `ipsec_enabled` | bool | Whether IPSec was enabled on the cluster |
| `build_url` | text | CI build URL (e.g. Prow job link) — populated in CI runs |
| `tag` | text | Optional run tag for grouping related runs |

#### `scenarios` (nested)

One entry per scenario executed. See the [scenario fields in the telemetry reference](telemetry.md#scenarios--one-entry-per-scenario-executed) for the full list. Additional fields stored only in Elasticsearch:

| Field | Type | Description |
|---|---|---|
| `affected_vmis` | nested | VirtualMachineInstances disrupted, with per-VMI recovery timing |
| `affected_vmis[].vmi_name` | text | Name of the affected VMI |
| `affected_vmis[].namespace` | text | Namespace the VMI belongs to |
| `affected_vmis[].total_recovery_time` | float | Seconds from disruption to VMI ready |
| `affected_vmis[].vmi_readiness_time` | float | Seconds for VMI to pass readiness after rescheduling |
| `affected_vmis[].vmi_rescheduling_time` | float | Seconds for VMI to be rescheduled |

#### `node_summary_infos`, `node_taints` (nested)

See [node_summary_infos](telemetry.md#node_summary_infos--one-entry-per-node-roletype-group) and [node_taints](telemetry.md#node_taints--one-entry-per-node-taint) in the telemetry reference — the fields are identical.

#### `health_checks` (nested)

Populated when [health checks](health-checks.md) are configured.

| Field | Type | Description |
|---|---|---|
| `url` | text | URL that was checked |
| `status` | bool | `true` = URL was reachable and returned a success code |
| `status_code` | text | HTTP status code returned |
| `start_timestamp` | date | When the health check window started |
| `end_timestamp` | date | When the health check window ended |
| `duration` | float | Total duration of the health check window in seconds |

#### `virt_checks` / `post_virt_checks` (nested)

Populated when virtual machine checks are enabled. `virt_checks` captures pre/during chaos state; `post_virt_checks` captures the post-chaos state.

| Field | Type | Description |
|---|---|---|
| `vm_name` | text | Name of the VirtualMachine |
| `namespace` | text | Namespace the VM belongs to |
| `ip_address` | text | IP address before the chaos event |
| `new_ip_address` | text | IP address after recovery (may differ if pod was rescheduled) |
| `node_name` | text | Node the VM was running on |
| `ssh_status` | bool | Whether SSH was reachable on the VM |
| `vmi_ready` | bool | Whether the VMI reached ready state |
| `status` | bool | Overall pass/fail for this VM check |
| `check_type` | keyword | Type of check performed |
| `start_timestamp` | date | When this check started |
| `end_timestamp` | date | When this check completed |
| `duration` | float | Duration of the check in seconds |

#### `error_logs` (nested)

Error-level log lines captured from the krkn run.

| Field | Type | Description |
|---|---|---|
| `timestamp` | text | Timestamp from the log line |
| `message` | text | Log message content |

#### `overall_resiliency_report` (nested)

Populated when [Resiliency Scoring](resiliency-score.md) is enabled.

| Field | Type | Description |
|---|---|---|
| `resiliency_score` | integer | Score from 0–100 representing system stability |
| `passed_slos` | integer | Number of SLOs that passed during the run |
| `total_slos` | integer | Total number of SLOs evaluated |
| `scenarios` | nested | Per-scenario resiliency breakdown |

---

### Metrics Index

One document per metric data point is written to `metrics_index`. Metrics are collected from Prometheus based on the queries in your `metrics_profile` file. Requires `performance_monitoring.enable_metrics: True`.

| Field | Type | Description |
|---|---|---|
| `run_uuid` | keyword | Run identifier — join with the telemetry index to get cluster context |
| `timestamp` | date | Timestamp of the metric sample |
| (dynamic) | varies | Each field from the Prometheus query result is stored directly as additional fields on the document (e.g. `metricName`, `value`, labels) |

Example document shape (varies by `metrics_profile` queries):

```json
{
  "run_uuid": "96348571-0b06-459e-b654-a1bb6fd66239",
  "timestamp": "2025-04-22T17:35:00Z",
  "metricName": "apiserverRequestRate",
  "value": 0.42
}
```

---

### Alerts Index

One document per firing alert is written to `alerts_index`. Alerts are collected from Prometheus based on your `alert_profile` file. Requires `performance_monitoring.enable_alerts: True`.

| Field | Type | Description |
|---|---|---|
| `run_uuid` | keyword | Run identifier — join with the telemetry index to get cluster context |
| `severity` | text | Alert severity label (e.g. `critical`, `warning`) |
| `alert` | text | Alert name and labels as a string |
| `created_at` | date | Timestamp when the alert was captured (ISO 8601) |

Example document:

```json
{
  "run_uuid": "96348571-0b06-459e-b654-a1bb6fd66239",
  "severity": "critical",
  "alert": "KubeNodeNotReady{node=\"worker-0\"}",
  "created_at": "2025-04-22T17:20:15Z"
}
```

---

### Querying across indices

All three indices share `run_uuid` as a common key, making it straightforward to correlate cluster state with metric behavior for a specific run:

```json
GET krkn-metrics/_search
{
  "query": {
    "match": { "run_uuid": "96348571-0b06-459e-b654-a1bb6fd66239" }
  }
}
```

To visualize stored data with pre-built dashboards wired to both Elasticsearch and Prometheus, see [krkn-visualize](../krkn-visualize.md).
