---
title: Krkn-Hub All Scenarios Variables
description: >
date: 2017-01-05
weight: 1
---
These variables are to be used for the top level configuration template that are shared by all the scenarios in Krkn-hub.

Each section below corresponds to a section in the [Krkn config reference](../krkn/config.md). Set variables on the host running the container:

```bash
export <parameter_name>=<value>
```

---

## Kraken

Signal and status publishing settings. See [Kraken config](../krkn/config.md#kraken) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="kraken" >}}

---

## Cerberus

Cluster health monitoring integration. See [Cerberus config](../krkn/config.md#cerberus) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="cerberus" >}}

---

## Performance Monitoring

Prometheus metrics collection and alert evaluation. See [Performance Monitoring config](../krkn/config.md#performance-monitoring) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="performance_monitoring" >}}

---

## Resiliency Score

Resiliency scoring configuration. See [Resiliency Score config](../krkn/config.md#resiliency-score) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="resiliency_score" >}}

---

## Elastic

Elasticsearch storage for telemetry and metrics. See [Elastic config](../krkn/config.md#elastic) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="elastic" >}}

---

## Tunings

Execution timing and iteration controls. See [Tunings config](../krkn/config.md#tunings) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="tunings" >}}

---

## Telemetry

Run data collection and upload settings. See [Telemetry config](../krkn/config.md#telemetry) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="telemetry" >}}

{{% alert title="Note" %}} For setting the `TELEMETRY_ARCHIVE_SIZE`, the lower the value the higher the number of archive files produced and uploaded (processed by `TELEMETRY_BACKUP_THREADS` simultaneously). For unstable or slow connections, keep this value low and increase `TELEMETRY_BACKUP_THREADS` so that on upload failure only the failed chunk is retried. {{% /alert %}}

---

## Health Checks

Application endpoint monitoring during chaos. See [Health Checks config](../krkn/config.md#health-checks) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="health_checks" >}}

---

## Virt Checks

KubeVirt VMI SSH connection monitoring during chaos. See [Virt Checks config](../krkn/config.md#virt-checks) for full details.

{{< param-table scenario="globals" source="krkn-hub" group="virt_checks" >}}

---

## Other

Parameters found in the source that no section above covers.

{{< param-table scenario="globals" source="krkn-hub" group="other" >}}

---

## Triggers

Configure the conditions that must be met before chaos starts. The `TRIGGERS_*` variables control how conditions are combined, polled, and handled when they time out. Configure the condition itself with the variables for its trigger type.

{{< param-table scenario="globals" source="krkn-hub" group="triggers" name_prefix="TRIGGERS_" >}}

### Command trigger

Run a shell command and wait for its expected exit code.

{{< param-table scenario="globals" source="krkn-hub" group="triggers" name_prefix="TRIGGER_COMMAND" >}}

{{< param-table scenario="globals" source="krkn-hub" group="triggers" name_prefix="TRIGGER_EXPECTED_RC" >}}

### HTTP trigger

Poll an HTTP endpoint until it meets the configured status and optional response-body condition.

{{< param-table scenario="globals" source="krkn-hub" group="triggers" name_prefix="TRIGGER_HTTP_" >}}

### Kubernetes trigger

Wait for a Kubernetes resource field to match a condition.

{{< param-table scenario="globals" source="krkn-hub" group="triggers" name_prefix="TRIGGER_K8S_" >}}

### Prometheus trigger

Run a PromQL query and wait for it to return a result. Set the Prometheus URL and, when needed, its bearer token.

{{< param-table scenario="globals" source="krkn-hub" group="triggers" name_prefix="TRIGGER_PROM_" >}}

---

## Object State Checks

Parameters found in the source that no section above covers.

{{< param-table scenario="globals" source="krkn-hub" group="object_state_checks" >}}
