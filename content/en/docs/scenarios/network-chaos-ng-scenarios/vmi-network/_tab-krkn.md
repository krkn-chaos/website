
Example scenario file: [virt_network_chaos.yaml](https://github.com/krkn-chaos/krkn/blob/main/scenarios/openshift/virt_network_chaos.yaml)

### Configuration

```yaml
- id: vmi_network_chaos
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
  latency: "100ms"
  loss: "10"
  bandwidth: "100mbit"
```

For the common module settings please refer to the [documentation](../network-chaos-ng-scenario-api.md#basenetworkchaosconfig-base-module-configuration).

- `target`: regex to match VMI names within the namespace (e.g. `"<vmi-name-prefix>-.*"` or `".*"` for all)
- `namespace`: namespace containing the target VMIs (required; also supports regex to match multiple namespaces)
- `interfaces`: list of tap interface names to target. Leave empty to auto-detect the tap device in the virt-launcher network namespace
- `ingress`: shape incoming traffic to the VM
- `egress`: shape outgoing traffic from the VM
- `latency`: artificial network latency added to packets (e.g. `"100ms"`, `"500ms"`)
- `loss`: percentage of packets to drop (e.g. `"10"` for 10%, `"50"` for 50%)
- `bandwidth`: maximum throughput cap (e.g. `"100mbit"`, `"1gbit"`, `"500kbit"`)

{{% alert title="Note" %}}
At least one of `latency`, `loss`, or `bandwidth` should be set. Setting all three simultaneously compounds the degradation.
{{% /alert %}}

### Catastrophic Configurations

The following combinations produce the most impactful chaos:

**Complete network degradation (maximum chaos):**
```yaml
  latency: "2000ms"
  loss: "50"
  bandwidth: "1mbit"
```
Combines severe latency with heavy packet loss and near-complete bandwidth exhaustion.

**DNS blackout via latency (cascading failures):**
```yaml
  latency: "5000ms"
  loss: "0"
  bandwidth: ""
```
5-second latency causes DNS timeouts across every service in the VM, producing cascading failures without a hard cut.

**Bandwidth starvation:**
```yaml
  latency: ""
  loss: "0"
  bandwidth: "100kbit"
```
Throttles the VMI to 100 kbit/s — enough to keep connections alive but too slow for most application traffic.

### Usage

To enable VMI network chaos scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `network_chaos_ng_scenarios` then add the desired scenario
pointing to the scenario yaml file.

```yaml
kraken:
    ...
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network_chaos.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network_chaos.yaml
            - scenarios/openshift/virt_network_chaos_2.yaml
```

You can also combine multiple different scenario types in the same config.yaml file:
```yaml
kraken:
    chaos_scenarios:
        - network_chaos_ng_scenarios:
            - scenarios/openshift/virt_network_chaos.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
```
{{% /alert %}}

### Run

```bash
python run_kraken.py --config config/config.yaml
```
