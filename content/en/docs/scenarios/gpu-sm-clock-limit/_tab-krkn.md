Save this configuration as `scenarios/kube/gpu-clock.yml`:

```yaml
fault-type: clock-limit
image: quay.io/krkn-chaos/krkn-hub-multiarch:workload-krkn-gpu
namespace: krkn-gpu-test
node-selector: "kubernetes.io/hostname=gpu-node"
gpu-ids: "0"
gpu-clock-mhz: 750
duration: 30
```

Add it under `kraken.chaos_scenarios` in `config/config.yaml`:

```yaml
kraken:
  chaos_scenarios:
    - gpu_scenarios:
        - scenarios/kube/gpu-clock.yml
```

```bash
python run_kraken.py --config config/config.yaml
```
