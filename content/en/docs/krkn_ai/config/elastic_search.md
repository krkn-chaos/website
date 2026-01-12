---
title: Elastic Search
description: Configuring Elasticsearch for Krkn-AI results storage
weight: 6
---

Krkn-AI supports integration with Elasticsearch to store scenario configurations, run results, and metrics. This allows you to centralize and query experiment data using Elasticsearch's search and visualization capabilities (e.g., with Kibana).

### Configuration Parameters

- `enable` (bool): Set to `true` to enable saving results to Elasticsearch. Default: `false`.
- `server` (string): URL or address of your Elasticsearch server (e.g., `http://localhost`).
- `port` (int): Port to connect to Elasticsearch (default: `9200`).
- `username` (string): Username for Elasticsearch authentication (can reference environment variables).
- `password` (string): Password for Elasticsearch authentication. If using environment substitution, prefix with `__` to treat as private.
- `verify_certs` (bool): Set to `true` to verify SSL certificates. Default: `true`.
- `index` (string): Name prefix for the Elasticsearch index where Krkn-AI results will be stored (e.g., `krkn-ai`).

### Example Configuration

```yaml
elastic:
  enable: true                      # Enable Elasticsearch integration
  server: "http://localhost"        # Elasticsearch server URL
  port: 9200                        # Elasticsearch port
  username: "$ES_USER"              # Username (environment substitution supported)
  password: "$__ES_PASSWORD"        # Password (start with __ for sensitive/private handling)
  verify_certs: true                # Verify SSL certificates
  index: "krkn-ai"                  # Index prefix for storing results
```

In addition to the standard Krkn telemetry and metrics indices, Krkn-AI creates two dedicated Elasticsearch indices to store detailed run information:

- `krkn-ai-config`: Stores comprehensive information about the Krkn-AI configuration for each run, including parameters for the genetic algorithm, enabled scenarios, SLO definitions, and other configuration details.
- `krkn-ai-results`: Stores the results of each Krkn-AI run, such as fitness scores, health check evaluations, and related metrics.

**Note:** Depending on the complexity and number of scenarios executed, Krkn-AI can generate a significant amount of metrics and data per run. Ensure that your Elasticsearch deployment is sized appropriately to handle this volume.
