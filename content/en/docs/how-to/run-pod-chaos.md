---
title: How to Run Pod Chaos
description: Inject pod failures to test application resilience
type: "docs/scenarios"
---

## Goal

Test your application's resilience to pod failures by randomly killing pods and verifying recovery.

## Prerequisites

- Kubernetes cluster with kubectl access
  - Need a test cluster? See [Configure Kind Testing Environment](../../developers-guide/testing-changes/#configure-kind-testing-environment)
- One of: krknctl, krkn, or krkn-hub installed ([installation guide](../../installation/))
- Application deployed with multiple replicas (recommended)

## Methods

Choose your preferred method:

{{< tabpane text=true >}}

{{% tab header="krknctl" %}}

### Using krknctl (Recommended)

**Basic pod kill:**
```bash
krknctl pod-scenarios \
  --label-selector app=myapp \
  --namespace default \
  --kill-count 1 \
  --kill-timeout 30
```

**Kill multiple pods:**
```bash
krknctl pod-scenarios \
  --label-selector app=myapp \
  --namespace default \
  --kill-count 2 \
  --kill-timeout 60
```

**Repeated failures:**
```bash
krknctl pod-scenarios \
  --label-selector app=myapp \
  --namespace default \
  --kill-count 1 \
  --kill-timeout 10 \
  --kill-interval 20 \
  --iterations 5
```

**Exclude critical pods:**
```bash
krknctl pod-scenarios \
  --label-selector app=myapp \
  --exclude-label critical=true \
  --namespace default \
  --kill-count 1
```

{{% /tab %}}

{{% tab header="krkn-hub" %}}

### Using krkn-hub

**1. Create scenario config:**
```yaml
# pod-scenario.yaml
namespace: default
label_selector: app=myapp
kill_count: 1
kill_timeout: 30
exclude_label: critical=true  # optional
```

**2. Run with podman:**
```bash
podman run --rm \
  -v $HOME/.kube:/root/.kube:Z \
  -v $(pwd)/pod-scenario.yaml:/root/kraken/scenarios/pod_scenario.yaml:Z \
  quay.io/krkn-chaos/krkn-hub:latest \
  pod-scenarios
```

**3. Run with docker:**
```bash
docker run --rm \
  -v $HOME/.kube:/root/.kube \
  -v $(pwd)/pod-scenario.yaml:/root/kraken/scenarios/pod_scenario.yaml \
  quay.io/krkn-chaos/krkn-hub:latest \
  pod-scenarios
```

{{% /tab %}}

{{% tab header="krkn" %}}

### Using krkn

**1. Create scenario config:**
```yaml
# pod-scenario.yaml
namespace: default
label_selector: app=myapp
kill_count: 1
kill_timeout: 30
exclude_label: critical=true  # optional
```

**2. Update krkn config:**
```yaml
# config.yaml
chaos_scenarios:
  - scenarios/pod-scenario.yaml
```

**3. Run krkn:**
```bash
python3 run_kraken.py --config config/config.yaml
```

{{% /tab %}}

{{< /tabpane >}}

## Key Parameters

| Parameter | Description | Default | Example |
|-----------|-------------|---------|---------|
| `label_selector` | Target pods matching this label | required | `app=myapp` |
| `namespace` | Namespace to target | `default` | `production` |
| `kill_count` | Number of pods to kill per iteration | `1` | `2` |
| `kill_timeout` | Time pod stays killed (seconds) | `30` | `60` |
| `iterations` | How many times to repeat | `1` | `5` |
| `kill_interval` | Wait time between iterations (seconds) | `0` | `30` |
| `exclude_label` | Exclude pods with this label | - | `critical=true` |

See the [full configuration reference](../../scenarios/pod-scenario/) for all options.

## Verification

### Watch Pod Status

In a separate terminal:
```bash
kubectl get pods -l app=myapp --watch
```

Expected behavior:
1. Pod status changes to `Terminating`
2. New pod appears with status `ContainerCreating`
3. New pod becomes `Running`
4. Total pod count maintained

### Check Application Availability

Test your application endpoint during chaos:
```bash
while true; do
  curl -s http://myapp.example.com/health || echo "DOWN"
  sleep 1
done
```

### Review Krkn Results

Krkn will report:
- Pods killed
- Recovery time
- Final cluster state
- Pass/Fail status

## Common Issues

### No Pods Found

**Symptom:** `No pods found matching label selector`

**Solution:**
```bash
# Verify your label selector
kubectl get pods -l app=myapp

# Check namespace
kubectl get pods -l app=myapp -n your-namespace
```

### Permission Denied

**Symptom:** `Error: pods "pod-name" is forbidden`

**Solution:** Configure RBAC ([RBAC guide](../../krkn/rbac/))

### Pods Don't Recover

**Symptom:** Pod count decreases and doesn't recover

**Possible causes:**
- No ReplicaSet/Deployment managing the pods
- Insufficient cluster resources
- Image pull errors

**Debug:**
```bash
kubectl describe pod <new-pod-name>
kubectl get events --sort-by='.lastTimestamp'
```

## Best Practices

1. **Start small**: Kill 1 pod first, then scale up
2. **Use label selectors carefully**: Verify targets before running
3. **Protect critical pods**: Use `exclude_label` for essential services
4. **Monitor during chaos**: Use [Cerberus](../../cerberus/) for health monitoring
5. **Test in non-production first**: Validate scenarios in staging

## Related

- 📖 [Pod Scenario Reference](../../scenarios/pod-scenario/) - Complete configuration options
- 📚 [Your First Chaos Experiment](../../tutorials/first-chaos-experiment/) - Tutorial for beginners
- 📖 [Krkn Overview](../../krkn/) - Understanding how krkn works
- 📖 [Health Checks](../../krkn/health-checks/) - Monitor application during chaos
