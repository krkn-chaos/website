---
title: IO Hog Scenarios using Krkn
description: 
date: 2017-01-04
weight: 2
---
To enable this plugin add the pointer to the scenario input file `scenarios/kube/io-hog.yaml` as described in the 
[Usage](#usage) section.

#### `io-hog` options
In addition to the common [hog scenario options](../_index.md#common-options), you can specify the below options in your scenario configuration to target specific pod IO
| Option                | Type   | Description                                                                                                                                                                                                  |
|-----------------------|--------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `io-block-size`       |string| the block size written by the stressor                                                                                                                                                                       |
| `io-write-bytes`      |string| the total amount of data that will be written by the stressor. The size can be specified as % of free space on the file system or in units of Bytes, KBytes, MBytes and GBytes using the suffix b, k, m or g |
| `io-target-pod-folder` |string| the folder where the volume will be mounted in the pod                                                                                                                                                       |
| `io-target-pod-volume`| dictionary | the pod volume definition that will be stressed by the scenario.                                                                                                                                             |

{{< notice type="warning" >}}Modifying the structure of `io-target-pod-volume` might alter how the hog operates, potentially rendering it ineffective.{{< /notice >}}


### Usage

To enable hog scenarios edit the kraken config file, go to the section `kraken -> chaos_scenarios` of the yaml structure
and add a new element to the list named `hog_scenarios` then add the desired scenario
pointing to the `hog.yaml` file.
```yaml
kraken:
    ...
    chaos_scenarios:
        - hog_scenarios:
            - scenarios/kube/io-hog.yml
```
