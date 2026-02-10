To enable this plugin add the pointer to the scenario input file `scenarios/kube/cpu-hog.yml` as described in the 
[Usage](#usage) section.


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
### Run 

```bash
python run_kraken.py --config config/config.yaml
```
