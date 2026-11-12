---
title: Chaos Studio
description: Design visual chaos workflows with serial and parallel execution
weight: 4
---

# Chaos Studio <a href="/docs/krkn-operator/#permission-run"><span class="krkn-badge krkn-badge--run">Run</span></a>

A visual drag-and-drop editor for designing complex chaos workflows. Build graphs of scenarios that execute in series or parallel, and measure application resilience with the Resiliency Score.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/qz0Hmitkxqs" title="Chaos Studio Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Creating and Saving Workflows

### Creating a New Workflow

1. Navigate to **Chaos Studio** from the main navigation
2. Click the **"New Workflow"** button to start a blank canvas
3. Give your workflow a meaningful name that describes its purpose

### Adding Nodes

1. Click the **"Add Node"** button or drag from the node palette
2. Position nodes on the canvas by dragging them
3. Configure each node by clicking on it and selecting:
   - **Registry**: Choose your scenario source
   - **Scenario**: Select the chaos scenario to run
   - **Parameters**: Set mandatory and optional parameters
   - **Cloud credential**: Optionally load a saved cloud credential for cloud-dependent scenarios
   - **Files**: Mount any required configuration files

### Connecting Nodes

- Click and drag from a node's output port to another node's input port to create dependencies
- Serial execution: connect nodes in a chain (A → B → C)
- Parallel execution: connect one node to multiple targets (A → B and A → C)

### Saving Your Workflow

1. Click the **"Save"** button in the top toolbar
2. The workflow is automatically saved to your workspace
3. Saved workflows appear in the **Chaos Studio** workflow list
4. You can edit saved workflows by selecting them from the list

---

## Visual Editor

- **Nodes** represent individual krkn scenarios
- **Arrows** define execution order — connect nodes to create dependencies
- **Serial execution**: chain nodes sequentially with single arrows
- **Parallel execution**: branch from one node to multiple targets
- Drag and drop to arrange the workflow visually

---

## Node Configuration

Each node is configured exactly like a [single scenario](../run-scenarios/): select a registry, choose a scenario, set mandatory/optional/global parameters, optionally load a cloud credential, and mount files.

### Wait for a Trigger

Use the **Wait for Trigger** node to pause a workflow until an event condition is met. This node runs the trigger utility and does not inject a chaos scenario itself. Nodes connected after it start after the wait node completes successfully.

1. Add **Wait for Trigger** from the node palette.
2. Open **Configure** and choose a trigger type: command, HTTP, Kubernetes resource, or Prometheus.
3. Set the fields shown for that type. Add more trigger conditions if needed.
4. Choose how multiple conditions are combined:
   - **All** waits until every condition matches.
   - **Any** continues when at least one condition matches.
5. Set the timeout, polling interval, and what should happen if the timeout expires.
6. Connect the node to its predecessor and to the scenarios that should run after the event.

For graph definitions sent directly to the operator API, mark the node with `nodeType: "trigger"` and use the public `trigger` scenario identity. The operator selects the trigger image from the node type; callers do not provide an image:

```json
{
  "wait-for-service": {
    "nodeType": "trigger",
    "scenario": {
      "name": "trigger",
      "private": false
    },
    "depends_on": "prepare-service",
    "env": {
      "TRIGGER_HTTP_URL": "https://app.example.com/health",
      "TRIGGER_HTTP_EXPECTED_STATUS": "200",
      "TRIGGERS_TIMEOUT": "600",
      "TRIGGERS_ON_TIMEOUT": "fail"
    }
  }
}
```

Replace `prepare-service` with the ID of the predecessor node, or omit `depends_on` if the trigger should start at the root of the graph.

The trigger node supports these condition types:

| Type | Example use |
|------|-------------|
| Command | Wait for a command to return the configured exit code. |
| HTTP | Poll a URL until it returns the expected status and, optionally, response body text. |
| Kubernetes resource | Watch a named resource until its condition expression matches. |
| Prometheus | Wait until a PromQL query returns a result. |

When a timeout occurs, the configured action determines whether the trigger node fails or completes successfully. Choose **Fail** when downstream nodes must not run unless the event occurs; **Skip** and **Run anyway** complete successfully, so downstream nodes can continue.

### Global Parameters in Workflows

When configuring global parameters for workflow nodes:

- **Elasticsearch**: Select from saved admin-configured endpoints to index metrics across the entire workflow
- **Prometheus**: Configure Prometheus integration for metric collection
- **Cerberus**: Enable cluster health monitoring during scenario execution

{{% notice tip %}}
Configure **Elasticsearch** in global parameters to track metrics across all nodes in a workflow. This provides centralized observability for complex multi-scenario executions.
{{% /notice %}}

### Cloud Credentials in Workflows

Cloud-dependent nodes can use saved credentials configured under [Cloud Credentials Management](../../administration/cloud-credentials-management/).

When configuring a node:

1. Open **Load Cloud Credential**
2. Select a credential available to your group
3. Cloud fields for that provider become masked; other providers' fields are hidden

Each node can select its own credential (for example one AWS credential on a zone-outage node and a BMC credential on a power-outage node).

{{% notice info %}}
You can **select** credentials available to your group but **cannot create** new ones from Chaos Studio. Contact your administrator to add credentials.
{{% /notice %}}

**Clone**: duplicate a configured node to repeat the same scenario multiple times within the workflow.

---

## Validation

The editor validates the workflow before execution:

- **Configured nodes**: green arrows and connections — ready to execute
- **Unconfigured nodes**: red arrows and red node border — must be configured before the workflow can run

Only fully configured nodes can be connected and executed.

---

## Resiliency Score

{{% notice info %}}
**Resiliency Score** quantifies how well your application withstood a chaos workflow. Instead of a simple pass/fail, you get a numeric score based on real application metrics.
{{% /notice %}}

Enable the Resiliency Score on a workflow to measure application resilience:

1. **Enable** the resiliency score option on the workflow
2. **Mount a PromQL file** — a special file containing PromQL queries uploaded via [File Management](../file-management/)
3. **Queries execute** during the workflow and their results contribute to the final score
4. **View the score** in the [Jobs](../jobs/) page alongside the graph run results

The PromQL file defines which metrics to evaluate (latency, error rate, throughput, etc.) and their expected thresholds. The score reflects how closely the application maintained its expected behavior under chaos.
