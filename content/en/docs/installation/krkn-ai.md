---
title: Krkn-AI
description: How to install Krkn-AI
tags: [docs]
weight: 4
---


## Installation

### Prerequisites

- Python 3.9+
- Podman or Docker Container Runtime
- [krknctl](/docs/installation/krknctl.md)
- `uv` package manager (recommended) or `pip`

### Clone the Repository

To clone and use the latest krkn version follow the directions below. If you're wanting to contribute back to Krkn-AI in anyway in the future we recommend [forking the repository](#fork-and-clone-the-repository) first before cloning. 

```bash
$ git clone https://github.com/krkn-chaos/krkn-ai.git
$ cd krkn-ai
```

### Fork and Clone the Repository
Fork the repository 
```bash
$ git clone https://github.com/<github_user_id>/krkn-ai.git
$ cd krkn-ai
```

Set your cloned local to track the upstream repository:
```bash
cd krkn-ai
git remote add upstream https://github.com/krkn-chaos/krkn-ai
```

Disable pushing to upstream master:

```bash
git remote set-url --push upstream no_push
git remote -v
```


### Install the dependencies

To be sure that Krkn-AI's dependencies don't interfere with other python dependencies you may have locally, we recommend creating a virtual environment before installing the dependencies. We have only tested up to python 3.9

Using pip package manager:

```bash
$ python3.9 -m venv .venv
$ source .venv/bin/activate
$ pip install -e .

# Check if installation is successful
$ krkn_ai --help
```

Using uv package manager:
```bash
$ pip install uv
$ uv venv --python 3.9
$ source .venv/bin/activate
$ uv pip install -e .

#  Check if installation is successful
$ uv run krkn_ai --help
```

{{% alert title="Note" %}} Make sure python3-devel and latest pip versions are installed on the system. The dependencies install has been tested with pip >= 21.1.3 versions.{{% /alert %}}

### Getting Started with Krkn-AI

To configure Krkn-AI testing scenarios, check out [getting started](../krkn_ai/getting-started-krkn-ai.md) doc.
