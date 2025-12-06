---
title: Setting Up Disconnected Enviornment
# date: 2017-01-05
description: Getting Your Disconnected Enviornment Set Up
weight : 2
categories: [Best Practices, Placeholders]
tags: [docs]
---

## Getting Started Running Chaos Scenarios in a Disconnected Enviornment 

### Mirror following images on the bastion host
- **quay.io/krkn-chaos/krkn-hub:node-scenarios-bm** - Master/worker node disruptions on baremetal
- **quay.io/krkn-chaos/krkn-hub:network-chaos** - Network disruptions/traffic shaping
- **quay.io/krkn-chaos/krkn-hub:pod-scenarios** - Pod level disruptions and evaluating recovery time/availability
- **quay.io/krkn-chaos/krkn-hub:syn-flood** - Generates substantial amount of traffic/half open connections targeting a service
- **quay.io/krkn-chaos/krkn-hub:node-cpu-hog** - Hogs CPU on the target nodes
- **quay.io/krkn-chaos/krkn-hub:node-io-hog** - Hogs IO on the target nodes
- **quay.io/krkn-chaos/krkn-hub:node-memory-hog** - Hogs memory on the target nodes
- **quay.io/krkn-chaos/krkn-hub:pvc-scenarios** - Fills up a given PersistentVolumeClaim
- **quay.io/krkn-chaos/krkn-hub:service-hijacking** - Simulates fake HTTP response for a service
- **quay.io/krkn-chaos/krkn-hub:power-outages** - Shuts down the cluster and turns it back on
- **quay.io/krkn-chaos/krkn-hub:container-scenarios** - Kills a container via provided kill signal
- **quay.io/krkn-chaos/krkn-hub:application-outages** - Isolates application Ingress/Egress traffic
- **quay.io/krkn-chaos/krkn-hub:time-scenarios** - Tweaks time/date on the nodes
- **quay.io/krkn-chaos/krkn-hub:pod-network-chaos** - Introduces network chaos at pod level 
- **quay.io/krkn-chaos/krkn-hub:node-network-filter** - Node ip traffic filtering 
- **quay.io/krkn-chaos/krkn-hub:pod-network-filter** - DNS, internal/external service outages



### Will also need these mirrored images inside the cluster 
- Network disruptions - **quay.io/krkn-chaos/krkn:tools**
- Hog scenarios ( CPU, Memory and IO ) - **quay.io/krkn-chaos/krkn-hog**
- SYN flood - **quay.io/krkn-chaos/krkn-syn-flood:latest**
- Pod network filter scenarios - **quay.io/krkn-chaos/krkn-network-chaos:latest**
- Service hijacking scenarios - **quay.io/krkn-chaos/krkn-service-hijacking:v0.1.3**


## How to Mirror

The strategy is simple:

1. Pull & Save: On a machine with internet access, pull the desired image from quay.io and use podman save to package it into a single archive file (a .tar file).

2. Transfer: Move this archive file to your disconnected cluster node using a method like a USB drive, a secure network file transfer, or any other means available.

3. Load: On the disconnected machine, use podman load to import the image from the archive file into the local container storage. The cluster's container runtime can then use it.


## Step-by-Step Instructions
Here’s a practical example using the quay.io/krkn-chaos/krkn-hub image.

#### Step 1: On the Connected Machine (Pull and Save)
First, pull the image from quay.io and then save it to a tarball.

Pull the image:
```bash
podman pull quay.io/krkn-chaos/krkn-hub:pod-scenarios
```

Save the image to a file: The -o or --output flag specifies the destination file.

```bash
podman save -o pod-scenarios.tar quay.io/krkn-chaos/krkn-hub:pod-scenarios
```

After this command, you will have a file named *pod-scenarios.tar* in your current directory.

{{< notice type="info" >}}
Tip: You can save multiple images into a single archive to be more efficient.
```bash
podman save -o krkn-hub-images.tar quay.io/krkn-chaos/krkn-hub:pod-scenarios quay.io/krkn-chaos/krkn-hub:pod-network-chaos
```
{{< /notice >}}
#### Step 2: Transfer the Archive File
Move the pod-scenarios.tar file from your connected machine to a node within your disconnected cluster.

SCP (Secure Copy Protocol): If you have a secure, intermittent connection or bastion host.

```bash
scp ./pod-scenarios.tar user@disconnected-node-ip:/path/to/destination/
```


#### Step 3: On the Disconnected Machine (Load and Verify)
Once the file is on the disconnected machine, use podman load to import it.

Load the image: The -i or --input flag specifies the source archive.

```bash
podman load -i pod-scenarios.tar
```

Podman will read the tarball and restore the image layers into its local storage.

Verify the image is loaded: Check that the image now appears in your local image list.

```bash
podman images
```
You should see quay.io/krkn-chaos/krkn-hub in the output, ready to be used by your applications. 👍

```plaintext
REPOSITORY                       TAG      IMAGE ID      CREATED        SIZE
- quay.io/krkn-chaos/krkn-hub    pod-scenarios  b1a13a82513f  3 weeks ago    220 MB
```

The image is now available locally on that node for your container runtime (like CRI-O in OpenShift/Kubernetes) to create containers without needing to reach the internet. You may need to repeat this loading process on every node in the cluster that might run the container, or push it to a private registry within your disconnected environment.