---
type: "docs/scenarios"
title: Scenarios
description: Krkn scenario list
date: 2017-01-04
weight: 6
---

{{% alert title="Tip" %}}
Many pod scenarios now support the `exclude_label` parameter to protect critical pods while testing others. See individual scenario pages ([Pod Failures](pod-scenario/_index.md), [Pod Network Chaos](pod-network-scenario/_index.md)) for details.
{{% /alert %}}

## Supported Chaos Scenarios

<style>
.scenario-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
}

.scenario-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1.5rem;
    background: #ffffff;
    transition: all 0.2s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
}

.scenario-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #4299e1;
    transform: translateY(-2px);
}

.scenario-card h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    color: #2d3748;
}

.scenario-card h3 a {
    color: #2d3748;
    text-decoration: none;
}

.scenario-card h3 a:hover {
    color: #4299e1;
}

.scenario-badge {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
    background: #edf2f7;
    color: #4a5568;
    border-radius: 12px;
    margin-bottom: 0.75rem;
    font-family: monospace;
}

.cloud-badges {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-top: 0.75rem;
}

.cloud-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
    background: #fff5e6;
    color: #FF0000;
    border: 1px solid #FF0000;
    border-radius: 4px;
    font-weight: 600;
}

.scenario-description {
    color: #4a5568;
    font-size: 0.9rem;
    line-height: 1.5;
    flex-grow: 1;
}

.category-header {
    margin-top: 6rem;
    margin-bottom: 6rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #4299e1;
    color: #2d3748;
}

.category-header:first-of-type {
    margin-top: 4rem;
}
</style>

### Pod & Container Disruptions

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="pod-scenario/">Pod Failures</a></h3>
<span class="scenario-badge">pod_disruption_scenarios</span>
<p class="scenario-description">Injects pod failures to test application resilience and recovery mechanisms</p>
</div>

<div class="scenario-card">
<h3><a href="container-scenario/">Container Failures</a></h3>
<span class="scenario-badge">container_scenarios</span>
<p class="scenario-description">Injects container failures based on the provided kill signal</p>
</div>

<div class="scenario-card">
<h3><a href="kubevirt-vm-outage-scenario/">KubeVirt VM Outage</a></h3>
<span class="scenario-badge">kubevirt_vm_outage</span>
<p class="scenario-description">Simulates VM-level disruptions by deleting Virtual Machine Instances to test resilience and recovery</p>
</div>

</div>

### Node & Cluster Failures

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
</div>

<div class="scenario-card">
<h3><a href="hog-scenarios/memory-hog-scenario/">Node Memory Hog</a></h3>
<span class="scenario-badge">hog_scenarios</span>
<p class="scenario-description">Hogs memory resources on targeted nodes to test memory pressure handling</p>
</div>

<div class="scenario-card">
<h3><a href="hog-scenarios/io-hog-scenario/">Node IO Hog</a></h3>
<span class="scenario-badge">hog_scenarios</span>
<p class="scenario-description">Hogs IO resources on targeted nodes to test disk performance degradation</p>
</div>


</div>

### Network Disruptions

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="network-chaos-scenario/">Network Chaos</a></h3>
<span class="scenario-badge">network_chaos_scenarios</span>
<p class="scenario-description">Introduces network latency, packet loss, and bandwidth restriction using tc and Netem</p>
</div>

<div class="scenario-card">
<h3><a href="pod-network-scenario/">Pod Network Chaos</a></h3>
<span class="scenario-badge">pod_network_scenarios</span>
<p class="scenario-description">Introduces network chaos at pod level including latency, packet loss, and bandwidth restriction</p>
</div>

<div class="scenario-card">
<h3><a href="network-chaos-ng-scenarios/">Network Chaos NG</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Next-generation network filtering scenarios with improved infrastructure</p>
</div>

<div class="scenario-card">
<h3><a href="dns-outage/">DNS Outages</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Blocks all outgoing DNS traffic from pods, preventing hostname resolution</p>
</div>

<div class="scenario-card">
<h3><a href="etcd-split-brain/">ETCD Split Brain</a></h3>
<span class="scenario-badge">network_chaos_ng_scenarios</span>
<p class="scenario-description">Isolates etcd nodes to force leader re-election and test cluster resilience</p>
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
</div>

</div>


### Application & Service Disruptions

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="application-outage/">Application Outages</a></h3>
<span class="scenario-badge">application_outages_scenarios</span>
<p class="scenario-description">Isolates application Ingress/Egress traffic to test dependency handling and recovery timing</p>
</div>

<div class="scenario-card">
<h3><a href="service-disruption-scenarios/">Service Disruption</a></h3>
<span class="scenario-badge">service_disruption_scenarios</span>
<p class="scenario-description">Deletes all objects within a namespace to test service recovery and data resilience</p>
</div>

<div class="scenario-card">
<h3><a href="service-hijacking-scenario/">Service Hijacking</a></h3>
<span class="scenario-badge">service_hijacking_scenarios</span>
<p class="scenario-description">Hijacks service HTTP traffic to simulate custom responses and test client error handling</p>
</div>

<div class="scenario-card">
<h3><a href="syn-flood-scenario/">Syn Flood</a></h3>
<span class="scenario-badge">syn_flood_scenarios</span>
<p class="scenario-description">Generates substantial TCP traffic directed at Kubernetes services to test DDoS resilience</p>
</div>


</div>

### Storage & Data Disruptions

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="pvc-scenario/">PVC Disk Fill</a></h3>
<span class="scenario-badge">pvc_scenarios</span>
<p class="scenario-description">Fills up PersistentVolumeClaims to test disk space exhaustion handling</p>
</div>

</div>

### System & Time Disruptions

<div class="scenario-grid">

<div class="scenario-card">
<h3><a href="time-scenarios/">Time Skew</a></h3>
<span class="scenario-badge">time_scenarios</span>
<p class="scenario-description">Skews system time and date to test time-sensitive applications and certificate handling</p>
</div>

</div>
