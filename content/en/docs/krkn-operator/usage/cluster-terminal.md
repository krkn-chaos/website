---
title: Cluster Terminal
description: Explore target clusters with read-only commands
weight: 2
---

# Cluster Terminal <a href="/docs/krkn-operator/#permission-run"><span class="krkn-badge krkn-badge--run">Run</span></a>

A built-in terminal for exploring target clusters using read-only `oc` and `kubectl` commands. Useful for inspecting cluster state before, during or after chaos experiments.

<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/cgecXQEFqFQ" title="Cluster Terminal Walkthrough" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

---

## Details

- **Read-only**: only read commands are available — no modifications to the cluster are possible
- **Supported commands**: `oc` and `kubectl`
- **Target selection**: only clusters accessible to your group are available
- Requires <a href="/docs/krkn-operator/#permission-run"><span class="krkn-badge krkn-badge--run">Run</span></a> permission
