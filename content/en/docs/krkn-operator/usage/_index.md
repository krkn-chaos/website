---
title: Usage
description: Operational features for running chaos experiments
weight: 3
---

# Usage

The operational features of Krkn Operator are available to all users, scoped by the permissions assigned to their group. This section covers the day-to-day workflow: running scenarios, designing workflows, monitoring jobs and managing files.

---

## Permission Summary

| Permission | Capabilities |
|------------|--------------|
| <a href="/docs/krkn-operator/#permission-view"><span class="krkn-badge krkn-badge--view">View</span></a> | View jobs and Krkn AI run results |
| <a href="/docs/krkn-operator/#permission-run"><span class="krkn-badge krkn-badge--run">Run</span></a> | Run scenarios, use Chaos Studio and Cluster Terminal, and discover/start Krkn AI runs |
| <a href="/docs/krkn-operator/#permission-cancel"><span class="krkn-badge krkn-badge--cancel">Cancel</span></a> | Cancel or delete jobs; delete Krkn AI runs |
| Group visibility | Manage files and select cloud credentials available to your group |

{{% notice info %}}
Users only see data from their own group. A cluster-wide indicator shows the names of currently running scenarios across all groups, but without details.
{{% /notice %}}

---

## Features

- [Jobs](jobs/) — Monitor and inspect scenario execution results
- [Cluster Terminal](cluster-terminal/) — Explore target clusters with read-only commands
- [Run Scenarios](run-scenarios/) — Execute single chaos scenarios (including selecting saved cloud credentials)
- [Chaos Studio](chaos-studio/) — Design visual workflows with serial and parallel execution
- [File Management](file-management/) — Upload and manage configuration files
- [Job Categories & Resiliency Score Report](job-categories-resiliency-score-report/) — Group scenario runs and compare resiliency scores
- [Krkn AI](krkn-ai/) — Explore experiments with AI, inspect results and replay a finding

Cloud credentials themselves are configured by administrators — see [Cloud Credentials Management](../administration/cloud-credentials-management/).
