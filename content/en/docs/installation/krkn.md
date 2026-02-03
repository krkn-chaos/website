---
title: Krkn
date: 2017-01-05
description: >
  Krkn aka Kraken
categories: [Examples]
tags: [test, sample, docs]
weight: 1
---

## Installation

### Clone the Repository
To clone and use the latest krkn version follow the directions below. If you're wanting to contribute back to krkn in anyway in the future we recommend [forking the repository](#fork-and-clone-the-repository) first before cloning. 

See the latest release version [here](https://github.com/krkn-chaos/krkn/releases)
```bash
$ git clone https://github.com/krkn-chaos/krkn.git --branch <release version>
$ cd krkn 
```

### Fork and Clone the Repository
Fork the repository 
```bash
$ git clone https://github.com/<github_user_id>/krkn.git
$ cd krkn 
```

Set your cloned local to track the upstream repository:
```bash
cd krkn
git remote add upstream https://github.com/krkn-chaos/krkn
```

Disable pushing to upstream master:

```bash
git remote set-url --push upstream no_push
git remote -v
```


### Install the dependencies
To be sure that krkn's dependencies don't interfere with other python dependencies you may have locally, we recommend creating a virtual environment before installing the dependencies. We have only tested up to python 3.9
```bash
$ python3.9 -m venv chaos
$ source chaos/bin/activate
```

```bash
$ pip install -r requirements.txt
```
{{% alert title="Note" %}} Make sure python3-devel and latest pip versions are installed on the system. The dependencies install has been tested with pip >= 21.1.3 versions.{{% /alert %}}
Where can your user find your project code? How can they install it (binaries, installable package, build from source)? Are there multiple options/versions they can install and how should they choose the right one for them?

### Getting Started with Krkn
If you are wanting to try to edit your configuration files and scenarios see [getting started](../getting-started/getting-started-krkn.md) doc 


### Running Krkn

```bash
$ python run_kraken.py --config <config_file_location>
```

### Run containerized version

[Krkn-hub](/docs/installation/krkn-hub.md) is a wrapper that allows running Krkn chaos scenarios via podman or docker runtime with scenario parameters/configuration defined as environment variables.

[krknctl](/docs/installation/krknctl.md) is a CLI that allows running Krkn chaos scenarios via podman or docker runtime with scenarios parameters/configuration passed as command line options or a json graph for complex workflows.


### What's next?
Please refer to the [getting started guide](/docs/getting-started/_index.md), pick the [scenarios](/docs/scenarios/_index.md) of interest and follow the instructions to run them via Krkn, Krkn-hub or Krknctl. Running via Krkn-hub or Krknctl are recommended for ease of use and better user experience.
