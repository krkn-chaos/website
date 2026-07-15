---
title: Usage
description: Operational features for running chaos experiments
weight: 3
---

# Usage

The operational features of Krkn Operator are available to all users, scoped by the permissions assigned to their group. This section covers the day-to-day workflow: running scenarios, designing workflows, monitoring jobs and managing files.

---

## Permission Summary

| Feature | Required Permission |
|---------|-------------------|
| View Jobs | <span class="krkn-badge krkn-badge--read">Read</span> |
| Delete Jobs | <span class="krkn-badge krkn-badge--delete">Delete</span> |
| Cluster Terminal | <span class="krkn-badge krkn-badge--run">Run</span> |
| Run Scenarios | <span class="krkn-badge krkn-badge--run">Run</span> |
| Chaos Studio | <span class="krkn-badge krkn-badge--run">Run</span> |
| File Management | Group visibility |

{{% notice info %}}
Users only see data from their own group. A cluster-wide indicator shows the names of currently running scenarios across all groups, but without details.
{{% /notice %}}

---

## Features

- [Jobs](jobs/) — Monitor and inspect scenario execution results
- [Cluster Terminal](cluster-terminal/) — Explore target clusters with read-only commands
- [Run Scenarios](run-scenarios/) — Execute single chaos scenarios
- [Chaos Studio](chaos-studio/) — Design visual workflows with serial and parallel execution
- [File Management](file-management/) — Upload and manage configuration files
