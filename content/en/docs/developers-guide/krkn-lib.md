---
title: Using and Extending Krkn-lib
description: Reuse the cluster clients provided to scenario plugins and contribute shared Kubernetes and OpenShift helpers.
weight: 50
categories: [Developers Guide]
tags: [docs, plugins, libraries]
---

`krkn-lib` provides the Kubernetes, OpenShift, telemetry, metrics, and data-model
building blocks used by Krkn scenarios. Prefer its existing helpers for cluster
operations so scenarios share authentication, behavior, and testable interfaces.

## Use the client supplied to the plugin

Krkn passes a `KrknTelemetryOpenshift` instance as `lib_telemetry` to `run()`.
Obtain the Kubernetes helper from it:

```python
    kubernetes = lib_telemetry.get_lib_kubernetes()
    namespaces = kubernetes.list_namespaces()
    pods = kubernetes.list_pods(namespace)
```

For OpenShift-specific operations, use `lib_telemetry.get_lib_ocp()` and the
methods documented for the installed library version. The wrapper has already
been initialized for the run; creating another client with a separately loaded
kubeconfig can make the plugin act on the wrong cluster.

The demo's namespace existence check lists namespaces before listing pods.
Its target credentials therefore need both permissions. Always derive access
requirements from the operations your implementation actually performs.

## Find an existing helper

Consult the [API reference](https://krkn-chaos.github.io/krkn-lib-docs/modules.html)
and the [library source](https://github.com/krkn-chaos/krkn-lib). The main areas are:

- `krkn_lib.k8s` and `krkn_lib.ocp` for cluster operations.
- `krkn_lib.telemetry` for telemetry collection and integration.
- `krkn_lib.prometheus` and `krkn_lib.elastic` for metrics and result storage.
- `krkn_lib.models` for shared models.
- `krkn_lib.utils` for common utilities.

Check the version installed in the runtime image when consulting a helper's
signature. A newer library checkout on the host does not change the dependency
already installed in a container image.

## Add reusable behavior

Place broadly reusable Kubernetes or OpenShift operations in the library.
Keep experiment sequencing, scenario configuration, and success criteria in
the plugin. For a new helper, document its arguments, return type, exceptions,
required permissions, and behavior when resources are absent.

Clone the library and install its development dependencies using the project's
Poetry configuration:

```bash
git clone https://github.com/krkn-chaos/krkn-lib.git
cd krkn-lib
poetry install --no-interaction
```

Follow the repository's tests and contribution instructions for the operation
you change. Mock isolated API behavior in unit tests, and use a disposable
cluster for tests that exercise real Kubernetes resources. See
[Testing changes](/docs/developers-guide/testing-changes/#testing-changes-in-krkn-lib).

If a plugin depends on an unreleased helper, install that library build into
the custom base image before packaging the scenario. Publishing a plugin alone
cannot make a missing helper appear in the runtime.
