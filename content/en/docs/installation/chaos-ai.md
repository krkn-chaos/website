---
title: Chaos AI
description: How to install Chaos AI
tags: [docs]
weight: 4
---


## Installation

### Prerequisites

- Python 3.9+
- [krknctl](/docs/installation/krknctl.md)
- `uv` package manager (recommended) or `pip`

### Clone the Repository

To clone and use the latest krkn version follow the directions below. If you're wanting to contribute back to chaos ai in anyway in the future we recommend [forking the repository](#fork-and-clone-the-repository) first before cloning. 

```bash
$ git clone https://github.com/krkn-chaos/chaos-ai.git
$ cd chaos-ai 
```

### Fork and Clone the Repository
Fork the repository 
```bash
$ git clone https://github.com/<github_user_id>/chaos-ai.git
$ cd chaos-ai 
```

Set your cloned local to track the upstream repository:
```bash
cd chaos-ai
git remote add upstream https://github.com/krkn-chaos/chaos-ai
```

Disable pushing to upstream master:

```bash
git remote set-url --push upstream no_push
git remote -v
```


### Install the dependencies

To be sure that chaos ai's dependencies don't interfere with other python dependencies you may have locally, we recommend creating a virtual enviornment before installing the dependencies. We have only tested up to python 3.9

Using pip package manager:

```bash
$ python3.9 -m venv chaos
$ source chaos/bin/activate
$ pip install -e .

# Check if installation is successful
$ chaos_ai --help
```

Using uv package manager:
```bash
$ pip install uv
$ uv venv --python 3.9
$ source .venv/bin/activate
$ uv pip install -e .

#  Check if installation is successful
$ uv run chaos_ai --help
```

{{% alert title="Note" %}} Make sure python3-devel and latest pip versions are installed on the system. The dependencies install has been tested with pip >= 21.1.3 versions.{{% /alert %}}

### Getting Started with Chaos AI

To configure Chaos AI testing scenarios, check out [getting started](../chaos_ai/getting-started-chaos-ai.md) doc.
