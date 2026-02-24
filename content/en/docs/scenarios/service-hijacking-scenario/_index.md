---
title: Service Hijacking Scenario
description:
date: 2017-01-04
weight: 3
---
<krkn-hub-scenario id="service-hijacking">
Service Hijacking Scenarios aim to simulate fake HTTP responses from a workload targeted by a Service already deployed in the cluster. This scenario is executed by deploying a custom-made web service and modifying the target Service selector to direct traffic to this web service for a specified duration. 

The web service's source code is available [here](https://github.com/krkn-chaos/krkn-service-hijacking). 
</krkn-hub-scenario>


It employs a time-based test plan from the scenario configuration file, which specifies the behavior of resources during the chaos scenario as follows:

The scenario will focus on the `service_name` within the `service_namespace`, 
substituting the selector with a randomly generated one, which is added as a label in the mock service manifest.
This allows multiple scenarios to be executed in the same namespace, each targeting different services without causing conflicts.

The newly deployed mock web service will expose a `service_target_port`, 
which can be either a named or numeric port based on the service configuration. 
This ensures that the Service correctly routes HTTP traffic to the mock web service during the chaos run.

Each step will last for `duration` seconds from the deployment of the mock web service in the cluster. 
For each HTTP resource, defined as a top-level YAML property of the plan 
(it could be a specific resource, e.g., /list/index.php, or a path-based resource typical in MVC frameworks), 
one or more HTTP request methods can be specified. Both standard and custom request methods are supported.

During this time frame, the web service will respond with:

- `status`: The [HTTP status code](https://datatracker.ietf.org/doc/html/rfc7231#section-6) (can be standard or custom).
- `mime_type`: The [MIME type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) (can be standard or custom).
- `payload`: The response body to be returned to the client.

At the end of the step `duration`, the web service will proceed to the next step (if available) until 
the global `chaos_duration` concludes. At this point, the original service will be restored, 
and the custom web service and its resources will be undeployed.

__NOTE__: Some clients (e.g., cURL, jQuery) may optimize queries using lightweight methods (like HEAD or OPTIONS) 
to probe API behavior. If these methods are not defined in the test plan, the web service may respond with 
a `405` or `404` status code. If you encounter unexpected behavior, consider this use case.


## How to Run Service Hijacking Scenarios

Choose your preferred method to run service hijacking scenarios:

{{< tabpane text=true >}}
  {{< tab header="**Krkn**" lang="krkn" >}}
{{< readfile file="_tab-krkn.md" >}}
  {{< /tab >}}
  {{< tab header="**Krkn-hub**" lang="krkn-hub" >}}
{{< readfile file="_tab-krkn-hub.md" >}}
  {{< /tab >}}
  {{< tab header="**Krknctl**" lang="krknctl" >}}
{{< readfile file="_tab-krknctl.md" >}}
  {{< /tab >}}
{{< /tabpane >}}
