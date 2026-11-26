Save this configuration as `scenarios/kube/gpu-compute.yml`:

```yaml
fault-type: compute-pressure
image: quay.io/krkn-chaos/krkn-hub-multiarch:workload-krkn-gpu
namespace: krkn-gpu-test
pod-label-selector: "app=inference"
target-namespace: inference
gpu-ids: "all"
gpu-compute-duty-cycle: "20%"
duration: 60
```

Add it under `kraken.chaos_scenarios` in `config/config.yaml`:

```yaml
kraken:
  chaos_scenarios:
    - gpu_scenarios:
        - scenarios/kube/gpu-compute.yml
```

```bash
python run_kraken.py --config config/config.yaml
```
