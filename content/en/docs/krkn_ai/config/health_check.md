---
title: Application Health Checks
description: Configuring Application Health Checks
weight: 3
---

When defining the Chaos Config, you can provide details about your application endpoints. Krkn-AI can access these endpoints during the Chaos experiment to evaluate how the application's uptime is impacted.

{{% alert title="Note" %}} Application endpoints must be accessible from the system where Krkn-AI is running in order to reach the service.{{% /alert %}}

### Configuration

The `health_checks` block accepts:
- **stop_watcher_on_failure**: This setting allows you to stop the health check watcher for an endpoint after it encounters a failure.
- **stop_timeout**: How long to wait for the health check watcher to shut down at the end of a scenario.
- **applications**: The list of endpoints to check.

Each application accepts:
- **name**: Name of the service.
- **url**: Service endpoint; supports parameterization with "$<KEY>".
- **status_code**: Expected status code returned when accessing the service.
- **timeout**: Timeout period after which the request is canceled.
- **interval**: How often to check the endpoint.

#### Example

```yaml
health_checks:
  stop_watcher_on_failure: false
  applications:
  - name: cart
    url: "$HOST/cart/add/1/Watson/1"
    status_code: 200
    timeout: 10
    interval: 2
  - name: catalogue
    url: "$HOST/catalogue/categories"
  - name: shipping
    url: "$HOST/shipping/codes"
  - name: payment
    url: "$HOST/payment/health"
  - name: user
    url: "$HOST/user/uniqueid"
  - name: ratings
    url: "$HOST/ratings/api/fetch/Watson"
```

#### URL Parameterization

When defining Krkn-AI config files, the URL entry for an application may vary depending on the cluster. To make the URL configuration more manageable, you can specify the values for these parameters at runtime using the `--param` flag.

In the previous example, the `$HOST` variable in the config can be dynamically replaced during the Krkn-AI experiment run, as shown below.

```bash
uv run krkn_ai run -c krkn-ai.yaml -o results/ -p HOST=http://example.cluster.url/nginx
```

### Automatic Discovery

Rather than writing these URLs by hand, [discover](../discover.md) can build them from the services it finds in the cluster.

Krkn-AI only considers **`LoadBalancer` services** in the discovered namespaces. Ingress, OpenShift Routes, `NodePort` and `ClusterIP` services are not used, because they do not give Krkn-AI an address it can reach directly.

For each service, the URL is built as `scheme://host:port/path`:

- **host** comes from the load balancer's external address. Services whose load balancer is still pending are skipped.
- **port**, **path** and **scheme** come from the `httpGet` readiness probe on the pod behind the service. If there is no readiness probe, the liveness probe is used instead.
- Probes of type `exec` or `tcpSocket` are ignored, since they carry no URL.
- If no usable probe is found, the URL falls back to the service's first port at `/`.

Krkn-AI then sends a GET request to each URL and treats any response below HTTP 500 as reachable. This check runs from the machine where you run `discover`, not from inside the cluster, so an endpoint that only resolves within the cluster network is reported as unreachable.

Only endpoints that have a probe **and** responded are written as active entries. The rest are commented out with the reason, so you can enable them once the cause is fixed.

| Probe found | Reachable | Result |
|-------------|-----------|------------------------------|
| Yes         | Yes       | Active entry                 |
| Yes         | No        | Commented, `# (unreachable)` |
| No          | Any       | Commented, `# (no probe)`    |

```yaml
health_checks:
  stop_watcher_on_failure: false
  stop_timeout: 5
  applications:
  - name: "cart"
    url: "http://192.0.2.10:80/health"
  # (no probe)
  # - name: "web"
  #   url: "http://192.0.2.11:8080/"
  # (unreachable)
  # - name: "payment"
  #   url: "https://192.0.2.12:443/ready"
```

If services were found but none qualified, the whole `health_checks` block is commented out, listing those services with the reason each was rejected. If no `LoadBalancer` service was found at all, a commented `$HOST` based example is left in its place as a starting point.

Discovery only runs when the config is written fresh, either because the file does not exist yet or because you passed `--save-strategy overwrite`.

#### Making Your Application Discoverable

To have your application picked up automatically:

1. Expose it with a service of `type: LoadBalancer`.
2. Give the container an `httpGet` readiness probe pointing at a real health endpoint.
3. Make sure the load balancer address is reachable from wherever you run `discover`.

```yaml
readinessProbe:
  httpGet:
    path: /healthz
    port: 8080
```

The [nginx demo](https://github.com/krkn-chaos/krkn-ai/tree/main/scripts/nginx) in the Krkn-AI repository is set up this way and can be used as a reference.

### Configure Health Check Score into Fitness Function

By default, the results of health checks—including whether each check succeeded and the response times—are incorporated into the overall Fitness Function score. This allows Krkn-AI to use application health as part of its evaluation criteria.

If you want to exclude health check results from influencing the fitness score, you can set the `include_health_check_failure` and `include_health_check_response_time` fields to `false` in your configuration.

```yaml
fitness_function:
    ...
    include_health_check_failure: false
    include_health_check_response_time: false
```
