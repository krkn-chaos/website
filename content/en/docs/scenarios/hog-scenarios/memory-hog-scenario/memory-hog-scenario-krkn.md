---
title: Memory Hog Scenarios using Krkn
description: 
date: 2017-01-04
weight: 1
---
To enable this plugin add the pointer to the scenario input file `scenarios/kube/memory-hog.yml` as described in the 
[Usage](#usage) section.

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

#### Node Targeting Examples

Use the `node-name` parameter to target specific nodes:

```yaml
hog-type: memory
duration: 60
memory-vm-bytes: "80%"
node-name: "worker-1"

# Target multiple nodes with comma-separated format
node-name: "worker-1,worker-2"
```
