To enable this plugin add the pointer to the scenario input file `scenarios/kube/cpu-hog.yml` as described in the
[Usage](#usage) section.

Example scenario file: [cpu-hog.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/cpu-hog/workflow.yaml)

#### `cpu-hog` options
In addition to the common [hog scenario options](../_index.md#common-options), you can specify the below options in your scenario configuration to specificy the amount of CPU to hog on a certain worker node

| Option  | Type   |Description|
|---|--------|---|
| `cpu-load-percentage` | number | the amount of cpu that will be consumed by the hog|
| `cpu-method` | string | reflects the cpu load strategy adopted by stress-ng, please refer to the stress-ng documentation for all the available options|



### Usage

To enable hog scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `hog_scenarios` then add the desired scenario
pointing to the `hog.yaml` file.
```yaml
kraken:
    ...
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/cpu-hog.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/cpu-hog-1.yml
            - scenarios/kube/cpu-hog-2.yml
            - scenarios/kube/cpu-hog-3.yml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/cpu-hog.yml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - hog_scenarios:  # Same type can appear multiple times
            - scenarios/kube/cpu-hog-2.yml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
