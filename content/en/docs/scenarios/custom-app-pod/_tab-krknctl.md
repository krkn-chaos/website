## krknctl

Run the custom app pod scenario with krknctl:

```bash
krknctl scenario run custom-app-pod \
  --namespace-pattern "^kube-system$" \
  --name-pattern "coredns.*" \
  --krkn-pod-recovery-time 120 \
  --timeout 180 \
  --kill 1
```

### Parameters

| Flag | Type | Required | Description |
|------|------|----------|-------------|
| `--namespace-pattern` | string | Yes | Regex pattern for target namespace |
| `--name-pattern` | string | Yes | Regex pattern for pod names |
| `--krkn-pod-recovery-time` | integer | No | Expected recovery time (default: 120s) |
| `--timeout` | integer | No | Operation timeout (default: 180s) |
| `--kill` | integer | No | Number of pods to kill (default: 1) |
| `--node-label-selector` | string | No | Target pods on specific nodes |
| `--node-names` | string | No | Comma-separated list of specific node names to target |

### Examples

Kill one coredns pod:

```bash
krknctl scenario run custom-app-pod \
  --namespace-pattern "^kube-system$" \
  --name-pattern "coredns.*" \
  --kill 1
```

Kill two app worker pods with longer recovery time:

```bash
krknctl scenario run custom-app-pod \
  --namespace-pattern "production" \
  --name-pattern "worker-.*" \
  --krkn-pod-recovery-time 150 \
  --kill 2
```
