---
title: Publishing Through Krkn-hub
description: Add a scenario to the community image collection after validating its standalone image contract.
weight: 80
categories: [Developers Guide]
tags: [docs, contributions, containers]
---

Krkn-hub maintains the community collection of packaged scenario images. Add
your scenario there when you want it distributed through that collection.
The [custom scenario lab](/docs/developers-guide/custom-scenario/) builds and
publishes its own image directly, so it does not require changes to this
repository.

Before contributing packaging, validate the Python plugin, configuration
template, metadata, and executable startup script. Use the
[testing guide](/docs/developers-guide/testing-changes/) to cover success and
failure paths.

## Add the scenario package

Create a scenario directory in
[krkn-hub](https://github.com/krkn-chaos/krkn-hub) using a neighboring scenario
as a reference. A package normally includes:

- A scenario YAML template whose configurable values come from environment
  variables.
- `env.sh` with documented runtime defaults.
- An executable `run.sh` that prepares configuration and starts Krkn.
- `krknctl-input.json` describing the scenario-specific inputs.
- `Dockerfile.template` with the scenario labels and required files.

Keep the names consistent across the JSON descriptor's `variable`, shell
defaults, YAML placeholders, and plugin configuration fields. The template file
name used by `run.sh` must match the actual file copied into the image.

The base image must already contain the Python plugin and its dependencies.
Packaging a new scenario type on a base image that predates the plugin will
produce a discoverable image that fails at engine startup.

## Connect the build

Follow the build conventions in the checked-out krkn-hub revision. In the
repository's template and Compose workflow, this includes registering the
scenario directory in `build.sh` and adding its service to `docker-compose.yaml`.
Use generated Dockerfiles in the build and confirm that the input JSON is
embedded in the final image labels.

Only add shared defaults or main-configuration variables to the root templates
when the behavior is shared across scenarios. A scenario-specific field belongs in
its own package.

See the repository's [build script](https://github.com/krkn-chaos/krkn-hub/blob/main/build.sh)
and [application outages package](https://github.com/krkn-chaos/krkn-hub/tree/main/application-outages)
for the current layout. Avoid instructions that depend on fixed source line
numbers; the surrounding scripts evolve.

## Complete the contribution

Build and test the selected scenario image before running a collection-wide
build. Confirm that it works through the intended clients and that runtime
permissions match the scenario's needs. Official release publishing also
includes the project's image signing and distribution process.

Add a scenario page under `content/en/docs/scenarios/` in the website and follow
the website's scenario marker conventions. Document inputs, target permissions,
expected disruption, recovery behavior, and the meaningful success condition.

Use the [contribution guidelines](/docs/contribution-guidelines/) for the
related code and documentation pull requests. Changes to krknctl itself are
needed when extending client behavior or the type system, rather than simply
introducing another image that uses the existing contract.
