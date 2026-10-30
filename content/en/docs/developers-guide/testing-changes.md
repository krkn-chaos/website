---
title: Testing Changes
description: Verify plugin behavior, the image contract, container startup, and operator execution as separate stages.
weight: 60
categories: [Developers Guide]
tags: [docs, testing]
---

Test the behavior at the layer you changed, then verify the next integration
boundary. A correct Python method does not prove that its image can be
discovered or started by the operator.

The [hands-on lab](/docs/developers-guide/custom-scenario/) supplies the concrete
build and run commands. Use this page when deciding what evidence a scenario
change needs before contribution.

## Plugin and engine tests {#testing-changes-in-krkn}

For the development scenario, cover:

- A valid configuration and an existing namespace, including one with no pods.
- A missing namespace and a Kubernetes API failure.
- Invalid `wait` values: negative, above 60, fractional, boolean, or missing.
- Missing or invalid namespace values and unreadable or malformed YAML.
- The expected return code and useful error context for each failure.

Mock the sleep and cluster helper in unit tests so they remain fast and do not
depend on credentials. Verify externally meaningful behavior such as whether
pods are listed after a successful namespace check, rather than reproducing
the implementation's internal steps in the test.

Krkn's top-level scenario tests live under `tests/`, while plugin-factory tests
also live under `krkn/tests/`. After installing the dependencies required by the
checked-out version, run the relevant test module from the repository root.
The existing factory test is:

```bash
cd "$KRKN_DIR"
python3 -m unittest krkn.tests.test_plugin_factory -v
```

Add a focused test module for your scenario and run it explicitly before the
broader suite. See [Adding tests](/docs/developers-guide/add-tests-krkn/) for
test structure and functional CI integration.

## Container and metadata checks {#build-your-changes}

Rebuild the custom base after changing plugin Python or dependencies. Rebuild
the scenario image after changing labels, startup scripts, or templates.
Inspect the resulting image, rather than only the source Dockerfile:

```bash
podman image inspect "$KRKN_SCENARIO_IMAGE" |
  jq '.[0].Config.Labels["krknctl.input_fields"] | fromjson'
podman run --rm --user 1001:1001 --entrypoint /bin/bash \
  "$KRKN_SCENARIO_IMAGE" -c 'test -x /home/krkn/run.sh'
```

Run the container against a disposable target and exercise both success and
failure. Use the operator's startup convention in the test: execute
`/home/krkn/run.sh` directly under UID 1001. Check the mounted kubeconfig,
generated scenario YAML, effective `kraken.kubeconfig_path`, and exit status.

The [local test](/docs/developers-guide/custom-scenario/package-and-test/#run-against-an-existing-kind-cluster)
handles the internal Kind API address and the Podman Machine mount location.

## Operator integration

Verify these checkpoints in order:

1. The registry lists the scenario tag and its label JSON can be read.
2. The console shows the expected fields and maps them to the intended
   environment variables.
3. The Pod is scheduled in the management cluster and its image is pulled.
4. The startup script runs with the operator's user and file permissions.
5. The plugin accesses the selected target and produces the expected result.

Capture the resolved image digest when reporting the test. Pushing a new tag
value does not change the image reference of an existing Pod. Start a new run
and inspect its digest after a rebuild.

For a private HTTP registry, test operator API access and node-runtime access
separately. A successful listing does not validate containerd's transport or
the kubelet's pull credentials. The
[troubleshooting guide](/docs/developers-guide/custom-scenario/troubleshooting/)
shows the relevant evidence for each failure.

## Functional CI infrastructure {#configure-kind-testing-environment}

The small demo needs only a target with namespace and pod read permissions.
The full repository test suites can require additional nodes, workloads,
Prometheus, Elasticsearch, or platform-specific resources. Use the fixtures
and setup in the checked-out repository's CI documentation for the tests you
select.

Krkn's shell functional runner uses `CI/tests/functional_tests`, individual
scripts under `CI/tests/`, and `CI/run.sh`. It writes results to
`CI/results.markdown` and logs under `CI/out/`. Follow the
[current CI instructions](https://github.com/krkn-chaos/krkn/tree/main/CI)
and [adding tests guide](/docs/developers-guide/add-tests-krkn/#functional-tests)
when extending that suite.

### Install Elasticsearch and Prometheus {#install-elasticsearch-and-prometheus}

These services support other Krkn test suites and the metrics and long-term
storage user journeys. Neither is required for the custom scenario lab, which
disables telemetry export and resiliency scoring. Install them separately in
an environment appropriate to those tests; this is not part of provisioning
the lab's target.

#### Prometheus {#prometheus}

For a Kubernetes test environment, use the maintained
[kube-prometheus-stack chart instructions](https://github.com/prometheus-community/helm-charts/tree/main/charts/kube-prometheus-stack).
Select a chart version compatible with your Kubernetes version and the test
requirements, then configure the tests with a reachable Prometheus endpoint.
A workstation port-forward is suitable for a test process on that workstation;
`localhost` in a scenario container refers to the container itself.

#### Elasticsearch {#elasticsearch}

Use an Elasticsearch version supported by the library and tests you are
running. Elastic documents
[installing ECK with Helm](https://www.elastic.co/docs/deploy-manage/deploy/cloud-on-k8s/install-using-helm-chart)
and the separate step of deploying Elasticsearch resources. Installing the
operator alone does not create an Elasticsearch instance. Supply the resulting
endpoint, credentials, and TLS configuration to the selected test suite.

Use these maintained installation references instead of copying old chart
values or image tags across incompatible releases.

## Library changes {#testing-changes-in-krkn-lib}

Test new `krkn-lib` helpers in the library repository first, using the test
environment appropriate to their API behavior. Then install the changed
library into the custom Krkn base image and rerun the affected scenario.

This second check catches dependency-version mismatches and different
authentication or permission requirements. Updating the host's virtual
environment does not update a previously built container image.

## Community image packaging {#testing-changes-for-krkn-hub}

When contributing to krkn-hub, follow its template generation and Compose build
workflow. Build the affected scenario first, inspect its labels, and run the
same container and operator checks above. A collection-wide build is not a
prerequisite for testing a standalone custom scenario.

See [Publishing through krkn-hub](/docs/developers-guide/editing-krkn-hub/).

## Krknctl integration {#testing-changes-in-krknctl}

Use the client's private registry support to discover and exercise the
published scenario. You should not need to edit krknctl's embedded registry
configuration merely to add an image that uses existing input types.

When changing the type system or client implementation itself, add tests in
the corresponding krknctl packages and rebuild the client. Validate the
[image contract](/docs/developers-guide/krknctl-edits/) against both CLI and
console behavior when the change affects their shared metadata.
