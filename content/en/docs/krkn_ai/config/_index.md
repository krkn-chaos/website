---
title: Configuration
description: Configuring Krkn-AI
weight: 5
---

Krkn-AI is configured using a simple declarative YAML file. This file can be automatically generated using Krkn-AI's [discover](../discover.md) feature, which creates a config file from a boilerplate template. The generated config file will have the cluster components pre-populated based on your cluster.

### Config Structure

The config file has two layers: **top-level settings** that apply regardless of the optimization algorithm, and **algorithm-specific sections** scoped under their own key. The `algorithm` field selects which engine to use (currently only `genetic`), and all parameters for that engine live under the corresponding section:

```yaml
kubeconfig_file_path: "./tmp/kubeconfig.yaml"
wait_duration: 120

algorithm: genetic          # algorithm selector

genetic:                    # all genetic algorithm parameters live here
  generations: 20
  population_size: 10
  # ...

fitness_function:
  query: 'sum(kube_pod_container_status_restarts_total)'
  type: point

scenario:
  pod-scenarios:
    enable: true

cluster_components:
  namespaces: [...]
  nodes: [...]
```

> **Backward compatibility:** Config files using the old flat layout (GA fields at root level) are still supported — they are automatically migrated on load.

See the subsections below for detailed documentation of each config block.
