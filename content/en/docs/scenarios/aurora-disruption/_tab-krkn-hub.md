This scenario disrupts a targeted zone in the public cloud by blocking egress and ingress traffic to understand the impact on both Kubernetes/OpenShift platforms control plane as well as applications running on the worker nodes in that zone. More information is documented [here](/docs/scenarios/zone-outage-scenarios/_index.md)

#### Run

```bash
podman run -v ~/.kube/config:/home/krkn/.kube/config:z -e TEST_DURATION="60" \
    -e INGRESS="false" -e EGRESS="true" -e PROTOCOLS="tcp" -e PORTS="3306,5432" \
    -e POD_NAME="target-pod" quay.io/krkn-chaos/krkn-hub:pod-network-filter
```