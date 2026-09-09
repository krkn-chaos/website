---
title: Krknctl All Scenarios Variables
description :  >
date : 2017-01-05
weight : 1
---

These variables are to be used for the top level configuration template that are shared by all the scenarios in Krknctl.

Each section below corresponds to a section in the [Krkn config reference](../krkn/config.md). Pass flags when running a scenario:

```bash
krknctl run <scenario> --<parameter> <value>
```

<style>
.wide-params-table table {
  width: 100%;
  table-layout: fixed;
}
.wide-params-table th,
.wide-params-table td {
  padding: 12px 16px;
  vertical-align: top;
  word-wrap: break-word;
  word-break: break-word;
  overflow-wrap: break-word;
}
.wide-params-table th:nth-child(1),
.wide-params-table td:nth-child(1) {
  width: 18%;
}
.wide-params-table th:nth-child(2),
.wide-params-table td:nth-child(2) {
  width: 28%;
}
.wide-params-table th:nth-child(3),
.wide-params-table td:nth-child(3) {
  width: 10%;
}
.wide-params-table th:nth-child(4),
.wide-params-table td:nth-child(4) {
  width: 14%;
}
.wide-params-table th:nth-child(5),
.wide-params-table td:nth-child(5) {
  width: 30%;
}
</style>

---

## Kraken

General run settings. See [Kraken config](../krkn/config.md#kraken) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="kraken" prefix="--" >}}

</div>

---

## Cerberus

Cluster health monitoring integration. See [Cerberus config](../krkn/config.md#cerberus) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="cerberus" prefix="--" >}}

</div>

---

## Performance Monitoring

Prometheus metrics collection and alert evaluation. See [Performance Monitoring config](../krkn/config.md#performance-monitoring) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="prometheus" prefix="--" >}}

</div>

---

## Resiliency Score

Resiliency scoring configuration. See [Resiliency Score config](../krkn/config.md#resiliency-score) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="resiliency" prefix="--" >}}

</div>

---

## Elastic

Elasticsearch storage for telemetry and metrics. See [Elastic config](../krkn/config.md#elastic) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="elasticsearch" prefix="--" >}}

</div>

---

## Tunings

Execution timing and iteration controls. See [Tunings config](../krkn/config.md#tunings) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="tunings" prefix="--" >}}

</div>

---

## Telemetry

Run data collection and upload settings. See [Telemetry config](../krkn/config.md#telemetry) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="telemetry" prefix="--" >}}

</div>

{{% alert title="Note" %}} For `--telemetry-archive-size`, the lower the value the higher the number of archive files produced and uploaded (processed by `--telemetry-backup-threads` simultaneously). For unstable or slow connections, keep this value low and increase `--telemetry-backup-threads` so that on upload failure only the failed chunk is retried. {{% /alert %}}

---

## Health Checks

Application endpoint monitoring during chaos. See [Health Checks config](../krkn/config.md#health-checks) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="health_check" prefix="--" >}}

</div>

---

## Virt Checks

KubeVirt VMI SSH connection monitoring during chaos. See [Virt Checks config](../krkn/config.md#virt-checks) for full details.

<div class="wide-params-table">

{{< param-table scenario="globals" source="krknctl" group="kubevirt" prefix="--" >}}

</div>

---

## General

Parameters found in the source that no section above covers.

{{< param-table scenario="globals" source="krknctl" group="general" prefix="--" >}}

---

## Triggers

Parameters found in the source that no section above covers.

{{< param-table scenario="globals" source="krknctl" group="triggers" prefix="--" >}}
