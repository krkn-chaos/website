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

#### Git 
###### Clone the repository
```bash
$ git clone https://github.com/krkn-chaos/krkn.git --branch <release version>
$ cd krkn 
```
###### Install the dependencies

```bash
$ python3.9 -m venv chaos
$ source chaos/bin/activate
$ pip3.9 install -r requirements.txt
```
{{% alert title="Note" %}} Make sure python3-devel and latest pip versions are installed on the system. The dependencies install has been tested with pip >= 21.1.3 versions.{{% /alert %}}
Where can your user find your project code? How can they install it (binaries, installable package, build from source)? Are there multiple options/versions they can install and how should they choose the right one for them?

## Running Krkn

```bash
$ python3.9 run_kraken.py --config <config_file_location>
```

## Run containerized version

[Krkn-hub](/docs/installation/krkn-hub.md) is a wrapper that allows running Krkn chaos scenarios via podman or docker runtime with scenario parameters/configuration defined as environment variables.