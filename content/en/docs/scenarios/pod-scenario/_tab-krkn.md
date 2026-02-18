#### Example Config
The following are the components of Kubernetes for which a basic chaos scenario config exists today.

```yaml
kraken:
  chaos_scenarios:
    - pod_disruption_scenarios:
      - path/to/scenario.yaml
```

You can then create the scenario file with the following contents:

```yaml
# yaml-language-server: $schema=../plugin.schema.json
- id: kill-pods
  config:
    namespace_pattern: ^kube-system$
    label_selector: k8s-app=kube-scheduler
    krkn_pod_recovery_time: 120
    #Not needed by default, but can be used if you want to target pods on specific nodes
    # Option 1: Target pods on nodes with specific labels [master/worker nodes]
    node_label_selector: node-role.kubernetes.io/control-plane=      # Target control-plane nodes (works on both k8s and openshift)
    exclude_label: 'critical=true' # Optional - Pods matching this label will be excluded from the chaos
    # Option 2: Target pods of specific nodes (testing mixed node types)
    node_names:
      - ip-10-0-31-8.us-east-2.compute.internal      # Worker node 1
      - ip-10-0-48-188.us-east-2.compute.internal    # Worker node 2
      - ip-10-0-14-59.us-east-2.compute.internal     # Master node 1
```

Please adjust the schema reference to point to the [schema file](https://github.com/krkn-chaos/krkn/blob/main/scenarios/plugin.schema.json). This file will give you code completion and documentation for the available options in your IDE.

#### Pod Chaos Scenarios

The following are the components of Kubernetes/OpenShift for which a basic chaos scenario config exists today.

| Component                | Description | Working  |
| ------------------------ |-------------| -------- |
| [Basic pod scenario](https://github.com/krkn-chaos/krkn/blob/main/scenarios/kube/pod.yml) | Kill a pod. | ✔️ |
| [Etcd](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/etcd.yml) | Kills a single/multiple etcd replicas. | ✔️ |
| [Kube ApiServer](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/openshift-kube-apiserver.yml)| Kills a single/multiple kube-apiserver replicas. | ✔️ |
| [ApiServer](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/openshift-apiserver.yml) | Kills a single/multiple apiserver replicas. | ✔️ |
| [Prometheus](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/prometheus.yml) | Kills a single/multiple prometheus replicas. | ✔️ |
| [OpenShift System Pods](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/regex_openshift_pod_kill.yml) | Kills random pods running in the OpenShift system namespaces. | ✔️ |
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
