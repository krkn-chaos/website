---
title: krknctl
date: 2017-01-05
description: >
  Krkn CLI - krknctl
categories: [Examples]
tags: [test, sample, docs]
weight: 1
---

## Overview:
`Krknctl` is a tool designed to run and orchestrate [krkn](krkn.md) chaos scenarios utilizing 
container images from the [krkn-hub](krkn-hub.md). 
Its primary objective is to streamline the usage of `krkn` by providing features like:

- Command auto-completion
- Input validation
- Scenario descriptions and detailed instructions

and much more, effectively abstracting the complexities of the container environment. 
This allows users to focus solely on implementing chaos engineering practices without worrying about runtime complexities.

## Requirements:
### Running:
#### Linux:
##### Dictionaries:
To generate the random words we use the american dictionary, it is often available but if that's not the case:
- **Fedora/RHEL**: `sudo dnf install words`
- **Ubuntu/Debian**: `sudo apt-get install wamerican`

### Building from sources:
#### Linux:
To build the only system package required is libbtrfs:

- **Fedora/RHEL**: `sudo dnf install btrfs-progs-devel`
- **Ubuntu/Debian**: `sudo apt-get install libbtrfs-dev`
#### MacOS:
- **gpgme**: `brew install gpgme` 

## Installation Build commands: 
`go build -tags containers_image_openpgp -ldflags="-w -s" -o bin/ ./...`

>[!NOTE]
> To build for different operating systems/architectures refer to `GOOS` `GOARCH` [golang variables](https://pkg.go.dev/internal/platform)

<br/>