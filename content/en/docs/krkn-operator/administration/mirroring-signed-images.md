---
title: Mirror Signed Images
description: Mirror signed scenario and workload images into a private registry
weight: 4
---

# Mirror Signed Images <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

For a private or disconnected environment, mirror **both** the scenario image and any helper workload image it launches. Copy their Cosign signatures with the images. A normal `docker pull`/`docker push`, `podman pull`/`podman push`, or image-only mirror can leave the signatures behind.

{{% notice warning %}}
Image signature verification is enabled by default. The Operator checks the scenario image against the Krkn public key before creating its pod. If the mirrored scenario has no valid signature, the run is rejected. A mirrored workload image also needs its signature when your cluster enforces signed images; the scenario must point to its private registry URL or the workload pod will try to pull from Quay.io.
{{% /notice %}}

The source repository is [quay.io/krkn-chaos/krkn-hub-multiarch](https://quay.io/repository/krkn-chaos/krkn-hub-multiarch?tab=tags). Its tags include scenarios such as `node-cpu-hog` and `pod-scenarios`, and helper images such as `workload-krkn-hog` and `workload-krkn-tools`. Choose the tags required by the scenarios you plan to run.

## Mirror directly between registries

On a machine that can reach Quay.io and your private registry, install Cosign and authenticate to the destination registry. The example mirrors `node-cpu-hog` and its `workload-krkn-hog` helper into the **same repository**. Replace the destination with your own registry host and repository.

```bash
SOURCE=quay.io/krkn-chaos/krkn-hub-multiarch
MIRROR=registry.example.com/chaos/krkn-hub-multiarch

cosign login registry.example.com
cosign copy "$SOURCE:node-cpu-hog" "$MIRROR:node-cpu-hog"
cosign copy "$SOURCE:workload-krkn-hog" "$MIRROR:workload-krkn-hog"
```

`cosign copy` carries the image and its associated signature artifacts. Repeat it for every scenario and workload tag you need. Preserve the tag names so the private registry's scenario list and the `IMAGE` override use the same names as the source. Do not use an image-only copy as a substitute.

For a fully disconnected registry, save the signed images on a connected machine, transfer the resulting directories through your approved transfer path, and load them into the destination registry:

```bash
# Connected machine
SOURCE=quay.io/krkn-chaos/krkn-hub-multiarch
cosign save --dir ./node-cpu-hog "$SOURCE:node-cpu-hog"
cosign save --dir ./workload-krkn-hog "$SOURCE:workload-krkn-hog"

# After transferring both directories to a machine with access to the private registry
MIRROR=registry.example.com/chaos/krkn-hub-multiarch
cosign login registry.example.com
cosign load --dir ./node-cpu-hog "$MIRROR:node-cpu-hog"
cosign load --dir ./workload-krkn-hog "$MIRROR:workload-krkn-hog"
```

`cosign save` and `cosign load` include the associated signatures; a container image tarball alone does not.

## Verify the mirror

On a connected staging machine, obtain the [Krkn Cosign public key](https://github.com/krkn-chaos/krknctl/blob/main/pkg/verify/cosign.pub) through a trusted channel, then verify **both destination images**:

```bash
MIRROR=registry.example.com/chaos/krkn-hub-multiarch
curl -fsSLo cosign.pub https://raw.githubusercontent.com/krkn-chaos/krknctl/main/pkg/verify/cosign.pub
cosign verify --key cosign.pub --insecure-ignore-tlog=true "$MIRROR:node-cpu-hog"
cosign verify --key cosign.pub --insecure-ignore-tlog=true "$MIRROR:workload-krkn-hog"
```

Krkn uses key-based signatures, so the `--insecure-ignore-tlog=true` option skips the transparency-log check while Cosign still checks the public key and signed image digest. If verification fails, inspect the destination registry's support for Cosign signature artifacts and copy the signed image again. Do not re-sign a changed image with an unrelated key: the Operator trusts the Krkn key.

## Configure the Operator and workload override

1. In [Registry Management](../registry-management/), create a private registry with **Registry URL** `registry.example.com` and **Scenario Repository** `chaos/krkn-hub-multiarch`. Configure credentials, TLS, and group visibility as needed.
2. In [Run Scenarios](../../usage/run-scenarios/), select that registry and choose `node-cpu-hog`. The Operator resolves and verifies the mirrored scenario image before running it.
3. In the scenario's parameter form, override **`IMAGE`** with `registry.example.com/chaos/krkn-hub-multiarch:workload-krkn-hog`. This is the helper pod image used by `node-cpu-hog`; selecting the private scenario registry does **not** rewrite this parameter automatically.

Other scenarios may launch different helper images. For example, `network-chaos` uses `workload-krkn-tools`, and `pod-network-filter` uses `workload-krkn-network-chaos`. Mirror the matching `workload-*` tag with Cosign and set that scenario's `IMAGE` parameter to its private URL. Consult the selected scenario's parameters and the [source tag list](https://quay.io/repository/krkn-chaos/krkn-hub-multiarch?tab=tags) for the exact image.

## If a run does not start

- **Scenario missing from the list:** confirm its tag exists in the configured scenario repository and the user can access that registry.
- **Unsigned or untrusted scenario:** confirm the image and signature were copied together, then verify the destination tag with the Krkn public key. A changed image digest invalidates the original signature.
- **Workload pod cannot pull its image:** check the `IMAGE` override, the target cluster's access to the private registry, and its pull credentials and TLS configuration.
