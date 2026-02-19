---
title: Krknctl All Scenarios Variables
description :  >
date : 2017-01-05
weight : 1
---

These variables are to be used for the top level configuration template that are shared by all the scenarios in Krknctl

See the description and default values below 

#### Supported parameters for all scenarios in KrknCtl

The following environment variables can be set on the host running the container to tweak the scenario/faults being injected:

**Usage example:**
`--<parameter> <value>`

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

<div class="wide-params-table">

| Parameter | Description | Type | Possible Values | Default |
|-----------|-------------|------|-----------------|---------|
| --cerberus-enabled | Enables Cerberus Support | enum | True/False | False |
| --cerberus-url | Cerberus http url | string | - | http://0.0.0.0:8080 |
| --distribution | Selects the orchestrator distribution | enum | openshift/kubernetes | openshift |
| --krkn-kubeconfig | Sets the path where krkn will search for kubeconfig in container | string | - | /home/krkn/.kube/config |
| --wait-duration | Waits for a certain amount of time after the scenario | number | - | 1 |
| --iterations | Number of times the same chaos scenario will be executed | number | - | 1 |
| --daemon-mode | If set the scenario will execute forever | enum | True/False | False |
| --uuid | Sets krkn run uuid instead of generating it | string | - | - |
| --capture-metrics | Enables metrics capture | enum | True/False | False |
| --enable-alerts | Enables cluster alerts check | enum | True/False | False |
| --alerts-path | Allows to specify a different alert file path | string | - | config/alerts.yaml |
| --metrics-path | Allows to specify a different metrics file path | string | - | config/metrics-aggregated.yaml |
| --enable-es | Enables elastic search data collection | enum | True/False | False |
| --es-server | Elasticsearch instance URL | string | - | http://0.0.0.0 |
| --es-port | Elasticsearch instance port | number | - | 443 |
| --es-username | Elasticsearch instance username | string | - | elastic |
| --es-password | Elasticsearch instance password | string | - | - |
| --es-verify-certs | Enables elasticsearch TLS certificate verification | enum | True/False | False |
| --es-metrics-index | Index name for metrics in Elasticsearch | string | - | krkn-metrics |
| --es-alerts-index | Index name for alerts in Elasticsearch | string | - | krkn-alerts |
| --es-telemetry-index | Index name for telemetry in Elasticsearch | string | - | krkn-telemetry |
| --check-critical-alerts | Enables checking for critical alerts | enum | True/False | False |
| --telemetry-enabled | Enables telemetry support | enum | True/False | False |
| --telemetry-api-url | API endpoint for telemetry data | string | - | https://ulnmf9xv7j.execute-api.us-west-2.amazonaws.com/production |
| --telemetry-username | Username for telemetry authentication | string | - | redhat-chaos |
| --telemetry-password | Password for telemetry authentication | string | - | - |
| --telemetry-prometheus-backup | Enables Prometheus backup for telemetry | enum | True/False | True |
| --telemetry-full-prometheus-backup | Enables full Prometheus backup for telemetry | enum | True/False | False |
| --telemetry-backup-threads | Number of threads for telemetry backup | number | - | 5 |
| --telemetry-archive-path | Path to save telemetry archive | string | - | /tmp |
| --telemetry-max-retries | Maximum retries for telemetry operations | number | - | 0 |
| --telemetry-run-tag | Tag for telemetry run | string | - | chaos |
| --telemetry-group | Group name for telemetry data | string | - | default |
| --telemetry-archive-size | Maximum size for telemetry archives | number | - | 1000 |
| --telemetry-logs-backup | Enables logs backup for telemetry | enum | True/False | False |
| --telemetry-filter-pattern | Filter pattern for telemetry logs | string | - | ["\\w{3}\\s\\d{1,2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d+", "kinit (\\d+/\\d+/\\d+\\s\\d{2}:\\d{2}:\\d{2}", "\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}\\.\\d+Z"] |
| --telemetry-cli-path | Path to telemetry CLI tool (oc) | string | - | - |
| --telemetry-events-backup | Enables events backup for telemetry | enum | True/False | True |
| --health-check-interval | How often to check the health check urls (seconds) | number | - | 2 |
| --health-check-url | URL to check the health of | string | - | - |
| --health-check-auth | Authentication tuple to authenticate into health check URL | string | - | - |
| --health-check-bearer-token | Bearer token to authenticate into health check URL | string | - | - |
| --health-check-exit | Exit on failure when health check URL is not able to connect | string | - | - |
| --health-check-verify | SSL Verification to authenticate into health check URL | string | - | false |
| --kubevirt-check-interval | How often to check the KubeVirt VMs SSH status (seconds) | number | - | 2 |
| --kubevirt-namespace | KubeVirt namespace to check the health of | string | - | - |
| --kubevirt-name | KubeVirt regex names to watch | string | - | - |
| --kubevirt-only-failures | KubeVirt checks only report if failure occurs | enum | True/False | false |
| --kubevirt-disconnected | KubeVirt checks in disconnected mode, bypassing the cluster's API | enum | True/False | false |
| --kubevirt-ssh-node | KubeVirt backup node to SSH into when checking VMI IP address status | string | - | false |
| --kubevirt-exit-on-failure | KubeVirt fails run if VMs still have false status | enum | True/False | false |
| --kubevirt-node-node | Only track VMs in KubeVirt on given node name | string | - | false |
| --krkn-debug | Enables debug mode for Krkn | enum | True/False | False |

</div> 

{{% alert title="Note" %}} For setting the TELEMETRY_ARCHIVE_SIZE,the higher the number of archive files will be produced and uploaded (and processed by backup_thread simultaneously| .For unstable/slow connection is better to keep this value low increasing the number of backup_threads, in this way, on upload failure, the retry will happen only on the failed chunk without affecting the whole upload.{{% /alert %}}