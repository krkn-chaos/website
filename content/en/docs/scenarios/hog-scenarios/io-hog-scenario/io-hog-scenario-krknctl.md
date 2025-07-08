---
title: IO Hog using Krknctl
description: 
date: 2017-01-04
weight: 2
---

```bash
krknctl run node-io-hog (optional: --<parameter>:<value> )
```


Can also set any global variable listed [here](../../all-scenario-env-krknctl.md )

| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ |
~-~-chaos-duration|Set chaos duration (in sec) as desired | number | 60 | 
~-~-oo-block-size|sSze of each write in bytes. Size can be from 1 byte to 4 Megabytes (allowed suffix are b,k,m) | string | 1m | 
~-~-io-workers|Number of stressor instances | number | 5 | 
~-~-io-write-bytes|string writes N bytes for each hdd process. The size can be expressed as % of free space on the file system or in units of Bytes, KBytes, MBytes and GBytes using the suffix b, k, m or g | string | 10m | 
~-~-node-mount-path|the path in the node that will be mounted in the pod and where the io hog will be executed. NOTE: be sure that kubelet has the rights to write in that node path | string | /root | 
~-~-namespace|Namespace where the scenario container will be deployed | string | default | 
~-~-node-selector|Node selector where the scenario containers will be scheduled in the format "<selector>=<value>". NOTE:  Will be instantiated a container per each node selected with the same scenario options. If left empty a random node will be selected | string | 
~-~-number-of-nodes|restricts the number of selected nodes by the selector | number |
~-~-image|The hog container image. Can be changed if the hog image is mirrored on a private repository | string | quay.io/krkn-chaos/krkn-hog | 







To see all available scenario options 
```bash
krknctl run node-io-hog --help 
```