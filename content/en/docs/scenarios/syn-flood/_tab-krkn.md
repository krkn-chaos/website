Example scenario file: [syn_flood.yaml](https://github.com/krkn-chaos/scenarios-hub)

##### Sample scenario config

```yaml
packet-size: 120 # hping3 packet size
window-size: 64 # hping 3 TCP window size
duration: 10 # chaos scenario duration
namespace: default # namespace where the target service(s) are deployed
target-service: target-svc # target service name (if set target-service-label must be empty)
target-port: 80 # target service TCP port
target-service-label : "" # target service label, can be used to target multiple target at the same time
                          # if they have the same label set (if set target-service must be empty)
number-of-pods: 2 # number of attacker pod instantiated per each target
image: quay.io/krkn-chaos/krkn-syn-flood # syn flood attacker container image
attacker-nodes: # this will set the node affinity to schedule the attacker node. Per each node label selector
                # can be specified multiple values in this way the kube scheduler will schedule the attacker pods
                # in the best way possible based on the provided labels. Multiple labels can be specified
  kubernetes.io/hostname:
    - host_1
    - host_2
  kubernetes.io/os:
    - linux
```

### How to Use Plugin Name
Add the plugin name to the list of chaos_scenarios section in the config/config.yaml file
```yaml
kraken:
    kubeconfig_path: ~/.kube/config                     # Path to kubeconfig
    ..
    chaos_scenarios:
        - syn_flood_scenarios:
            - scenarios/<scenario_name>.yaml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - syn_flood_scenarios:
            - scenarios/syn-flood-1.yaml
            - scenarios/syn-flood-2.yaml
            - scenarios/syn-flood-3.yaml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - syn_flood_scenarios:
            - scenarios/syn-flood.yaml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - network_chaos_scenarios:
            - scenarios/network-chaos.yaml
        - syn_flood_scenarios:  # Same type can appear multiple times
            - scenarios/syn-flood-2.yaml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
