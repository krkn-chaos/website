---
title: Elasticsearch Management
description: Configure saved Elasticsearch endpoints for platform-wide observability
weight: 5
operator_docs_version: v1.0.0
operator_docs_page_key: administration/elasticsearch-management
---

# Elasticsearch Management <a href="/docs/krkn-operator/versions/v1.0.0/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Administrators can configure and save Elasticsearch endpoints that users can reference when executing chaos scenarios. This enables centralized observability configuration without requiring users to manually enter connection details.

<div class="krkn-video">
  <video controls width="100%" preload="metadata">
    <source src="/operator-docs/v1.0.0/videos/elasticsearch.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

---

## Overview

Elasticsearch integration allows krkn scenarios to index execution metrics, logs, and telemetry data for analysis and historical tracking. Instead of requiring each user to configure Elasticsearch details manually, admins can:

- **Pre-configure** Elasticsearch endpoints with connection details
- **Save** named configurations for reuse across all scenarios
- **Control** which Elasticsearch endpoints are available platform-wide

Users can then **select** from the saved Elasticsearch configurations when setting **global parameters** during scenario execution.

{{% notice info %}}
Users can **select** saved Elasticsearch configurations but **cannot add** new ones. Only admins have permission to create, edit, or delete Elasticsearch endpoints.
{{% /notice %}}

---

## Adding an Elasticsearch Endpoint

1. Navigate to **Administration** > **Elasticsearch Management**
2. Click **Add Elasticsearch**
3. Configure the following details:

| Field | Description | Required |
|-------|-------------|----------|
| **Name** | Friendly name for this configuration (e.g., "Production ES", "Dev Cluster") | Yes |
| **URL** | Elasticsearch endpoint URL (e.g., `https://elasticsearch.example.com:9200`) | Yes |
| **Index** | Index name or pattern for storing krkn data (e.g., `krkn-chaos-*`) | Yes |
| **Username** | Authentication username (if required) | No |
| **Password** | Authentication password (if required) | No |
| **Verify SSL** | Whether to verify SSL certificates (toggle) | Yes |

4. Click **Save** to add the configuration to the saved list

---

## Managing Saved Configurations

### View Saved Elasticsearch Endpoints

The Elasticsearch Management page displays all saved configurations:

- **Name**: Friendly identifier shown to users
- **URL**: Elasticsearch endpoint
- **Index**: Target index pattern
- **Actions**: Edit or Delete options

### Edit an Endpoint

1. Click the **Edit** icon next to the saved configuration
2. Modify any field (Name, URL, Index, credentials, SSL verification)
3. Click **Save** to update

{{% notice warning %}}
Editing a saved Elasticsearch configuration affects **all scenarios** currently using it. Changes apply to future scenario executions immediately.
{{% /notice %}}

### Delete an Endpoint

1. Click the **Delete** icon next to the saved configuration
2. Confirm the deletion

{{% notice warning %}}
Deleting an Elasticsearch configuration **does not affect running scenarios**, but it will no longer be available for selection in new scenario executions.
{{% /notice %}}

---

## How Users Select Elasticsearch

When users configure [global parameters](../../usage/run-scenarios/#4-configure-parameters) for a scenario or workflow, they can:

1. Expand the **Global** parameters section
2. Locate the **Elasticsearch** parameter
3. Click the dropdown to view all saved Elasticsearch configurations
4. Select an Elasticsearch endpoint by name (e.g., "Production ES")

The selected configuration automatically applies the admin-defined connection details (URL, index, credentials) to the scenario execution.

**Users cannot**:
- Add new Elasticsearch endpoints from the scenario configuration interface
- Edit existing saved configurations
- View sensitive details like passwords (only admins can see/edit credentials)

**Users can**:
- Choose from the dropdown list of saved Elasticsearch endpoints
- Opt not to use Elasticsearch (by leaving the parameter unset)

---

## Best Practices

### Naming Conventions

Use descriptive names that indicate the purpose or environment:
- ✅ `Production Observability`
- ✅ `Staging Metrics`
- ✅ `Dev Team Shared ES`
- ❌ `ES1`, `Elasticsearch`, `Test`

### Security

- Use **dedicated credentials** for krkn with limited write permissions to specific indices
- Enable **SSL verification** for production endpoints
- Restrict index patterns to prevent accidental data overwrites (e.g., `krkn-*` not `*`)

### Index Patterns

Use time-based or scenario-based index naming:
- `krkn-chaos-{YYYY-MM-DD}` — daily indices for easy retention management
- `krkn-scenarios-*` — scenario-specific index pattern
- `krkn-{environment}-*` — environment-specific indices

{{% notice tip %}}
Configure [Elasticsearch Index Lifecycle Management (ILM)](https://www.elastic.co/guide/en/elasticsearch/reference/current/index-lifecycle-management.html) to automatically manage data retention for krkn indices.
{{% /notice %}}

---

## Verification

After adding an Elasticsearch endpoint, verify it works:

1. Run a simple chaos scenario with the [Run Scenarios](../../usage/run-scenarios/) feature
2. Select the saved Elasticsearch configuration in **Global** parameters
3. Execute the scenario
4. Check the Elasticsearch index for new documents:
   ```bash
   curl -X GET "https://elasticsearch.example.com:9200/krkn-chaos-*/_search?pretty" \
     -u username:password
   ```

Successful indexing confirms the configuration is correct and accessible from the krkn-operator platform.
