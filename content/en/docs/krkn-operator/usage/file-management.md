---
title: File Management
description: Upload and manage reusable configuration files
weight: 5
---

# File Management

Upload and manage text-based configuration files that can be used across scenario executions and Chaos Studio workflows.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/esQlDsPW-Jg" title="File Management Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Uploading Files

Files are created by **pasting content** into the text input box — there is no file upload button.

| Constraint | Detail |
|------------|--------|
| **Formats** | JSON, YAML (text only) |
| **Input method** | Copy-paste into the text box |
| **Metadata** | Name, description, category |
| **Visibility** | Everyone or assigned to specific groups |

---

## Where Files Are Used

| Context | Purpose |
|---------|---------|
| [Run Scenarios](../run-scenarios/) | Mount as configuration file during scenario parameter setup |
| [Chaos Studio](../chaos-studio/) | Mount as configuration file on individual nodes |
| [Chaos Studio](../chaos-studio/) — Resiliency Score | Mount as PromQL query file for resiliency score calculation |
