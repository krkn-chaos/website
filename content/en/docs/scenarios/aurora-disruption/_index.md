---
title: Aurora Disruption Scenario
description: 
date: 2017-01-04
weight: 3
---

This scenario blocks a pod's outgoing MySQL and PostgreSQL traffic, effectively preventing it from connecting to any AWS Aurora SQL engine. It works just as well for standard MySQL and PostgreSQL connections too.

This uses the pod network filter scenario but set with specific parameters to disrupt aurora 