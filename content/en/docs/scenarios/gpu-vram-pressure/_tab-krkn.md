Save this configuration as `scenarios/kube/gpu-vram.yml`:

```yaml
fault-type: vram-pressure
image: quay.io/krkn-chaos/krkn-hub-multiarch:workload-krkn-gpu
namespace: krkn-gpu-test
node-selector: "kubernetes.io/hostname=gpu-node"
gpu-ids: "0"
gpu-vram: "20%"
duration: 60
```

Add it under `kraken.chaos_scenarios` in `config/config.yaml`:

```yaml
kraken:
  chaos_scenarios:
    - gpu_scenarios:
        - scenarios/kube/gpu-vram.yml
```

```bash
python run_kraken.py --config config/config.yaml
```
