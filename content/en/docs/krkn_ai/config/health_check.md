---
title: Application Health Checks
description: Configuring Application Health Checks
weight: 3
---

When defining the Chaos Config, you can provide details about your application endpoints. Krkn-AI can access these endpoints during the Chaos experiment to evaluate how the application's uptime is impacted.

{{% alert title="Note" %}} Application endpoints must be accessible from the system where Krkn-AI is running in order to reach the service.{{% /alert %}}

### Configuration

The following configuration options are available when defining an application for health checks:
- **name**: Name of the service.
- **url**: Service endpoint; supports parameterization with "$<KEY>".
- **status_code**: Expected status code returned when accessing the service.
- **timeout**: Timeout period after which the request is canceled.
- **interval**: How often to check the endpoint.
- **stop_watcher_on_failure**: This setting allows you to stop the health check watcher for an endpoint after it encounters a failure.

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

### Configure Health Check Score into Fitness Function

By default, the results of health checks—including whether each check succeeded and the response times—are incorporated into the overall Fitness Function score. This allows Krkn-AI to use application health as part of its evaluation criteria.

If you want to exclude health check results from influencing the fitness score, you can set the `include_health_check_failure` and `include_health_check_response_time` fields to `false` in your configuration.

```yaml
fitness_function:
    ...
    include_health_check_failure: false
    include_health_check_response_time: false
```
