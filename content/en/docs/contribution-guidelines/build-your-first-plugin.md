---
title: Build Your First Plugin
description: Practical guide to building your first Krkn chaos plugin
weight: 4
categories: [New scenarios, Tutorials]
tags: [docs, tutorial]
---

# Build Your First Chaos Plugin with Krkn

## Overview

This guide walks you through the practical steps of creating your first Krkn chaos plugin. For API details and specifications, refer to the [Scenario Plugin API documentation](./scenario_plugin_api.md).

## Prerequisites

- Python 3.8+
- Familiarity with Kubernetes concepts (pods, services)
- Basic understanding of Python classes
- Knowledge of the specific chaos scenario you want to implement

## Step-by-Step: Writing Your Plugin

1. **Create your plugin directory structure**:
   ```bash
   mkdir -p krkn/scenario_plugins/my_scenario
   ```
   Note: Follow the [naming conventions](./scenario_plugin_api.md#naming-conventions) from the API documentation.

2. **Create the plugin file**:
   Create `my_scenario_scenario_plugin.py` in your plugin directory.

3. **Implement the required methods**:
   At minimum, implement the `run()` and `get_scenario_types()` methods as required by the API.

4. **Add an __init__.py file**:
   Create this file to make your directory a proper Python package.

## Example: Simple Node Killer Plugin

Here's a practical example of a plugin that kills a specified number of nodes:

```python
# node_killer_scenario_plugin.py
from krkn_lib.models.telemetry import ScenarioTelemetry
from krkn_lib.telemetry.ocp import KrknTelemetryOpenshift
from krkn.scenario_plugins.abstract_scenario_plugin import AbstractScenarioPlugin
import logging
import random

class NodeKillerScenarioPlugin(AbstractScenarioPlugin):
    def run(
        self,
        run_uuid: str,
        scenario: dict,  # This is a dictionary, not a string
        krkn_config: dict,
        lib_telemetry: KrknTelemetryOpenshift,
        scenario_telemetry: ScenarioTelemetry,
    ) -> int:
        try:
            # Get parameters from scenario config
            node_count = int(scenario.get('node_count', 1))
            duration = int(scenario.get('duration', 60))
            
            # Get Kubernetes client
            k8s = lib_telemetry.get_lib_kubernetes()
            
            # Get list of worker nodes
            nodes = k8s.list_nodes(label_selector="node-role.kubernetes.io/worker")
            if not nodes:
                logging.warning("No worker nodes found")
                return 0
            
            # Select random nodes to kill
            target_nodes = random.sample(nodes, min(node_count, len(nodes)))
            
            # Kill the selected nodes
            for node in target_nodes:
                node_name = node.metadata.name
                logging.info(f"Killing node: {node_name}")
                
                # Execute the node shutdown logic
                # This is a simplified example - actual implementation would depend on your infrastructure
                k8s.cordon_node(node_name)
                
                # You might use SSH or cloud provider APIs to actually shut down the node
                # Example: aws_client.terminate_instance(instance_id)
            
            return 0  # Success
            
        except Exception as e:
            logging.error(f"Error in node killer scenario: {str(e)}")
            return 1  # Failure
    
    def get_scenario_types(self) -> list[str]:
        return ["node_killer_scenario"]
```

## Config File Example

Add your plugin configuration to `config.yaml`:

```yaml
chaos_scenarios:
  - name: node-killer-chaos
    scenario_type: node_killer_scenario  # Must match value from get_scenario_types()
    node_count: 2  # Number of nodes to kill
    duration: 300  # Duration in seconds
```

## Testing Your Plugin

You can test your plugin with pytest:

```bash
pytest krkn/tests/
```

Or run it directly with Krkn:

```bash
python3 run_kraken.py --config=config.yaml
```

## Development Tips

1. **Use specific error handling**
   ```python
   try:
       # Your chaos logic
   except KubernetesApiException as k_err:
       logging.error(f"Kubernetes API error: {k_err}")
       return 1
   except Exception as e:
       logging.error(f"Unexpected error: {e}")
       return 1
   ```

2. **Access configuration parameters safely**
   ```python
   # With default values for missing parameters
   count = int(scenario.get('count', 1))
   
   # With validation
   namespace = scenario.get('namespace')
   if not namespace:
       logging.error("Missing required parameter: namespace")
       return 1
   ```

3. **Add cleanup code**
   ```python
   try:
       # Setup resources
       # Execute chaos
       return 0
   except Exception as e:
       logging.error(f"Error: {e}")
       return 1
   finally:
       # Cleanup resources regardless of success/failure
       try:
           cleanup_resources()
       except Exception as cleanup_err:
           logging.warning(f"Cleanup error: {cleanup_err}")
   ```

## Testing Your Plugin

1. **Unit testing**:
   ```bash
   cd krkn
   python -m pytest tests/unit/scenario_plugins/test_my_plugin.py -v
   ```

2. **Integration testing**:
   ```bash
   python run_kraken.py --config=config.yaml
   ```

## Conclusion

You've now created your first Krkn chaos plugin! The example above demonstrates the key components needed for a working plugin. 

For more detailed information on the API, refer to the [Scenario Plugin API documentation](./scenario_plugin_api.md).
