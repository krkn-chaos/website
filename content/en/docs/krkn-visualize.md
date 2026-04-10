---
title: krkn-visualize
description: Deployable grafana to help analyze cluster performance during chaos
weight: 6
---

## krkn-visualize

The [krkn-chaos/visualize](https://github.com/krkn-chaos/visualize) repository deploys a Grafana instance to your cluster pre-loaded with dashboards for monitoring chaos engineering runs. Dashboards pull from two datasources:

- **Prometheus** — cluster-level metrics (always available once Prometheus is installed)
- **Elasticsearch** — per-run chaos data indexed by run UUID (requires Elasticsearch and [krkn elastic enabled](krkn/config.md#elastic))

```bash
git clone https://github.com/krkn-chaos/visualize
cd visualize/krkn-visualize

# Kubernetes
./deploy.sh -e <elasticsearch_url> -p <grafana_password>

# OpenShift
./deploy.sh -e <elasticsearch_url> -p <grafana_password> -k oc
```

> **Note:** Prometheus must be installed before deploying dashboards. On Kubernetes, install it manually. On OpenShift, it is included by default. If you need Prometheus or Elasticsearch, see [these install commands](developers-guide/testing-changes.md#install-elasticsearch-and-prometheus).

### Deploy with krknctl

If you have [`krknctl`](krknctl/usage.md) installed, you can deploy the dashboards with a single command without cloning the repo — krknctl pulls and runs the `quay.io/krkn-chaos/krkn-visualize:latest` container image and wires up the datasources automatically:

```bash
krknctl visualize --grafana-password <secret> --es-url http://elasticsearch:9200

# OpenShift
krknctl visualize --grafana-password <secret> --es-url http://elasticsearch:9200 --kubectl oc

# With optional Prometheus datasource
krknctl visualize --grafana-password <secret> --es-url http://elasticsearch:9200 --prometheus-url http://prometheus:9090

# Tear down
krknctl visualize --delete
```

See the [krknctl visualize command reference](krknctl/usage.md#visualize-flags) for the full list of flags.

Additional dashboards can be imported after deployment:

```bash
cd visualize/krkn-visualize
./import.sh -i ../rendered/<folder>/<dashboard_name>.json
```

---

## Dashboards by Category

There are 23 dashboards organized into three categories. Use the **Chaos** dashboards to analyze a specific run by UUID (needs Elasticsearch connection); use the **General** and **K8s** dashboards to monitor overall cluster health before, during, and after a scenario (via promethues conncection)

---

### Chaos Dashboards

These dashboards filter by **run UUID** (from Elasticsearch) to show metrics specific to a single chaos run. Each includes a scenario details panel, UUID details, active alerts, and scenario-specific recovery or impact metrics.

| Dashboard | File | Key Panels | Use When Running |
|-----------|------|------------|-----------------|
| Pod Scenarios | `Chaos/pod-scenarios.json` | Pod recovery time, console health, etcd WAL latency, alerts | `pod-scenarios`, `application-outages` |
| Node Scenarios | `Chaos/node-scenarios.json` | Node ready/not-ready time, node running/stopped time | `node-scenarios` |
| Container Scenarios | `Chaos/container-scenarios.json` | Container recovery time, console health, etcd recovery | `container-scenarios` |
| Hog Scenarios | `Chaos/hog-scenarios.json` | CPU hog duration, memory hog duration, IO hog | `node-cpu-hog`, `node-memory-hog`, `node-io-hog` |
| Network Chaos Scenarios | `Chaos/network-chaos-scenarios.json` | Network latency introduced, packet loss rate | `network-chaos-ng` |
| Pod Network Scenarios | `Chaos/pod-network-scenarios.json` | Pod network latency, pod packet loss | `pod-network-chaos` |
| Zone Outage Scenarios | `Chaos/zone-outage-scenarios.json` | Zone recovery time, affected node count | `zone-outages` |
| Cluster Shut Down Scenarios | `Chaos/cluster-shut-down-scenarios.json` | Node running time, node stopped time | `cluster-shut-down` |
| Service Hijacking Scenarios | `Chaos/service-hijacking-scenarios.json` | Service hijacking metrics, service response time | `service-hijacking` |
| PVC Scenarios | `Chaos/pvc-scenarios.json` | PVC recovery time, attach/detach duration | `pvc-scenarios` |
| Time Scenarios | `Chaos/time-scenarios.json` | Clock skew duration, NTP recovery time | `time-scenarios` |
| SYN Flood Scenarios | `Chaos/syn-flood-scenarios.json` | Active connection count during flood, service recovery time | `syn-flood` |
| KubeVirt Disruption | `Chaos/kubevirt-disruption.json` | VM recovery time, OVN disruption impact, console health | `kubevirt-vm-outage` |
| Application Outage Scenarios | `Chaos/app-scenarios.json` | Console health/downtime duration, etcd latency, OVN master CPU | `application-outages` |

---

### General / OpenShift Dashboards

These dashboards show cluster-wide health and performance metrics from Prometheus. They are not filtered by run UUID — use them to see the broader cluster impact of any chaos scenario.

| Dashboard | File | Key Panels | Best Used For |
|-----------|------|------------|---------------|
| API Performance | `General/api-performance-overview.json` | Request duration (p99) by instance/resource, request rate, read vs write latency | Any scenario that may impact API server responsiveness |
| Etcd | `General/etcd-on-cluster-dashboard.json` | WAL fsync duration, backend commit duration, compact/defrag, network usage | Pod, node, cluster-shutdown scenarios; anything stressing etcd |
| Node Overview | `General/node-overview.json` | Total/ready nodes, master vs worker breakdown | Node scenarios, zone outages, cluster shutdowns |
| OCP Performance | `General/ocp-performance.json` | Cluster-at-a-glance, OVN stack, monitoring stack, kubelet | General health baseline; useful across all scenarios |
| OVN Monitoring | `General/ovn-dashboard.json` | OVN resource usage, latency, workqueue depth | Network chaos, pod network, zone outage, service hijacking |
| OpenShift Service Health | `General/service-health.json` | Services up/down, pods ready/not-ready | Any scenario affecting workload availability |
| KubeVirt Performance | `General/kubevirt-perf.json` | VMI phase status, CPU/memory/network metrics per VM | KubeVirt disruption scenarios |

---

### K8s Dashboards

These dashboards are for generic Kubernetes clusters (non-OpenShift). They provide performance and networking baselines.

| Dashboard | File | Key Panels | Best Used For |
|-----------|------|------------|---------------|
| K8s Performance | `k8s/k8s-perf.json` | Cluster details, per-node resource usage | General health baseline on vanilla Kubernetes |
| Networking | `k8s/networking-dashboard.json` | Received/transmit packets, bandwidth, dropped packets | Network chaos, SYN flood, pod network scenarios |

---

## Viewing Dashboards Per Scenario

### Step 1 — Identify your scenario type

Use the table above to find the matching **Chaos** dashboard for your scenario. For example, if you ran `node-cpu-hog`, open the **Hog Scenarios** dashboard.

### Step 2 — Filter by UUID

Each Chaos dashboard has a **UUID** variable at the top. Paste your run UUID (printed in krkn logs, or visible in the Krkn Dashboard Metrics page) to filter all panels to that specific run.

### Step 3 — Cross-reference with cluster dashboards

While viewing your scenario-specific results, open a second tab with a General or K8s dashboard to correlate:

- **Etcd** — check if etcd latency spiked during your run window
- **API Performance** — check if API request duration increased
- **KubeVirt Performance** — watch VMI's on your cluster
- **Node Overview** / **OCP Performance** — check cluster-wide health impact
- **OVN Monitoring** — check networking stack for latency increases

### Step 4 — Time range alignment

Set the Grafana time range to match your run's start/end time. The Chaos dashboards show per-UUID events; the General dashboards show time-series metrics for the same window.

---

## Editing and Adding Dashboards

Dashboards can be edited in the Grafana UI (log in as the admin user). Source dashboards are Jsonnet templates in the `assets/` directory of the visualize repo and can be rebuilt with `make`.

To add a new dashboard, see the [Adding a new dashboard](https://github.com/krkn-chaos/visualize?tab=readme-ov-file#adding-a-new-dashboard) guide.
