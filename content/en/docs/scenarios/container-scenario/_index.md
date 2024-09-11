---
title: Container Scenarios
description: 
date: 2017-01-04
weight: 1
---

Kraken uses the `oc exec` command to `kill` specific containers in a pod.
This can be based on the pods namespace or labels. If you know the exact object you want to kill, you can also specify the specific container name or pod name in the scenario yaml file.
These scenarios are in a simple yaml format that you can manipulate to run your specific tests or use the pre-existing scenarios to see how it works.