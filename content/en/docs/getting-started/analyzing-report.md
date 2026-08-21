---
title: Analyzing the Kraken Report
description: How to read and interpret the kraken.report log and resiliency-report.json output
weight: 5
categories: [Best Practices]
tags: [docs]
---

After a Krkn run completes, two output files are generated:

- **`kraken.report`** — full execution log with timestamps
- **`resiliency-report.json`** — scored SLO breakdown per scenario

## kraken.report Structure

### Startup & Initialization

The top of the log confirms the run identity and target cluster:

```
[INFO] Starting kraken
[INFO] Generated a uuid for the run: <uuid>
[INFO] Detected distribution openshift
[INFO] <version>
[INFO] Server URL: https://api.<cluster>.openshift.com:6443
```

| Field | What to check |
|---|---|
| **UUID** | Unique run ID — correlates with `/tmp/<timestamp>-<uuid>/` rollback archives |
| **Distribution** | Confirms `openshift` vs. vanilla Kubernetes auto-detection |
| **Cluster version** | Verify the target cluster is what you expected |

---

### Scenario Execution

Each scenario plugin follows the same general log structure: announce the plugin and scenario file, log resolved input parameters, execute the fault, wait for the configured duration, then clean up.

```
[INFO] Running <ScenarioType>ScenarioPlugin -> scenarios/<scenario>.yaml
[INFO] Set rollback_context: <timestamp>-<uuid> for scenario_type: <type> RollbackHandler
[INFO] Input params:
<param_name>: '<value>'
<param_name>: '<value>'
...
[INFO] <Fault injection action, e.g. node stopped / pod killed / disk filled>
[INFO] Waiting for the specified duration in the config: <duration>
[INFO] Finish waiting
[INFO] <Cleanup action, e.g. node restarted / pod recovered / temp file removed>
[INFO] Cleaning up rollback version files for run_uuid=<uuid>
```

Key things to verify:

- **Plugin and scenario file** — confirms which plugin ran and which scenario config it used
- **Rollback context** — presence of the `RollbackHandler` line means a cleanup handler was registered; if the run is interrupted, Krkn can roll back from the serialized callable in `/tmp/<timestamp>-<uuid>/`
- **Input params** — verify the scenario targeted the correct namespace, resource name, label selector, or node, and that intensity values (duration, count, percentage) match your intent
- **Fault injection log** — scenario-specific lines confirm the fault was actually applied (e.g., a node was stopped, a pod was deleted, a network rule was added)
- **Cleanup log** — confirms the fault was reversed after the wait period; a missing cleanup line may indicate the scenario exited early
- **Rollback file removal** — `Cleaning up rollback version files` at the end confirms the scenario completed its full lifecycle

---

### SLO Evaluation

At the end of each scenario, Krkn evaluates Service Level Objectives (SLOs) over the chaos window:

```
[INFO] Evaluating 29 SLOs over window 2026-04-13 13:04:37 – 2026-04-13 13:04:43
[INFO] Resiliency report written: resiliency-report.json
```

The window is the time span from scenario start to finish. All Prometheus-based alerts are evaluated against this window.

---

### Job Status

The final lines confirm whether the run succeeded:

```
[INFO] Successfully finished running Kraken. UUID for the run: f45ae736-...
```

The telemetry block at the end of the log includes `"job_status": true` (pass) or `false` (fail). A `false` means a scenario errored or an SLO threshold was breached.

---

## resiliency-report.json Structure

This file contains the scored output for each scenario.

```json
{
  "scenarios": [
    {
      "name": "scenarios/<scenario>.yaml",
      "window": {
        "start": "2026-04-13T13:04:37",
        "end": "2026-04-13T13:04:43"
      },
      "score": 100,
      "breakdown": {
        "total_points": 45,
        "points_lost": 0,
        "passed": 27,
        "failed": 0
      },
      "slo_results": { ... }
    }
  ]
}
```

| Field | Meaning |
|---|---|
| `score` | Resiliency percentage (100 = all SLOs passed) |
| `passed` | Number of SLOs that did not fire during chaos |
| `failed` | Number of SLOs that fired (degradation detected) |
| `points_lost` | Weighted penalty from failed SLOs |

---

## SLO Categories

Each SLO result is `true` (passed) or `false` (fired during chaos). SLOs are grouped by component:

### etcd Health
Monitors the stability of the cluster's backing store during chaos:

- 99th percentile fsync and commit latency (10ms, 30ms, 1s thresholds)
- Leader changes
- Database fullness and storage efficiency
- Proposal failures, slow member communication, slow gRPC requests
- High failed gRPC request rate
- No leader / insufficient members / members down

### API Server
Monitors control plane responsiveness:

- 99th percentile mutating call latency > 1s
- 99th percentile read-only call latency > 1s, 5s, or 30s (by scope)

### Node & Pod Availability
- Node or pod targets reporting as down

### Resource Spikes
Detects significant CPU or memory increases (relative to baseline) on:

- etcd
- OpenShift API server
- Master nodes

### Network
- Kubeproxy network programming latency > 10s

---

## Common Warnings

| Warning | Meaning |
|---|---|
| `Directory ... does not match expected pattern` | Leftover files in `/tmp` from prior runs — benign |
| `failed to parse virtualmachines API` | KubeVirt is not installed on the cluster — expected on non-virt environments |
| `Cerberus status is healthy but post action scenarios are still failing` | Cerberus health check passed, but a scenario-level check failed — investigate the specific scenario output |
| `No error logs collected during chaos run` | No container error logs were detected — indicates a clean run |

---

## Interpreting a Failing Run

If `job_status` is `false` or `score` is below 100, check the following:

1. **Which SLOs failed** — look for `false` values in `slo_results` in `resiliency-report.json`
2. **The chaos window** — compare the SLO failure time against the scenario start/end in the log
3. **Affected pods/nodes** — check `affected_pods.unrecovered` and `affected_nodes` in the telemetry block
4. **Cluster events** — the log references an `events.json` file in the telemetry archive for detailed Kubernetes events during chaos
5. **Error logs** — if `error_logs` in the telemetry is non-empty, containers logged errors during the run
