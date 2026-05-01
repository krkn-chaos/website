
Example scenario file: [virt_network.yaml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/virt_network.yaml)

### Configuration

```yaml
- id: vmi_network_filter
  image: "quay.io/krkn-chaos/krkn-network-chaos:latest"
  wait_duration: 300
  test_duration: 120
  label_selector: ""
  service_account: ""
  taints: []
  namespace: "my-namespace"
  instance_count: 1
  execution: serial
  target: ".*"
  interfaces: []
  ingress: true
  egress: true
```

For the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `target`: regex to match VMI names within the namespace (e.g. `"<vmi-name-prefix>-.*"` or `".*"` for all)
- `namespace`: namespace containing the target VMIs (required; also supports regex to match multiple namespaces)
- `interfaces`: list of tap interface names to target. Leave empty to auto-detect the tap device in the virt-launcher network namespace
- `ingress`: apply iptables DROP rules to incoming traffic
- `egress`: apply iptables DROP rules to outgoing traffic
- `ports`: list of ports to block (omit or leave empty to block all ports)
- `protocols`: list of IP protocols to filter — `tcp`, `udp`, or both (defaults to `["tcp", "udp"]`)

{{% alert title="Note" %}}
`ports` and `protocols` are optional. When `ports` is omitted or empty, all traffic on the specified protocols is blocked — equivalent to full network isolation.
{{% /alert %}}

### Catastrophic Configurations

**Full network isolation (most catastrophic):**
```yaml
  ingress: true
  egress: true
  # no ports or protocols — blocks all TCP and UDP
```
Complete network cut to the VMI.

**DNS blackout (cascading failures):**
```yaml
  ingress: true
  egress: true
  protocols:
    - tcp
    - udp
  ports:
    - 53
```
Blocking DNS (port 53) causes every service inside the VM that resolves hostnames to fail with timeouts. Cascading failures across the application stack without a hard cut — often the most realistic chaos scenario.

**Management plane loss:**
```yaml
  ingress: true
  egress: true
  protocols:
    - tcp
  ports:
    - 22
    - 443
    - 6443
```
Blocks SSH, HTTPS, and the Kubernetes API server. The VM stays running but is unreachable for management and API calls.

**Application layer only:**
```yaml
  ingress: true
  egress: true
  protocols:
    - tcp
  ports:
    - 80
    - 443
    - 8080
    - 8443
```
Kills HTTP/HTTPS traffic only — tests application resilience without taking the entire VM offline.

### Usage

To enable VMI network filter scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the scenario yaml file.

```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network.yaml
            - scenarios/openshift/virt_network_2.yaml
```

You can also combine multiple different scenario types in the same config.yaml file:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
```
{{% /alert %}}

### Run

```bash
python run_kraken.py --config config/config.yaml
```
