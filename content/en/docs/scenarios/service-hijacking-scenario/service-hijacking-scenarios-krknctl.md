---
title: Service Hijacking Scenario using Krknctl
description: 
date: 2017-01-04
weight: 2
---

```bash
krknctl run service-hijacking (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
~-~-scenario-file-path | The absolute path of the scenario file compiled following the documentation |file_base64 |


To see all available scenario options 
```bash
krknctl run service-hijacking --help 
```