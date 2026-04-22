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

Parameter | Description | Default
--- | --- | ---
`PUBLISH_KRAKEN_STATUS` | Publish kraken status to the signal address | True
`SIGNAL_ADDRESS` | Address to publish kraken status to | 0.0.0.0
`PORT` | Port to publish kraken status to | 8081
`SIGNAL_STATE` | Waits for the RUN signal when set to PAUSE before running the scenarios, refer [docs](../krkn/signal.md) for more details | RUN

---

## Cerberus

Cluster health monitoring integration. See [Cerberus config](../krkn/config.md#cerberus) for full details.

Parameter | Description | Default
--- | --- | ---
`CERBERUS_ENABLED` | Set this to true if cerberus is running and monitoring the cluster | False
`CERBERUS_URL` | URL to poll for the go/no-go signal | http://0.0.0.0:8080

---

## Performance Monitoring

Prometheus metrics collection and alert evaluation. See [Performance Monitoring config](../krkn/config.md#performance-monitoring) for full details.

Parameter | Description | Default
--- | --- | ---
`DEPLOY_DASHBOARDS` | Deploys mutable grafana loaded with dashboards visualizing performance metrics pulled from in-cluster prometheus. The dashboard will be exposed as a route. | False
`CAPTURE_METRICS` | Captures metrics as specified in the profile from in-cluster prometheus. Default metrics captures are listed [here](https://github.com/krkn-chaos/krkn/blob/master/config/metrics-aggregated.yaml) | False
`ENABLE_ALERTS` | Evaluates expressions from in-cluster prometheus and exits 0 or 1 based on the severity set. [Default profile](https://github.com/krkn-chaos/krkn/blob/master/config/alerts.yaml). | False
`ALERTS_PATH` | Path to the alerts file to use when ENABLE_ALERTS is set | config/alerts
`CHECK_CRITICAL_ALERTS` | When enabled will check prometheus for critical alerts firing post chaos | False

---

## Resiliency Score

Resiliency scoring configuration. See [Resiliency Score config](../krkn/config.md#resiliency-score) for full details.

Parameter | Description | Default
--- | --- | ---
`RESILIENCY_RUN_MODE` | Resiliency scoring mode: `standalone` embeds score in telemetry, `detailed` prints JSON report to stdout, `disabled` turns off scoring | standalone
`RESILIENCY_FILE` | Path to a YAML file containing SLO definitions; defaults to the alerts profile or `config/alerts.yaml` | config/alerts.yaml

---

## Elastic

Elasticsearch storage for telemetry and metrics. See [Elastic config](../krkn/config.md#elastic) for full details.

Parameter | Description | Default
--- | --- | ---
`ELASTIC_SERVER` | URL of the Elasticsearch instance to store telemetry data | _blank_
`ELASTIC_INDEX` | Elasticsearch index pattern to post results to | _blank_

---

## Tunings

Execution timing and iteration controls. See [Tunings config](../krkn/config.md#tunings) for full details.

Parameter | Description | Default
--- | --- | ---
`WAIT_DURATION` | Duration in seconds to wait between each chaos scenario | 60
`ITERATIONS` | Number of times to execute the scenarios | 1
`DAEMON_MODE` | Iterations are set to infinity which means that the kraken will cause chaos forever | False

---

## Telemetry

Run data collection and upload settings. See [Telemetry config](../krkn/config.md#telemetry) for full details.

Parameter | Description | Default
--- | --- | ---
`TELEMETRY_ENABLED` | Enable/disables the telemetry collection feature | False
`TELEMETRY_API_URL` | Telemetry service endpoint | https://ulnmf9xv7j.execute-api.us-west-2.amazonaws.com/production
`TELEMETRY_USERNAME` | Telemetry service username | redhat-chaos
`TELEMETRY_PASSWORD` | Telemetry service password | No default
`TELEMETRY_PROMETHEUS_BACKUP` | Enables/disables prometheus data collection | True
`TELEMTRY_FULL_PROMETHEUS_BACKUP` | If set to False only the /prometheus/wal folder will be downloaded | False
`TELEMETRY_BACKUP_THREADS` | Number of telemetry download/upload threads | 5
`TELEMETRY_ARCHIVE_PATH` | Local path where the archive files will be temporarily stored | /tmp
`TELEMETRY_MAX_RETRIES` | Maximum number of upload retries (if 0 will retry forever) | 0
`TELEMETRY_RUN_TAG` | If set, this will be appended to the run folder in the bucket (useful to group the runs) | chaos
`TELEMETRY_GROUP` | If set will archive the telemetry in the S3 bucket on a folder named after the value | default
`TELEMETRY_ARCHIVE_SIZE` | The size of the prometheus data archive in KB | 1000
`TELEMETRY_LOGS_BACKUP` | Logs backup to S3 | False
`TELEMETRY_FILTER_PATTER` | Filter logs based on certain timestamp patterns | `["(\\w{3}\\s\\d{1,2}\\s\\d{2}:\\d{2}:\\d{2}\\.\\d+).+", ...]`
`TELEMETRY_CLI_PATH` | OC CLI path, if not specified will be searched in $PATH | _blank_

{{% alert title="Note" %}} For setting the `TELEMETRY_ARCHIVE_SIZE`, the lower the value the higher the number of archive files produced and uploaded (processed by `TELEMETRY_BACKUP_THREADS` simultaneously). For unstable or slow connections, keep this value low and increase `TELEMETRY_BACKUP_THREADS` so that on upload failure only the failed chunk is retried. {{% /alert %}}

---

## Health Checks

Application endpoint monitoring during chaos. See [Health Checks config](../krkn/config.md#health-checks) for full details.

Parameter | Description | Default
--- | --- | ---
`HEALTH_CHECK_URL` | URL to continually check and detect downtimes | _blank_
`HEALTH_CHECK_INTERVAL` | Interval in seconds at which to run health checks | 2
`HEALTH_CHECK_BEARER_TOKEN` | Bearer token used for authenticating into health check URL | _blank_
`HEALTH_CHECK_AUTH` | Tuple of (username, password) used for authenticating into health check URL | _blank_
`HEALTH_CHECK_EXIT_ON_FAILURE` | If True, exits when health check fails for application | _blank_
`HEALTH_CHECK_VERIFY` | Health check URL SSL validation | False

---

## Virt Checks

KubeVirt VMI SSH connection monitoring during chaos. See [Virt Checks config](../krkn/config.md#virt-checks) for full details.

Parameter | Description | Default
--- | --- | ---
`KUBE_VIRT_CHECK_INTERVAL` | Interval in seconds at which to test kubevirt connections | 2
`KUBE_VIRT_NAMESPACE` | Namespace to find VMIs in and watch | _blank_
`KUBE_VIRT_NAME` | Regex style name to match VMIs to watch | _blank_
`KUBE_VIRT_FAILURES` | If True, will only report when ssh connections fail to VMI | _blank_
`KUBE_VIRT_DISCONNECTED` | Use disconnected check by passing cluster API | False
`KUBE_VIRT_NODE_NAME` | If set, will filter VMs to only track ones running on the specified node | _blank_
`KUBE_VIRT_EXIT_ON_FAIL` | Fails run if VMs still have false status at end of run | False
`KUBE_VIRT_SSH_NODE` | If set, will be a backup way to SSH to a node. Should be a node not targeted in chaos | _blank_
