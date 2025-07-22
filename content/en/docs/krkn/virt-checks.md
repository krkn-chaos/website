---
title: Kube Virt Checks
description: Kube Virt Checks to analyze down times of VMIs
weight: 2
---

### Kube Virt Checks

Virt checks provide real-time visibility into the impact of chaos scenarios on VMI ssh connectivity and performance. Virt check configuration supports application endpoints accessible via http / https along with authentication mechanism such as bearer token and authentication credentials.
Virt checks are configured in the ```config.yaml``` [here](config.md#virt-checks)

The system periodically checks the VMI's in the provided namespace based on the defined interval and records the results in Telemetry. The telemetry data includes:

- Success status ```True``` when the VMI is up and running and can form an ssh connection
- Failure response ```False``` if the VMI experiences downtime or errors.

This helps users quickly identify VMI issues and take necessary actions.

#### Sample health check config
```
kubevirt_checks:                                      # Utilizing virt check endpoints to observe ssh ability to VMI's during chaos injection.
    interval: 2                                       # Interval in seconds to perform virt checks, default value is 2 seconds
    namespace: runner                                 # Namespace where to find VMI's
    name: "^windows-vm-.$"                                 # Regex Name style of VMI's to watch
    only_failures: False                              # Boolean of whether to show all VMI's failures and successful ssh connection (False), or only failure status' (True) 
```
#### Sample virt check telemetry
Notice here that the vm with name windows-vm-1 had a false status (not able to form an ssh connection), for the first 37 seconds (the first item in the list). And at the end of the run the vm was able to for the ssh connection and reports true status for 41 seconds. While the vm with name windows-vm-0 has a true status the whole length of the chaos run (~88 seconds).
```
"virt_checks": [
      {
          "node_name": "000-000",
          "namespace": "runner",
          "vm_name": "windows-vm-1",
          "status": false,
          "start_timestamp": "2025-07-22T13:41:53.461951",
          "end_timestamp": "2025-07-22T13:42:30.696498",
          "duration": 37.234547
      },
      {
          "node_name": "000-000",
          "namespace": "runner",
          "vm_name": "windows-vm-0",
          "status": true,
          "start_timestamp": "2025-07-22T13:41:49.346861",
          "end_timestamp": "2025-07-22T13:43:17.949613",
          "duration": 88.602752
      },
      {
          "node_name": "000-000",
          "namespace": "runner",
          "vm_name": "windows-vm-1",
          "status": true,
          "start_timestamp": "2025-07-22T13:42:36.260780",
          "end_timestamp": "2025-07-22T13:43:17.949613",
          "duration": 41.688833
      }
  ],

```