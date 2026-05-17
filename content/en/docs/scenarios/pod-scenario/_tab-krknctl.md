```bash
krknctl run pod-scenarios [--<parameter>:<value>]
```

Use this command to run a pod disruption scenario. Pass the optional flags below to target specific pods and control how the run behaves. Global `krknctl` flags are listed [here](../all-scenario-env-krknctl.md).

| Parameter | Description | Type | Required | Default |
|-----------|-------------|------|----------|---------|
| `--namespace` | Namespace to target. Supports regex. | string | No | `openshift-*` |
| `--pod-label` | Label selector for the pods to target, for example `app=test`. | string | No | - |
| `--exclude-label` | Pods matching this label are excluded from the run, even if they match other criteria. | string | No | `""` |
| `--name-pattern` | Regex pattern to match pods in the namespace when `--pod-label` is not set. | string | No | `.*` |
| `--disruption-count` | Number of pods to disrupt. | number | No | `1` |
| `--kill-timeout` | Seconds to wait for the target pod(s) to be removed. | number | No | `180` |
| `--expected-recovery-time` | Seconds to wait for disrupted pods to recover before the scenario fails. | number | No | `120` |
| `--node-label-selector` | Label selector for the nodes that host the target pods. | string | No | `""` |
| `--node-names` | Explicit node names to target. Example: `["worker-node-1","worker-node-2"]`. | string | No | `[]` |

#### Behavior Notes

- Pods are selected from the namespace and pod filters first, then filtered by node selectors.
- The scenario fails if the disrupted pods do not recover within `--expected-recovery-time` seconds.

To see the full CLI help:

```bash
krknctl run pod-scenarios --help
```
