---
title: Scenario Image Contract
description: Define discoverable scenario images with OCI labels and krknctl input descriptors.
weight: 40
categories: [Developers Guide]
tags: [docs, containers, metadata]
---

Krknctl and Krkn Operator discover scenario definitions from container image
metadata. To add a custom scenario, publish an image with the expected labels
and configure its registry in the client. You do not need to add the scenario
to krknctl's source code when the existing input types cover its parameters.

The [packaging lab](/docs/developers-guide/custom-scenario/package-and-test/)
builds this contract without rebuilding krkn-hub. The definitions are implemented
in krknctl's [input field parser](https://github.com/krkn-chaos/krknctl/blob/main/pkg/typing/field.go)
and [type validators](https://github.com/krkn-chaos/krknctl/blob/main/pkg/typing/types.go).

## Image labels

- **`krknctl.is_a_scenario`** identifies scenario images when set to `"true"`.
- **`krknctl.title`** and **`krknctl.description`** describe the scenario.
- **`krknctl.input_fields`** contains a JSON array of field descriptors.
- **`krknctl.kubeconfig_path`** appears in the companion image as metadata.
  The clients used in this lab do not read it to configure the kubeconfig mount.
  Set the [runtime mount path](#kubeconfig-mount-path) independently.
- **`krknctl.privileged`** declares a privilege requirement. It is not an RBAC
  grant; actual permissions depend on the client, runtime, and target credentials.
- **`krknctl.has_rollback`** describes rollback capability. Set it to match
  implemented behavior, not to indicate an intended future feature.

The base image can also supply global input labels such as
`krknctl.input_fields.global`. Keep scenario-specific fields in the scenario
label rather than copying every framework setting into it.

Image labels are build artifacts. Changing a JSON file on disk does not change
the published label until the scenario image is rebuilt and pushed.

## Input field descriptors {#add-krknctl-input-json}

`krknctl-input.json` contains an array, not a JSON Schema object with
`properties`. A typical field is:

```json
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
```

For ordinary input fields, `name`, `variable`, and `type` are required by the
parser. `short_description` supplies the display label; `description` supplies
help text. `variable` must exactly match the environment variable consumed by
the image's startup code.

The descriptor format uses strings for `required`, `secret`, and `default`,
including numeric and boolean defaults. Use `"required": "true"`, not the
JSON boolean `true`. Omit an optional property when it is not needed.

### Supported input types

- **`string`** accepts text and can apply a `validator` regular expression with
  a custom `validation_message`.
- **`number`** validates a numeric value. Enforce application-specific integer
  constraints, ranges, and units in the runtime implementation as well.
- **`boolean`** represents a boolean input; it still reaches the container as
  a string environment value.
- **`enum`** restricts values using `allowed_values` and `separator`.
- **`file`** describes a file input with a container `mount_path`.
- **`file_base64`** describes file content encoded for a consuming script or
  application. Use this exact type name, not `file64`.
- **`group`** supplies presentation metadata for a group of related fields.
  It is metadata rather than a value injected as a normal input.

Example number and enum descriptors:

```json
[
  {
    "name": "wait",
    "short_description": "Wait (seconds)",
    "variable": "WAIT_SECONDS",
    "type": "number",
    "default": "2",
    "required": "false"
  },
  {
    "name": "mode",
    "short_description": "Mode",
    "variable": "MODE",
    "type": "enum",
    "allowed_values": "list,inspect",
    "separator": ",",
    "default": "list",
    "required": "true"
  }
]
```

An input file path is a container path, not a path on the user's workstation:

```json
{
  "name": "settings",
  "short_description": "Settings file",
  "variable": "SETTINGS_FILE",
  "type": "file",
  "mount_path": "/home/krkn/settings.yaml",
  "required": "true"
}
```

Keep defaults in the input metadata and runtime defaults consistent. Client
validation improves feedback, but direct `podman run -e ...` bypasses it. Validate
all values again before performing scenario actions.

## Runtime compatibility

For Krkn Operator `1.1.2`, provide `/bin/bash` and an executable
`/home/krkn/run.sh`. The controller invokes that script directly, mounts the
target kubeconfig, injects environment variables, and records the exit status.
Do not rely only on a custom OCI `ENTRYPOINT` being honored by every client.

The script can launch Krkn or another implementation that obeys the same
runtime contract. It must read the declared inputs, use the configured file
paths, and exit with a meaningful status. For the Krkn plugin path, return
`0` or `1` from the plugin and preserve the engine's process status with `exec`.

### Kubeconfig mount path

Krkn Operator selects the container mount path from the run's
`spec.kubeconfigPath` (`kubeconfigPath` in the API request). When omitted, it
uses the krknctl configuration default, `/home/krkn/.kube/config` in this lab.
Krknctl also uses its own configured `kubeconfig_path` for the mount destination;
the image label does not override that setting.

For a custom path, configure the client's mount destination and make the
startup script read the same path. The demo's script reads `KUBECONFIG` and
writes it into `kraken.kubeconfig_path`, so update that environment value or
the script's default as well. Changing `spec.kubeconfigPath` moves the mount;
it does not rewrite the script or the Krkn YAML. Changing only the image label
does neither.

See the operator's [mount-path selection](https://github.com/krkn-chaos/krkn-operator/blob/dfdf002f4643a53ec035fde6705fec4fee4e23d9/internal/controller/krknscenariorun_controller.go#L503-L507)
and krknctl's [default configuration](https://github.com/krkn-chaos/krknctl/blob/051b77cb0ba7eb4efbda77e7197cbf87fd4d0336/pkg/config/config.json).

## Inspect the built contract

```bash
podman image inspect "$KRKN_SCENARIO_IMAGE" |
  jq '.[0].Config.Labels | {
    scenario: .["krknctl.is_a_scenario"],
    title: .["krknctl.title"],
    inputs: (.["krknctl.input_fields"] | fromjson)
  }'
```

Verify discovery, input rendering, runtime validation, and execution separately.
An HTTP-enabled registry client can successfully read these labels while the
node runtime still fails to pull the image. See
[the registry lab](/docs/developers-guide/custom-scenario/operator-lab/).
