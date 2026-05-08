To enable this plugin add the pointer to the scenario input file `scenarios/kube/memory-hog.yml` as described in the
[Usage](#usage) section.

Example scenario file: [memory-hog.yml](https://github.com/krkn-chaos/scenarios-hub/blob/main/openshift/memory-hog/workflow.yaml)

#### `memory-hog` options
In addition to the common [hog scenario options](../_index.md#common-options), you can specify the below options in your scenario configuration to specificy the amount of memory to hog on a certain worker node

| Option                | Type   |Description|
|-----------------------|--------|---|
|`memory-vm-bytes`| string | the amount of memory that the scenario will try to hog.The size can be specified as % of free space on the file system or in units of Bytes, KBytes, MBytes and GBytes using the suffix b, k, m or g | 


### Usage

To enable hog scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `hog_scenarios` then add the desired scenario
pointing to the `hog.yaml` file.
```yaml
kraken:
    ...
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/memory-hog.yml
```

{{% alert title="Note" %}}
You can specify multiple scenario files of the same type by adding additional paths to the list:
```yaml
kraken:
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/memory-hog-1.yml
            - scenarios/kube/memory-hog-2.yml
            - scenarios/kube/memory-hog-3.yml
```

You can also combine multiple different scenario types in the same config.yaml file. Scenario types can be specified in any order, and you can include the same scenario type multiple times:
```yaml
kraken:
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/memory-hog.yml
        - pod_disruption_scenarios:
            - scenarios/pod-kill.yaml
        - node_scenarios:
            - scenarios/node-reboot.yaml
        - hog_scenarios:  # Same type can appear multiple times
            - scenarios/kube/memory-hog-2.yml
```
{{% /alert %}}
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
