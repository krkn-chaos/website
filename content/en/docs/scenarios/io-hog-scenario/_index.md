---
title: IO Hog Scenario
description: 
date: 2017-01-04
weight: 1
---

This scenario is based on the arcaflow [arcaflow-plugin-stressng](https://github.com/arcalot/arcaflow-plugin-stressng) plugin. 
The purpose of this scenario is to create disk pressure on a particular node of the Kubernetes/OpenShift cluster for a time span.
The scenario allows to attach a node path to the pod as a `hostPath` volume.