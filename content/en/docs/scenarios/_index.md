---
type: "docs/scenarios"
title: Scenarios
description: Krkn scenario list
date: 2017-01-04
weight: 4
---

{{% alert title="Tip" %}}
Many pod scenarios now support the `exclude_label` parameter to protect critical pods while testing others. See individual scenario pages ([Pod Failures](pod-scenario/_index.md), [Pod Network Chaos](pod-network-scenario/_index.md)) for details.
{{% /alert %}}

## Supported Chaos Scenarios

<style>
.scenario-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
}

.scenario-card {
    border: 1px solid var(--krkn-border-subtle);
    border-radius: 0.75rem;
    padding: 0;
    background: var(--krkn-surface);
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    min-height: 200px;
    overflow: hidden;
}

.scenario-card:hover {
    box-shadow: 0 4px 16px var(--krkn-shadow);
    border-color: var(--krkn-primary);
    transform: translateY(-2px);
}

/* Make entire card clickable via the h3 a */
.scenario-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
}

.scenario-card h3 a {
    display: block;
    padding: 1.5rem 1.5rem 0;
    color: var(--krkn-text) !important;
    text-decoration: none !important;
    font-family: 'Satoshi', sans-serif;
    font-weight: 600;
}

.scenario-card h3 a:hover {
    color: var(--krkn-primary) !important;
}

/* Make whole card a click target */
.scenario-card { position: relative; }
.scenario-card h3 a::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 1;
}

.scenario-badge {
    display: inline-block;
    font-size: 0.7rem;
    padding: 0.2rem 0.625rem;
    background: var(--krkn-elevated);
    color: var(--krkn-text-muted);
    border: 1px solid var(--krkn-border-subtle);
    border-radius: 9999px;
    margin: 0.5rem 1.5rem 0.5rem;
    font-family: 'SF Mono', SFMono-Regular, ui-monospace, monospace;
}

.cloud-badges {
    display: flex;
    gap: 0.375rem;
    flex-wrap: wrap;
    margin: 0 1.5rem 1.25rem;
    position: relative;
    z-index: 2;
}

.cloud-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.65rem;
    padding: 0.15rem 0.45rem;
    background: rgba(236, 28, 36, 0.06);
    color: var(--krkn-primary);
    border: 1px solid rgba(236, 28, 36, 0.2);
    border-radius: 4px;
    font-weight: 600;
    font-family: 'SF Mono', monospace;
}

.cloud-badge--agnostic {
    background: rgba(14, 88, 160, 0.08);
    color: var(--krkn-secondary-light);
    border-color: rgba(14, 88, 160, 0.2);
}

.scenario-description {
    color: var(--krkn-text-muted);
    font-size: 0.875rem;
    line-height: 1.6;
    flex-grow: 1;
    padding: 0.25rem 1.5rem 0.5rem;
    margin: 0;
}

.category-header {
    margin-top: 3.5rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--krkn-primary);
    color: var(--krkn-text);
}

.scenario-category:first-of-type .category-header {
    margin-top: 2rem;
}
</style>

<div class="krkn-scenario-filter" id="krkn-scenario-filter">
<div class="krkn-scenario-filter__row">
<span class="krkn-scenario-filter__label">Category</span>
<div class="krkn-scenario-filter__pills" role="group" aria-label="Filter by category">
<button class="krkn-scenario-filter__btn krkn-scenario-filter__btn--active" data-filter="all" type="button" aria-pressed="true">All</button>
<button class="krkn-scenario-filter__btn" data-filter="pod-container" type="button" aria-pressed="false">Pod &amp; Container</button>
<button class="krkn-scenario-filter__btn" data-filter="node-cluster" type="button" aria-pressed="false">Node &amp; Cluster</button>
<button class="krkn-scenario-filter__btn" data-filter="network" type="button" aria-pressed="false">Network</button>
<button class="krkn-scenario-filter__btn" data-filter="application-service" type="button" aria-pressed="false">Application &amp; Service</button>
<button class="krkn-scenario-filter__btn" data-filter="storage-data" type="button" aria-pressed="false">Storage &amp; Data</button>
<button class="krkn-scenario-filter__btn" data-filter="system-time" type="button" aria-pressed="false">System &amp; Time</button>
</div>
</div>
<div class="krkn-scenario-filter__row krkn-scenario-filter__row--search">
<label class="krkn-scenario-filter__label" for="krkn-scenario-filter-search">Search</label>
<input class="krkn-scenario-filter__search" id="krkn-scenario-filter-search" type="search" placeholder="Search scenarios..." autocomplete="off" />
<button class="krkn-scenario-filter__reset" id="krkn-scenario-filter-reset" type="button">Reset</button>
</div>
<div class="krkn-scenario-filter__empty" id="krkn-scenario-filter-empty" hidden>No scenarios match your filters.</div>
</div>

<section class="krkn-scenario-category" data-category="pod-container">
<h3 class="category-header">Pod &amp; Container Disruptions</h3>

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="pod-scenario/">Pod Failures</a></h3>
<span class="scenario-badge">pod_disruption_scenarios</span>
<p class="scenario-description">Injects pod failures to test application resilience and recovery mechanisms</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="pod-path-provisioner/">Pod Path Provisioner</a></h3>
<span class="scenario-badge">pod_disruption_scenarios</span>
<p class="scenario-description">Test kind cluster storage resilience by terminating the local-path-provisioner pod</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="container-scenario/">Container Failures</a></h3>
<span class="scenario-badge">container_scenarios</span>
<p class="scenario-description">Injects container failures based on the provided kill signal</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="kubevirt-vm-outage-scenario/">KubeVirt VM Outage</a></h3>
<span class="scenario-badge">kubevirt_vm_outage</span>
<p class="scenario-description">Simulates VM-level disruptions by deleting Virtual Machine Instances to test resilience and recovery</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

</div>
</section>

<section class="krkn-scenario-category" data-category="node-cluster">
<h3 class="category-header">Node &amp; Cluster Failures</h3>

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="node-scenarios/">Node Failures</a></h3>
<span class="scenario-badge">node_scenarios</span>
<p class="scenario-description">Injects node failures through OpenShift/Kubernetes and cloud APIs</p>
<div class="cloud-badges">
<span class="cloud-badge">Alibaba</span>
<span class="cloud-badge">AWS</span>
<span class="cloud-badge">Azure</span>
<span class="cloud-badge">BareMetal</span>
<span class="cloud-badge">Docker/Podman (kind)</span>
<span class="cloud-badge">IBM Cloud</span>
<span class="cloud-badge">IBM Power</span>
<span class="cloud-badge">GCP</span>
<span class="cloud-badge">OpenStack</span>
<span class="cloud-badge">VMWare</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="power-outage-scenarios/">Power Outages</a></h3>
<span class="scenario-badge">cluster_shut_down_scenarios</span>
<p class="scenario-description">Shuts down the cluster for a specified duration and verifies cluster health upon restart</p>
<div class="cloud-badges">
<span class="cloud-badge">Alibaba</span>
<span class="cloud-badge">AWS</span>
<span class="cloud-badge">Azure</span>
<span class="cloud-badge">BareMetal</span>
<span class="cloud-badge">Docker/Podman (kind)</span>
<span class="cloud-badge">IBM Cloud</span>
<span class="cloud-badge">IBM Power</span>
<span class="cloud-badge">GCP</span>
<span class="cloud-badge">OpenStack</span>
<span class="cloud-badge">VMWare</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="zone-outage-scenarios/">Zone Outages</a></h3>
<span class="scenario-badge">zone_outages_scenarios</span>
<p class="scenario-description">Creates zone outages to observe impact on cluster availability and application resilience</p>
<div class="cloud-badges">
<span class="cloud-badge">AWS</span>
<span class="cloud-badge">GCP</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="hog-scenarios/cpu-hog-scenario/">Node CPU Hog</a></h3>
<span class="scenario-badge">hog_scenarios</span>
<p class="scenario-description">Hogs CPU resources on targeted nodes to test resource contention</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="hog-scenarios/memory-hog-scenario/">Node Memory Hog</a></h3>
<span class="scenario-badge">hog_scenarios</span>
<p class="scenario-description">Hogs memory resources on targeted nodes to test memory pressure handling</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="hog-scenarios/io-hog-scenario/">Node IO Hog</a></h3>
<span class="scenario-badge">hog_scenarios</span>
<p class="scenario-description">Hogs IO resources on targeted nodes to test disk performance degradation</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>


</div>
</section>

<section class="krkn-scenario-category" data-category="network">
<h3 class="category-header">Network Disruptions</h3>

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="network-chaos-scenario/">Network Chaos</a></h3>
<span class="scenario-badge">network_chaos_scenarios</span>
<p class="scenario-description">Introduces network latency, packet loss, and bandwidth restriction using tc and Netem</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="pod-network-scenario/">Pod Network Chaos</a></h3>
<span class="scenario-badge">pod_network_scenarios</span>
<p class="scenario-description">Introduces network chaos at pod level including latency, packet loss, and bandwidth restriction</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="network-chaos-ng-scenarios/">Network Chaos NG</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Next-generation network filtering scenarios with improved infrastructure</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="dns-outage/">DNS Outages</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Blocks all outgoing DNS traffic from pods, preventing hostname resolution</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="etcd-split-brain/">ETCD Split Brain</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Isolates etcd nodes to force leader re-election and test cluster resilience</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="aurora-disruption/">Aurora Disruption</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Blocks MySQL and PostgreSQL traffic to AWS Aurora database engines</p>
<div class="cloud-badges">
<span class="cloud-badge">AWS</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="efs-disruption/">EFS Disruption</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Blocks connections to AWS EFS, causing temporary failure of mounted volumes</p>
<div class="cloud-badges">
<span class="cloud-badge">AWS</span>
</div>
</div>

</div>
</section>


<section class="krkn-scenario-category" data-category="application-service">
<h3 class="category-header">Application &amp; Service Disruptions</h3>

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="application-outage/">Application Outages</a></h3>
<span class="scenario-badge">application_outages_scenarios</span>
<p class="scenario-description">Isolates application Ingress/Egress traffic to test dependency handling and recovery timing</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="service-disruption-scenarios/">Service Disruption</a></h3>
<span class="scenario-badge">service_disruption_scenarios</span>
<p class="scenario-description">Deletes all objects within a namespace to test service recovery and data resilience</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="service-hijacking-scenario/">Service Hijacking</a></h3>
<span class="scenario-badge">service_hijacking_scenarios</span>
<p class="scenario-description">Hijacks service HTTP traffic to simulate custom responses and test client error handling</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="syn-flood-scenario/">Syn Flood</a></h3>
<span class="scenario-badge">syn_flood_scenarios</span>
<p class="scenario-description">Generates substantial TCP traffic directed at Kubernetes services to test DDoS resilience</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="http-load-scenario/">HTTP Load</a></h3>
<span class="scenario-badge">http_load_scenarios</span>
<p class="scenario-description">Generates distributed HTTP load against target endpoints using Vegeta load testing pods deployed inside the cluster</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>


</div>
</section>

<section class="krkn-scenario-category" data-category="storage-data">
<h3 class="category-header">Storage &amp; Data Disruptions</h3>

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="pvc-scenario/">PVC Disk Fill</a></h3>
<span class="scenario-badge">pvc_scenarios</span>
<p class="scenario-description">Fills up PersistentVolumeClaims to test disk space exhaustion handling</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

<div class="scenario-card">
<h3><a href="storage-throttle-scenario/">Storage I/O Throttle</a></h3>
<span class="scenario-badge">storage_throttle_scenarios</span>
<p class="scenario-description">Limits read/write IOPS and bandwidth on PVC-backed volumes using Linux cgroup I/O controls</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

</div>
</section>

<section class="krkn-scenario-category" data-category="system-time">
<h3 class="category-header">System &amp; Time Disruptions</h3>

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="time-scenarios/">Time Skew</a></h3>
<span class="scenario-badge">time_scenarios</span>
<p class="scenario-description">Skews system time and date to test time-sensitive applications and certificate handling</p>
<div class="cloud-badges">
<span class="cloud-badge cloud-badge--agnostic">Cloud Agnostic</span>
</div>
</div>

</div>
</section>

<script src="/js/scenario-filter.js" defer></script>
