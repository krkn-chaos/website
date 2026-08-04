---
title: Run Scenarios
description: Execute single chaos scenarios on target clusters
weight: 3
---

# Run Scenarios <a href="/docs/krkn-operator/#permission-run"><span class="krkn-badge krkn-badge--run">Run</span></a>

Execute a chaos scenario on one or more target clusters through a guided step-by-step wizard. All scenarios can run simultaneously across multiple clusters.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/3_7ebCMAK3o" title="Run Scenarios Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Execution Flow

### 1. Select Target Clusters

Choose one or more clusters to run the scenario on. All selected clusters execute the scenario simultaneously.

![Select Target Clusters](/images/krkn-operator/select-target.png)

### 2. Select Registry

Choose the container registry for scenario images:

| Registry | Description |
|----------|-------------|
| **Public** (Quay.io) | Default registry with all community scenarios |
| **Private** | Configured by admin, only mirrored scenarios available. Visibility controlled by group permissions |

![Select Registry](/images/krkn-operator/select-registry.png)

### 3. Select Scenario

Browse and select a chaos scenario from the chosen registry.

![Select Scenario](/images/krkn-operator/select-scenario.png)

### 4. Configure Parameters

Each scenario defines its own parameter set, divided into three categories:

| Category | Description |
|----------|-------------|
| **Mandatory** | Must be configured before execution. Not all scenarios have them |
| **Optional** | Fine-grained control over scenario behavior (label selectors, timing, filters) |
| **Global** | Framework-level settings (Elasticsearch, Prometheus, Cerberus integration). Applied only if modified from defaults |

![Mandatory Parameters](/images/krkn-operator/scenario-mandatory.png)
![Optional Parameters](/images/krkn-operator/scenario-optional.png)
![Global Options](/images/krkn-operator/scenario-global.png)

### 5. Mount Files

Optionally attach configuration files previously uploaded through [File Management](../file-management/). Files are available via a select dropdown.

### 6. Preview

Review a summary of all configured parameters before execution.

![Preview](/images/krkn-operator/scenario-preview.png)

### 7. Run

Launch the scenario. You are redirected to the [Jobs](../jobs/) page where you can monitor the execution in real time.
