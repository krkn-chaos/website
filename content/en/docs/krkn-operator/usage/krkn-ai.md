---
title: Run Krkn AI
linkTitle: Krkn AI
description: Run Krkn AI from the console, custom resources or API and inspect results.
weight: 7
---

<!-- Video placeholder: replace the dummy ID with the Krkn AI walkthrough. -->
<div class="krkn-video">
  <iframe src="https://www.youtube.com/embed/5B1S-AqjbNI" title="Krkn AI Walkthrough (placeholder)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
</div>

Before starting, [enable the integration](/docs/krkn-operator/installation/#krkn-ai)
and [register a target](/docs/krkn-operator/administration/cluster-management/).

## Run from the console

### 1. Select target

Open **Krkn AI → Create run**. Enter a run name, choose one target cluster and
select the namespaces to test. Click **Discover components**.

To reuse settings instead, choose **Use configuration from a previous run**.

### 2. Configure run

Review the proposed settings. Use the Krkn-AI documentation for more details:

- [Scenarios](/docs/krkn_ai/config/scenarios/) and [cluster components](/docs/krkn_ai/discover/)
- [Genetic algorithm and run limits](/docs/krkn_ai/config/evolutionary_algorithm/)
- [Fitness functions](/docs/krkn_ai/config/fitness_function/) and [health checks](/docs/krkn_ai/config/health_check/)
- [Run settings](/docs/krkn_ai/config/evolutionary_algorithm/#top-level-settings) and [YAML configuration](/docs/krkn_ai/config/)

### 3. Review and launch

Open **Review YAML** and click **Validate and save config**. After reviewing the
saved configuration and target, click **Start run**.

## Results and replay

Select a run in **Krkn AI** to view progress, orchestrator logs and scenario
executions. Open a scenario for **Overview**, **Logs**, **Fitness** and
**Health checks**; active scenarios may show only **Logs**.

![Krkn AI dashboard with run progress and the scenario list](/images/krkn-ai-operator-scenario-results.png)

### Fitness and health charts

The fitness chart shows best and average fitness across completed generations.
Higher fitness means greater disruption, not greater resilience; see
[fitness functions](/docs/krkn_ai/config/fitness_function/) for scoring details.
The baseline measures the system without chaos and is excluded from the search
population. Normalized scores become final at generation end.

![Best and average fitness over generations](/images/krkn-ai-operator-fitness-scores.png)

Use a scenario's **Health checks** tab to compare response times and HTTP outcomes.

![Health-check response-time chart and HTTP outcome heatmap](/images/krkn-ai-operator-health-check-graphs.png)

### Download and replay

After the run finishes, click **Download results ZIP** to export its results.

- **Reuse configuration:** starts a new AI run with saved settings.
- **Replay a scenario:** from a finished AI run, select the replay icon for a
  finished child scenario with a saved run reference. Review the targets and
  configuration, then submit **Run Scenarios**.

### Delete a run

{{% notice type="warning" %}}
Deleting a run stops active execution and permanently removes its child executions
and uploaded results. The saved configuration and shared PVC remain. Download
anything you need first.
{{% /notice %}}

## Programmatic usage

### Custom resources (CRDs)

| Resource | Role |
|---|---|
| `KrknAIRun` | Krkn-AI runner resource that creates orchestrator pod to run genetic algorithm to do exploratory Chaos Testing. |


Use a completed `KrknTargetRequest` from [target discovery](#apis) and a valid
`krkn-ai.yaml`. You can also generate `krkn-ai.yaml` config using [Krkn-AI CLI](/docs/krkn_ai/getting-started-krkn-ai/).

Store the configuration in the Operator namespace:

```bash
kubectl -n krkn-operator-system create configmap ai-config \
  --from-file=krkn-ai.yaml=./krkn-ai.yaml
```

Save the following as `ai-run.yaml`, replacing the request, provider and cluster
with values from your target discovery:

```yaml
apiVersion: krkn.krkn-chaos.dev/v1alpha1
kind: KrknAIRun
metadata:
  name: example-ai-run
  namespace: krkn-operator-system
spec:
  targetRequestId: existing-target-request
  targetClusters:
    krkn-operator:
      - existing-cluster-name
  configMapName: ai-config
  configMapKey: krkn-ai.yaml
  # Optional Prometheus overrides:
  # prometheusUrl: https://prometheus.example.com
  # prometheusTokenSecretRef: prometheus-token # Secret must contain key `token`.
```

Apply it to start the run and watch its status:

```bash
kubectl apply -f ai-run.yaml
kubectl -n krkn-operator-system get krknairun example-ai-run --watch
```

### APIs

Authenticate with `/api/v1/auth/login` and send its bearer token with API requests.
Create a target request with `POST /api/v1/targets`, poll
`GET /api/v1/targets/{uuid}` until complete, then select a provider and cluster
from `GET /api/v1/clusters?id={uuid}`.

AI endpoints use the `/api/v1/krkn-ai` prefix:

| Method and path | Purpose |
|---|---|
| `POST /discoveries` | Discover configuration for `targetRequestId` and `targetClusters`. |
| `POST /configs/validate` | Validate `{configYaml}` without saving it. |
| `POST /configs` | Save `configYaml` with its target selection; receive `configId`. |
| `GET /runs` | List accessible AI runs. |
| `POST /runs` | Start a run using `name`, `configId`, `targetRequestId` and `targetClusters`. |
| `GET /runs/{name}` | Read run status. |
| `GET /runs/{name}/results/summary` | Read progress and fitness summaries. |
| `GET /runs/{name}/results/scenarios` | List scenario results. |
| `GET /runs/{name}/results/scenarios/{generation}/{scenarioId}` | Read one scenario's results. |
| `GET /runs/{name}/results/download` | Download the results ZIP. |
| `DELETE /runs/{name}` | Remove the run, child executions and uploaded results. |
