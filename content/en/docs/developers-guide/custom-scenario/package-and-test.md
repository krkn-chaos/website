---
title: Package and Test the Image
description: Build a custom Krkn base and a standalone scenario image, then verify its metadata and runtime behavior.
weight: 20
categories: [Developers Guide]
tags: [docs, tutorial, containers]
---

**Starting point:** the [plugin methods are implemented](/docs/developers-guide/custom-scenario/implement-plugin/).
**Result:** a locally tested image that clients can discover through its labels.

## Build the custom Krkn base

`Dockerfile.base` overlays the local Python package on the published runtime:

```dockerfile
FROM quay.io/krkn-chaos/krkn:latest

COPY --chown=krkn:krkn __init__.py \
    /home/krkn/kraken/krkn/scenario_plugins/dev_demo/__init__.py
COPY --chown=krkn:krkn dev_demo_scenario_plugin.py \
    /home/krkn/kraken/krkn/scenario_plugins/dev_demo/dev_demo_scenario_plugin.py
```

```bash
podman build \
  -f "$KRKN_DEV_PLUGIN_DIR/Dockerfile.base" \
  -t "$KRKN_BASE_IMAGE" \
  "$KRKN_DEV_PLUGIN_DIR"
```

{{% alert title="Tip: Dockerfile path and build context are different" color="info" %}}
`-f` selects the Dockerfile; the final argument selects the directory available
to its `COPY` instructions. `-t` assigns a local image name. Keeping both paths
absolute makes this command work from any directory. Nothing is pushed to a
registry at this stage.
{{% /alert %}}

This build context is the plugin repository. Using Krkn's upstream container
Dockerfile unchanged would clone Krkn from GitHub during the build and omit the
local plugin. If you change the core engine or `krkn-lib`, build a runtime that
includes those changes explicitly.

## Inspect the scenario contract

The image has two user inputs in `krknctl-input.json`:

```json
[
  {
    "name": "wait",
    "short_description": "Wait (seconds)",
    "description": "Seconds to wait before listing pods in the namespace (0 to 60).",
    "variable": "WAIT_SECONDS",
    "type": "number",
    "required": "false"
  },
  {
    "name": "namespace",
    "short_description": "Namespace",
    "description": "Kubernetes namespace whose pod names will be logged.",
    "variable": "NAMESPACE",
    "type": "string",
    "required": "true",
    "validator": "^[a-z0-9]([-a-z0-9]*[a-z0-9])?$",
    "validation_message": "namespace must be a Kubernetes namespace name"
  }
]
```

`name` identifies the input presented by a client; `variable` is the environment
variable injected into the container. The string values `"true"` and `"false"`
match krknctl's field descriptor format. The plugin still enforces its own
integer range: a generic `number` field alone does not restrict input to an
integer from 0 to 60.

`Dockerfile.template` embeds the JSON in `krknctl.input_fields`, together with
the other labels included in the companion image:

```dockerfile
LABEL krknctl.is_a_scenario="true"
LABEL krknctl.privileged="false"
LABEL krknctl.has_rollback="false"
LABEL krknctl.kubeconfig_path="/home/krkn/.kube/config"
LABEL krknctl.title="Dev Demo"
LABEL krknctl.description="Waits, then logs pod names from one Kubernetes namespace."
LABEL krknctl.input_fields='$KRKNCTL_INPUT'
```

{{% alert title="Tip: an image label does not configure a volume mount" color="info" %}}
`krknctl.kubeconfig_path` is metadata in this template; krknctl and the operator
do not use it to select the mount destination. The operator uses the run's
`kubeconfigPath` or its default, `/home/krkn/.kube/config`, which this lab keeps.
With a custom path, align the run configuration, the mount, and the startup
script's `KUBECONFIG` value. See [Kubeconfig mount path](/docs/developers-guide/krknctl-edits/#kubeconfig-mount-path).
{{% /alert %}}

The same Dockerfile copies the startup script with an explicit executable bit:

```dockerfile
COPY --chmod=0755 --chown=krkn:krkn run.sh /home/krkn/run.sh
ENTRYPOINT ["/bin/bash", "/home/krkn/run.sh"]
```

This permission is required because the operator invokes `/home/krkn/run.sh`
directly. A local entrypoint that passes the script to `bash` can conceal a
missing executable bit.

## Follow the runtime configuration

`env.sh` supplies defaults of `2` seconds and namespace `default` for direct
container execution. The console still requires the namespace input declared
in the metadata.

`scenario.yaml.template` contains:

```yaml
wait: ${WAIT_SECONDS}
namespace: ${NAMESPACE}
```

`run.sh` changes to `/home/krkn/kraken` and uses an explicit substitution list:

```bash
envsubst '$WAIT_SECONDS $NAMESPACE' \
  < scenarios/scenario.yaml.template > scenarios/dev_demo.yaml
```

It derives `config/dev_demo_config.yaml` from the base configuration, sets
`kraken.kubeconfig_path` from `KUBECONFIG`, and selects only
`dev_demo_scenarios`. For this focused demo, telemetry export, event backup,
reports, resiliency scoring, and the inter-scenario stabilization delay are
disabled. These are demo settings, not a requirement for custom plugins.

Finally it hands control to Krkn while preserving the process exit status:

```bash
exec ./containers/entrypoint.sh --config=config/dev_demo_config.yaml
```

## Build and inspect the scenario image

Compact the JSON, expand only its build-time placeholder, and select the custom
base image in the generated Dockerfile. The runtime placeholders in the YAML
and shell files remain untouched.

```bash
export KRKNCTL_INPUT="$(jq -c . "$KRKN_DEV_PLUGIN_DIR/krknctl-input.json")"
envsubst '${KRKNCTL_INPUT}' \
  < "$KRKN_DEV_PLUGIN_DIR/Dockerfile.template" |
  sed "1s|^FROM .*|FROM $KRKN_BASE_IMAGE|" \
  > "$KRKN_DEV_PLUGIN_DIR/Dockerfile"

podman build \
  -f "$KRKN_DEV_PLUGIN_DIR/Dockerfile" \
  -t "$KRKN_SCENARIO_IMAGE" \
  "$KRKN_DEV_PLUGIN_DIR"

podman image inspect "$KRKN_SCENARIO_IMAGE" |
  jq '.[0].Config.Labels["krknctl.input_fields"] | fromjson'
podman run --rm --user 1001:1001 --entrypoint /bin/bash \
  "$KRKN_SCENARIO_IMAGE" -c 'test -x /home/krkn/run.sh'
```

{{% alert title="Tip: substitute build metadata without expanding runtime inputs" color="info" %}}
`jq -c` converts the descriptor array into one line. The single-quoted argument
to `envsubst` allows only `KRKNCTL_INPUT` to be expanded; it does not expand
runtime fields such as `WAIT_SECONDS`. `sed` replaces the template's first
`FROM` line with your custom base image. `fromjson` decodes the label back into
JSON so you can inspect the actual built artifact. The executable check must
exit successfully as UID and GID 1001, matching the operator's runner.
{{% /alert %}}

## Run against an existing Kind cluster

Set `KRKN_TEST_CLUSTER` to a running cluster you supply. This test does not
create or register an operator target.

Kind's host kubeconfig normally uses a loopback address. A container on the
`kind` network needs the internal API address instead. Save that kubeconfig
under your home directory so Podman Machine on macOS can mount it. The temporary
directory is private; the mounted file is readable by container UID 1001.

```bash
export KRKN_TEST_CLUSTER=kind
export KRKN_TEST_NAMESPACE=default

(
  set -e
  mkdir -p "$HOME/.kube"
  KRKN_TEST_CONFIG_DIR="$(mktemp -d "$HOME/.kube/krkn-dev-demo.XXXXXX")"
  trap 'rm -rf "$KRKN_TEST_CONFIG_DIR"' EXIT
  kind get kubeconfig --internal --name "$KRKN_TEST_CLUSTER" \
    > "$KRKN_TEST_CONFIG_DIR/config"
  chmod 644 "$KRKN_TEST_CONFIG_DIR/config"

  podman run --rm --user 1001:1001 --network kind \
    -e WAIT_SECONDS=2 \
    -e NAMESPACE="$KRKN_TEST_NAMESPACE" \
    -e KUBECONFIG=/home/krkn/.kube/config \
    -v "$KRKN_TEST_CONFIG_DIR/config:/home/krkn/.kube/config:ro" \
    --entrypoint /bin/bash \
    "$KRKN_SCENARIO_IMAGE" -c 'exec /home/krkn/run.sh'
)
```

{{% alert title="Tip: match the operator's startup conditions" color="info" %}}
`--network kind` makes the internal Kind API address reachable. Each `-e`
sets a container environment variable, while `-v host:container:ro` mounts the
kubeconfig read-only at the container path supplied in that argument.
`KUBECONFIG` tells the startup script where to read it. `--user 1001:1001`
tests non-root access. Overriding the entrypoint with `bash -c 'exec ...'`
executes `run.sh` directly, exposing a missing executable bit. `--rm` removes
the finished container; the subshell's `trap` removes only the generated
kubeconfig directory when the test exits.
{{% /alert %}}

On a Linux host with SELinux enforcing, use `:ro,Z` for this dedicated temporary
kubeconfig mount if a label denial prevents access.

For a non-Kind target, use a kubeconfig whose API endpoint is reachable from
the container. Replace `kind get kubeconfig ...` with
`kubectl --kubeconfig "$KUBECONFIG" config view --raw --flatten --minify` and
omit `--network kind`. Flattening embeds certificate files; an external
credential plugin still needs to be available in the image.

## Check both outcomes

For an existing namespace, expect container exit status `0` and a log block:

```text
##### DEVELOPMENT SCENARIO #####
Namespace: default
Pods:
  (none)
##### END DEVELOPMENT SCENARIO #####
```

Pod names replace `(none)` when the namespace contains pods. Set
`KRKN_TEST_NAMESPACE=dev-demo-missing-namespace` to a namespace you have
confirmed does not exist and repeat the test. Expect a nonzero exit status and
a concise missing-namespace error. Do not create that namespace as part of
this failure-path test.

**Next:** [Publish and run with Krkn Operator](/docs/developers-guide/custom-scenario/operator-lab/).
