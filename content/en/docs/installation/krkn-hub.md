---
title: krkn-hub
date: 2017-01-05
description: >
  Krkn-hub aka kraken-hub
categories: [Examples]
tags: [test, sample, docs]
weight: 2
---

<!-- {{% pageinfo %}}
Krkn-hub aka kraken-hub
{{% /pageinfo %}} -->

Hosts container images and wrapper for running scenarios supported by [Krkn](https://github.com/krkn-chaos/krkn/), a chaos testing tool for Kubernetes clusters to ensure it is resilient to failures. All we need to do is run the containers with the respective environment variables defined as supported by the scenarios without having to maintain and tweak files!

## Set Up

You can use docker or podman to run kraken-hub

Install Podman your certain operating system based on these [instructions](https://podman.io/docs/installation)

or

Install [Docker](https://docs.docker.com/engine/install/) on your system.

Docker is also supported but all variables you want to set (separate from the defaults) need to be set at the command line In the form `-e <VARIABLE>=<value>`

You can take advantage of the [get_docker_params.sh](https://github.com/krkn-chaos/krkn-hub/blob/main/get_docker_params.sh) script to create your parameters string This will take all environment variables and put them in the form "-e =" to make a long string that can get passed to the command

For example: `docker run $(./get_docker_params.sh) --net=host -v <path-to-kube-config>:/home/krkn/.kube/config:Z -d quay.io/redhat-chaos/krkn-hub:power-outages`

{{% alert title="Tip" %}}Because the container runs with a non-root user, ensure the kube config is globally readable before mounting it in the container. You can achieve this with the following commands: `kubectl config view --flatten > ~/kubeconfig && chmod 444 ~/kubeconfig && docker run $(./get_docker_params.sh) --name=<container_name> --net=host -v ~kubeconfig:/home/krkn/.kube/config:Z -d quay.io/krkn-chaos/krkn-hub:<scenario>` {{% /alert %}}