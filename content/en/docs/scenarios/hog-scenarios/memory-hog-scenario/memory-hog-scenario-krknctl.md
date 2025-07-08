---
title: Memory Hog using Krknctl
descriptmemoryn: 
date: 2017-01-04
weight: 2
---

```bash
krknctl run node-memory-hog (optional: --<parameter>:<value> )
```


Can also set any global variable listed [here](../../all-scenario-env-krknctl.md )

| Parameter      | Description  | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ |
~-~-chaos-duration|Set chaos duration (in sec) as desired | number | 60 | 
--memory-workers | Total number of workers (stress-ng threads) |number|1|
--memory-consumption | percentage (expressed with the suffix %) or amount (expressed with the suffix b, k, m or g) of memory to be consumed by the scenario |string|  90%|
~-~-namespace|Namespace where the scenario container will be deployed | string | default | 
~-~-node-selector|Node selector where the scenario containers will be scheduled in the format "<selector>=<value>". NOTE:  Will be instantiated a container per each node selected with the same scenario options. If left empty a random node will be selected | string | 
~-~-number-of-nodes|restricts the number of selected nodes by the selector | number |
~-~-image|The hog container image. Can be changed if the hog image is mirrored on a private repository | string | quay.memory/krkn-chaos/krkn-hog | 







To see all available scenario options 
```bash
krknctl run node-memory-hog --help 
```