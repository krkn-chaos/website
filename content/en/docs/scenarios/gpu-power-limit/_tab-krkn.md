Save this configuration as `scenarios/kube/gpu-power.yml`:

```yaml
fault-type: power-limit
image: quay.io/krkn-chaos/krkn-hub-multiarch:workload-krkn-gpu
namespace: krkn-gpu-test
node-selector: "kubernetes.io/hostname=gpu-node"
gpu-ids: "0"
gpu-power-limit-w: 40
duration: 30
```

Add it under `kraken.chaos_scenarios` in `config/config.yaml`:

```yaml
kraken:
  chaos_scenarios:
    - gpu_scenarios:
        - scenarios/kube/gpu-power.yml
```

```bash
python run_kraken.py --config config/config.yaml
```
