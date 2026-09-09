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

Parameters found in the source that no section above covers.

{{< param-table scenario="globals" source="krkn-hub" group="triggers" >}}
