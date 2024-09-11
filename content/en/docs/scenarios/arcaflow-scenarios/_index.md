---
title: Arcaflow Scenarios
description: 
date: 2017-01-04
weight: 1
---

Arcaflow is a workflow engine in development which provides the ability to execute workflow steps in sequence, in parallel, repeatedly, etc. The main difference to competitors such as Netflix Conductor is the ability to run ad-hoc workflows without an infrastructure setup required.

The engine uses containers to execute plugins and runs them either locally in Docker/Podman or remotely on a Kubernetes cluster. The workflow system is strongly typed and allows for generating JSON schema and OpenAPI documents for all data formats involved.

### Available Scenarios
#### Hog scenarios:
- [CPU Hog](/docs/scenarios/cpu-hog-scenario/_index.md)
- [Memory Hog](/docs/scenarios/memory-hog-scenario/_index.md)
- [I/O Hog](/docs/scenarios/io-hog-scenario/_index.md)

### Prequisites
Arcaflow supports three deployment technologies:
- Docker
- Podman
- Kubernetes

#### Docker
In order to run Arcaflow Scenarios with the Docker deployer, be sure that:
- Docker is correctly installed in your Operating System (to find instructions on how to install docker please refer to [Docker Documentation](https://www.docker.com/))
- The Docker daemon is running

#### Podman
The podman deployer is built around the podman CLI and doesn't need necessarily to be run along with the podman daemon.
To run Arcaflow Scenarios in your Operating system be sure that:
- podman is correctly installed in your Operating System (to find instructions on how to install podman refer to [Podman Documentation](https://podman.io/))
- the podman CLI is in your shell PATH

#### Kubernetes
The kubernetes deployer integrates directly the Kubernetes API Client and needs only a valid kubeconfig file and a reachable Kubernetes/OpenShift Cluster.
