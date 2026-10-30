---
title: Build a Custom Scenario
linkTitle: Hands-on Lab
description: Build, package, publish, and run a small custom Krkn plugin with Podman, Kind, and Krkn Operator.
weight: 20
categories: [Developers Guide]
tags: [docs, tutorial, plugins]
---

Build a scenario that waits, lists pods in a namespace, and returns a clear
result. Start with a plugin skeleton in its own repository, add two methods,
package the plugin in a Krkn image, and expose it to Krkn Operator through a
private registry running inside Kind.

**Get the lab files:** [krkn-chaos/krkn-dev-demo](https://github.com/krkn-chaos/krkn-dev-demo).
The commands below pin [revision `bf2ea8d`](https://github.com/krkn-chaos/krkn-dev-demo/tree/bf2ea8d920de5a6e5d8ea26a8d705ff600bc6684),
including the executable-script and containerd configuration fixes used in this
walkthrough.

This lab focuses on the integration contract. The scenario reads Kubernetes
resources and does not disrupt workloads. You provide the target cluster and
register it with the operator separately; this lab creates only the Kind
management cluster that hosts the operator and registry.

## What you will build

- `DevDemoScenarioPlugin`, discovered as `dev_demo_scenarios`.
- A custom Krkn base image containing that plugin.
- A scenario image exposing `wait` and `namespace` through OCI labels.
- An authenticated registry, installed with Helm inside Kind.
- An operator run whose logs show the development banner and target pod names.

The plugin is built directly into the custom base image. There is no krkn-hub
checkout in this workflow, and the image metadata supplies the client-facing
parameter definitions.

## Before you begin

Install Git, Podman, Kind, kubectl, Helm 3, `jq`, `envsubst` from GNU gettext,
OpenSSL, and an `htpasswd` implementation supporting bcrypt (`-B`). Have Python
3 available for the optional source syntax check. On macOS, start Podman Machine
and use a rootful Podman connection for this Kind lab.

You also need:

- Internet access to clone the source and pull the published images and charts.
- A running cluster and kubeconfig for the local container test. If it is a
  Kind cluster, know its name from `kind get clusters`.
- Free host ports `5001` for the registry and `3000` for the console forward.
- An operator target whose Kubernetes API is reachable from the management
  cluster's scenario Pods. Registering that target is outside this lab.

The examples use Kind node image `kindest/node:v1.32.2` with containerd 2,
Docker Registry chart `3.0.0`, and Krkn Operator chart `1.1.2`. These are the lab's
version choices, not a claim that they are the latest releases. The companion
repository is pinned below so the permission and registry fixes demonstrated
here are included.

## Prepare the workspace

Run these commands in one shell and keep its exported variables for the whole
lab. Paths are absolute, so later commands do not depend on the current working
directory. Start from `/tmp` in case a previous shell was left inside a removed
checkout.

```bash
cd /tmp

export KRKN_DIR=/tmp/krkn
export KRKN_DEV_PLUGIN_DIR="$KRKN_DIR/krkn/scenario_plugins/dev_demo"
export KRKN_BASE_IMAGE=krkn-dev-demo:base
export KRKN_SCENARIO_IMAGE=krkn-dev-demo:scenario
export KIND_EXPERIMENTAL_PROVIDER=podman
export KRKN_DEMO_REVISION=bf2ea8d920de5a6e5d8ea26a8d705ff600bc6684

git clone https://github.com/krkn-chaos/krkn.git "$KRKN_DIR"
git clone https://github.com/krkn-chaos/krkn-dev-demo.git "$KRKN_DEV_PLUGIN_DIR"
git -C "$KRKN_DEV_PLUGIN_DIR" checkout "$KRKN_DEMO_REVISION"
```

{{% alert title="Tip: what the workspace commands establish" color="info" %}}
`export` makes the paths and image names available to child processes. Quoting
the paths preserves them as single arguments. `git -C` runs Git inside the
plugin checkout without changing your shell's directory, and checking out a
commit selects the lab's exact files in a detached HEAD. Create your own branch
there if you want to commit your implementation. `KIND_EXPERIMENTAL_PROVIDER`
selects Podman for Kind; it does not start Podman Machine or change its connection.
{{% /alert %}}

Use an unused `KRKN_DIR`. If `/tmp/krkn` already contains work, choose another
absolute path before cloning. Do not remove an existing checkout to make the
command succeed.

The pinned plugin repository is a separate checkout nested inside Krkn's plugin
directory. It contains:

```text
dev_demo/
├── __init__.py
├── dev_demo_scenario_plugin.py  # helper implemented; abstract methods left for you
├── scenario.yaml               # example plugin input
├── scenario.yaml.template      # environment-to-YAML template
├── env.sh                      # container defaults
├── run.sh                      # render configuration and start Krkn
├── krknctl-input.json           # user-facing input descriptors
├── Dockerfile.base             # add the plugin to a published Krkn runtime
├── Dockerfile.template         # package the scenario contract
├── kind-config.yml             # registry port and containerd hosts directory
└── registry-values.yml         # authenticated registry Helm values
```

The cloned Krkn source lets you inspect its interface and loader. The base image
build copies the plugin into the published Krkn runtime; it does not rebuild
the rest of the cloned engine. Pin the published base image as well when turning
this workshop into a repeatable release pipeline.

## Follow the lab

1. [Implement the plugin](/docs/developers-guide/custom-scenario/implement-plugin/).
2. [Package and test the image](/docs/developers-guide/custom-scenario/package-and-test/).
3. [Publish and run with Krkn Operator](/docs/developers-guide/custom-scenario/operator-lab/).

Keep [Troubleshooting](/docs/developers-guide/custom-scenario/troubleshooting/)
open while working. It covers the failures encountered while developing this
demo, including successful discovery followed by an HTTPS image pull error.
