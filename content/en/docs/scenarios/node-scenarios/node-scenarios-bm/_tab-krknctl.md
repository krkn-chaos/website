
```bash
krknctl run node-scenarios-bm --scenario-file-path <path-to-baremetal_node_scenarios.yml>
```

Can also set any global variable listed [here](../../all-scenario-env-krknctl.md).

### Node Scenarios BM Parameters

| Argument                | Type        | Description                                                                                                  | Required | Default |
|:------------------------|:------------|:-------------------------------------------------------------------------------------------------------------|:---------|:--------|
| `--scenario-file-path`  | file_base64 | Absolute path to the baremetal node-scenarios YAML file. krknctl base64-encodes the file and supplies it as `SCENARIO_BASE64` to the container. | true     |         |

The scenario YAML must follow the [baremetal node scenario schema](https://github.com/krkn-chaos/krkn-hub/blob/main/node-scenarios-bm/config-schema.json). See the **Krkn** tab on this page for an annotated example and the list of supported actions.

### Example

```bash
krknctl run node-scenarios-bm \
  --scenario-file-path ~/krkn/scenarios/openshift/baremetal_node_scenarios.yml
```

{{% alert title="Note" %}}
krknctl handles the base64 encoding for you — pass a plain filesystem path. The validation step inside the container (against `config-schema.json`) still applies, so invalid YAML is rejected before Krkn runs.
{{% /alert %}}
