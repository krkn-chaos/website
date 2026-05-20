---
title: "What's New in krkn-chaos — May 2026"
date: 2026-05-01
draft: false
description: "Monthly digest of updates across krkn-chaos repos"
tags: ["release-notes", "whats-new"]
categories: ["Articles"]
type: "blog"
---

Welcome to the May 2026 edition of "What's New in krkn-chaos"! This month has been incredibly productive across our ecosystem, with significant enhancements to our chaos orchestration and monitoring capabilities.

## 🚀 New Features

- **Krkn-AI Integration**: Introduced the first version of our AI-driven chaos scenario generator, allowing users to describe failure modes in natural language.
- **Operator Multi-cluster Support**: The Krkn-Operator now supports orchestration across multiple Kubernetes clusters from a single control plane.

## 🛠️ Improvements

- **Performance Boost in krknctl**: Optimized the resource discovery logic, resulting in 40% faster startup times for large clusters.
- **Enhanced Cerberus Metrics**: Added deep integration with Prometheus for real-time health monitoring of the chaos engine itself.
- **Hub Scenario Versioning**: Improved the Krkn-Hub UI to support better version selection for shared chaos scenarios.

## 🐛 Bug Fixes

- **Fixed Race Condition in Krkn**: Resolved a rare deadlock when multiple network chaos scenarios were executed simultaneously.
- **Cerberus Timeout Handling**: Improved how Cerberus handles transient API server timeouts during cluster health checks.
- **Operator CRD Validation**: Fixed a validation schema error in the Krkn-Operator CRDs that caused issues with newer Kubernetes versions.

---

*Stay tuned for more updates next month! For detailed changes, visit our [GitHub repositories](https://github.com/krkn-chaos).*
