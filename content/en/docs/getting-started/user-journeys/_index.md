---
title: Choose Your Path
description: Find the right Krkn setup for your goals — from a quick first run to multi-cluster resilience pipelines.
weight: 1
categories: [Getting Started]
tags: [docs]
---

Whether you're running your first chaos scenario or building a production resilience pipeline, there's a path here for you. Pick the journey that matches your experience level and goals — each one builds on the previous, so you can start simple and add complexity when you're ready.

**New to Krkn?** Start with [Basic Run](basic-run/) — no configuration files, no metrics, just run a scenario and see what happens.

**Familiar with the basics?** Add automatic pass/fail evaluation with [Metrics Validation](metrics-validation/), then layer in a [Resilience Score](resilience-score/) to get a percentage-based view of how your system held up.

**Running chaos regularly?** Move to [Long-Term Storage](long-term-storage/) to persist metrics across runs and spot regressions between releases.

**Operating at scale?** Use [Multi-Cluster Orchestration](multi-cluster/) to drive chaos across multiple clusters or cloud environments from a single control point.

| Journey | I want to... | Experience level | Tools needed |
|---|---|---|---|
| [Basic Run](basic-run/) | Inject chaos and observe results manually | Beginner | krknctl |
| [Metrics Validation](metrics-validation/) | Automatically pass/fail based on Prometheus metrics | Intermediate | krknctl + Prometheus |
| [Resilience Score](resilience-score/) | Generate a scored report to validate an environment | Intermediate | krknctl + Prometheus |
| [Long-Term Storage](long-term-storage/) | Store metrics across runs for regression analysis | Advanced | krknctl + Prometheus + Elasticsearch |
| [Multi-Cluster Orchestration](multi-cluster/) | Run chaos across multiple clusters or clouds | Advanced | krkn-operator |
