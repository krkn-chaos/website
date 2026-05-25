---
title: krknctl-assist
description: How to install and run krknctl-assist
tags: [docs]
weight: 6
---

## Install krknctl-assist

`krknctl-assist` is distributed from its Git repository and installed through a small wrapper script.

### Prerequisites

- `podman`
- `git`
- `curl`
- `python3`
- `go` 

### Clone the repository

```bash
git clone https://github.com/krkn-chaos/krknctl-assist.git ~/krknctl-assist
cd ~/krknctl-assist
```

### Install the launcher

```bash
bash ./scripts/install_krknctl_assist.sh
```

Verify installation:

```bash
krknctl-assist
```

## Run krknctl-assist

Start the interactive assistant:

```bash
krknctl assist run
```

{{% alert title="Note" %}}
The first run may take longer because the launcher can build the container image, prepare indexes, and set up a local `krknctl` checkout.
{{% /alert %}}

## Useful commands

Force a rebuild:

```bash
krknctl-assist --force-build
```

Clean up local containers:

```bash
krknctl-assist --cleanup
```

## What's next?

Please refer to the [usage guide](/docs/krknctl-assist/usage/) for example prompts and the interactive run flow.
