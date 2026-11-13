---
title: Troubleshooting the Demo
description: Diagnose discovery, registry transport, image startup, kubeconfig, and plugin failures at the layer that owns them.
weight: 40
categories: [Developers Guide]
tags: [docs, tutorial, troubleshooting]
---

First determine whether the scenario was discovered, whether its image was
pulled, and whether its process started. These are separate checkpoints.
Kubernetes events explain scheduling and pull failures; container logs explain
startup and plugin failures.

## The scenario is visible, but the pull attempts HTTPS

Typical event:

```text
http: server gave HTTP response to HTTPS client
```

The operator's registry client successfully used HTTP to list metadata. Kubelet
then asked containerd to pull the image, and containerd defaulted to HTTPS.
Krknctl's `insecure` setting does not configure the node runtime.

Check all three items on the **management node where the scenario Pod runs**:

1. The effective containerd registry `config_path` is `/etc/containerd/certs.d`.
2. `/etc/containerd/certs.d/$KRKN_REGISTRY_URL/hosts.toml` exists and uses
   `http://` for both the server and host entry.
3. The registry host and port exactly match the Pod's image reference.

```bash
podman exec "$KRKN_MGMT_NODE" containerd --version
podman exec "$KRKN_MGMT_NODE" cat /etc/containerd/config.toml
podman exec "$KRKN_MGMT_NODE" \
  cat "/etc/containerd/certs.d/$KRKN_REGISTRY_URL/hosts.toml"
```

The lab uses this containerd 2 section:

```toml
[plugins."io.containerd.cri.v1.images".registry]
  config_path = "/etc/containerd/certs.d"
```

Containerd 1 uses `plugins."io.containerd.grpc.v1.cri".registry` instead. Match
the runtime you actually run; copying the older plugin key into a containerd 2
configuration can leave the intended registry configuration inactive.

### Repair an existing node

If the containerd 2 registry section above is **absent**, append it once and
restart containerd on the affected demo node:

```bash
printf '\n[plugins."io.containerd.cri.v1.images".registry]\n  config_path = "/etc/containerd/certs.d"\n' |
  podman exec -i "$KRKN_MGMT_NODE" sh -c 'cat >> /etc/containerd/config.toml'
podman exec "$KRKN_MGMT_NODE" systemctl restart containerd
```

If the section already exists with a different value, edit that section rather
than appending a duplicate TOML table. Then write the
[registry hosts file](/docs/developers-guide/custom-scenario/operator-lab/#3-configure-image-pulls-on-the-management-node).
Hosts-file edits are read dynamically once `config_path` is active.

A Pod already in `ImagePullBackOff` may take several minutes to retry. During
the lab, restarting kubelet on the dedicated node cleared that wait:

```bash
podman exec "$KRKN_MGMT_NODE" systemctl restart kubelet
```

Waiting for the normal retry is also valid. Confirm a new **Pulled** event;
an old HTTPS failure remains in the event history after a successful recovery.

See [containerd registry configuration](https://github.com/containerd/containerd/blob/main/docs/cri/registry.md)
and [registry host files](https://github.com/containerd/containerd/blob/main/docs/hosts.md).

## The pull reaches HTTP but returns 401

Transport is now working; authentication still needs checking. Verify the
saved registry credentials and the Pod's `imagePullSecrets`. The authentication
key in the secret must match the registry host and port in the image reference.
A login to `localhost:5001` in Podman does not automatically configure a
Kubernetes pull secret for the node hostname.

Update credentials through **Settings → Private Registries**. Do not put
passwords in `hosts.toml` or paste decoded pull secrets into logs. The operator
supplies authentication through the pull secret; the node configuration
supplies the transport.

## `/home/krkn/run.sh: Permission denied`

The operator invokes `/home/krkn/run.sh` directly. A script with mode `0644`
can work when passed to `bash` locally and still fail in the operator Pod.

Use this Dockerfile instruction, then rebuild and push the scenario image:

```dockerfile
COPY --chmod=0755 --chown=krkn:krkn run.sh /home/krkn/run.sh
```

Verify the built artifact as the operator's user:

```bash
podman run --rm --user 1001:1001 --entrypoint /bin/bash \
  "$KRKN_SCENARIO_IMAGE" -c 'test -x /home/krkn/run.sh'
```

Start a new run and inspect its digest. Fixing the file on the host does not
change an already built image, and pushing a new tag value does not rewrite
an existing Pod's image reference.

## Krkn looks for `/root/.kube/config`

Setting `KUBECONFIG` does not override an explicit
`kraken.kubeconfig_path` in the Krkn YAML configuration. The demo's startup
script sets that configuration key from `KUBECONFIG` and defaults it to
`/home/krkn/.kube/config`.

Align the mounted path, the environment variable, and the main Krkn
configuration. In the operator, the mount destination comes from the run's
`spec.kubeconfigPath` or the configured default, `/home/krkn/.kube/config` in
this lab. The image's `krknctl.kubeconfig_path` label does not control the mount.
For a custom path, update the run configuration and the startup script's
`KUBECONFIG` value together. Running the container as root can change a
home-directory fallback, which is why the demo uses an explicit path and tests
startup as UID 1001.

## The kubeconfig works on the host but not in the container

`127.0.0.1` inside a container refers to that container. For a Kind target,
generate the kubeconfig with `kind get kubeconfig --internal --name ...` and
attach the test container to the `kind` network. For another target, use an API
endpoint reachable from the container and include the required certificates.

If the host API port changed after a Podman Machine restart, start the stopped
Kind node and refresh the host kubeconfig:

```bash
podman start "$KRKN_MGMT_NODE"
kind export kubeconfig --name "$KRKN_MGMT_CLUSTER"
```

Use the stable node hostname for the registry URL. If an old registry entry
contains a numeric IP, update its URL in the console and write a matching
`hosts.toml`. Do not change the target's kubeconfig just to repair a registry URL.

## The plugin is not discovered

Inspect Krkn's factory logs. Verify the `dev_demo` package and `__init__.py`,
the `dev_demo_scenario_plugin.py` module, the `DevDemoScenarioPlugin` class,
and both abstract methods. The configuration type must be
`dev_demo_scenarios` and must not collide with another plugin.

If source edits appear to have no effect, rebuild the **base image** containing
the Python plugin before rebuilding the scenario image. The upstream Krkn
Dockerfile clones its own source and does not automatically include your local
plugin checkout.

## The image is pushed but missing from scenario selection

Check the selected registry, repository (`demo/krkn-hub`), and tag (`dev-demo`).
Inspect the image for `krknctl.is_a_scenario="true"` and valid JSON in
`krknctl.input_fields`. A repository path is not a scenario name.

An unsigned custom image can also be blocked by signature verification. The
lab's override is configured on the operator, not in the plugin or image label.
Keep it scoped to the dedicated lab installation.

## The process starts and reports a missing namespace

This is the demo's expected failure path: image discovery, pull, startup, and
configuration injection have already succeeded. Check the selected target and
namespace. Namespace existence is evaluated in the **target cluster**, not
necessarily in the management cluster hosting the Pod.

For an existing namespace, verify that the target credentials allow listing
namespaces and pods. An existing namespace with no pods should return success.
