## krknctl

Run the pod path provisioner scenario with krknctl:

```bash
krknctl run pod-scenarios \
  --namespace "local-path-storage" \
  --pod-label "app=local-path-provisioner" \
  --expected-recovery-time 20 \
  --disruption-count 1
```

### Parameters

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--namespace` | string | Yes | Targeted namespace (supports regex) |
| `--pod-label` | string | Yes | Label selector to match target pods |
| `--expected-recovery-time` | integer | No | Expected recovery time in seconds (default: 120) |
| `--disruption-count` | integer | No | Number of pods to kill (default: 1) |
| `--kill-timeout` | integer | No | Timeout for pod removal in seconds (default: 180) |
| `--node-label-selector` | string | No | Target pods on nodes with this label |
| `--node-names` | string | No | Comma-separated list of specific node names to target |

### Examples

Kill the local-path-provisioner pod:

```bash
krknctl run pod-scenarios \
  --namespace "local-path-storage" \
  --pod-label "app=local-path-provisioner" \
  --disruption-count 1
```

Kill provisioner pod with longer recovery window:

```bash
krknctl run pod-scenarios \
  --namespace "local-path-storage" \
  --pod-label "app=local-path-provisioner" \
  --expected-recovery-time 60 \
  --disruption-count 1
```
