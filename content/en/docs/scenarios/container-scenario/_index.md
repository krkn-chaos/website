---
title: Container Scenarios
description:
date: 2017-01-04
weight: 3
---
<krkn-hub-scenario id="container-scenarios">
Kraken uses the `oc exec` command to `kill` specific containers in a pod.
This can be based on the pods namespace or labels. If you know the exact object you want to kill, you can also specify the specific container name or pod name in the scenario yaml file.
These scenarios are in a simple yaml format that you can manipulate to run your specific tests or use the pre-existing scenarios to see how it works.
</krkn-hub-scenario>


## Recovery Time Metrics in Krkn Telemetry

Krkn tracks three key recovery time metrics for each affected container:

1. **pod_rescheduling_time** - The time (in seconds) that the Kubernetes cluster took to reschedule the pod after it was killed. This measures the cluster's scheduling efficiency and includes the time from pod deletion until the replacement pod is scheduled on a node. In some cases when the container gets killed, the pod won't fully reschedule so the pod rescheduling might be 0.0 seconds

2. **pod_readiness_time** - The time (in seconds) the pod took to become ready after being scheduled. This measures application startup time, including container image pulls, initialization, and readiness probe success.

3. **total_recovery_time** - The total amount of time (in seconds) from pod deletion until the replacement pod became fully ready and available to serve traffic. This is the sum of rescheduling time and readiness time.

These metrics appear in the telemetry output under `PodsStatus.recovered` for successfully recovered pods. Pods that fail to recover within the timeout period appear under `PodsStatus.unrecovered` without timing data.

**Example telemetry output:**
```json
{
  "recovered": [
    {
      "pod_name": "backend-7d8f9c-xyz",
      "namespace": "production",
      "pod_rescheduling_time": 43.62235879898071,
      "pod_readiness_time": 0.0,
      "total_recovery_time": 43.62235879898071
    }
  ],
  "unrecovered": []
}
```

## How to Run Container Scenarios

Choose your preferred method to run container scenarios:

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}

## Demo
See a demo of this scenario:
<script src="https://asciinema.org/a/452375.js" id="asciicast-452375" async="true" style="max-width:900px; max-height:400px; width:100%; aspect-ratio:20/9;"></script>
