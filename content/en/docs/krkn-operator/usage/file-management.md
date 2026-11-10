---
title: File Management
description: Upload and manage reusable configuration files
weight: 5
---

# File Management

Create and manage text-based configuration files for scenario executions and Chaos Studio workflows.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/aGVXXTsKt5U" title="File Management Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Adding Files

Create a file by pasting its contents into the text input box. The console does not upload files from your device.

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
