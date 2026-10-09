---
title: "Krkn Operator 1.1: From Chaos Runs to Resilience Insights"
description: "Krkn Operator 1.1 brings richer workflow authoring, resiliency history, telemetry exploration, safer operations, and broader distribution to Kubernetes and OpenShift teams."
date: 2026-10-07
slug: krkn-operator-1-1
url: /blog/articles/krkn-operator-1-1/
tags:
  - Krkn Operator
  - Chaos Engineering
  - Kubernetes
  - OpenShift
---

Chaos engineering is most useful when it becomes a repeatable engineering practice: teams can define an experiment, run it against the right clusters, understand what happened, and compare the results over time. The Krkn Operator 1.1 release moves the project further in that direction.

This release combines improvements in the [Krkn Operator](https://github.com/krkn-chaos/krkn-operator) with a major expansion of the [Krkn Operator Console](https://github.com/krkn-chaos/krkn-operator-console). Together, they make it easier to create and replay experiments, organize results, investigate telemetry, and operate the platform safely in production-like environments.


## Build and replay experiments visually

Chaos Studio now supports a more complete workflow lifecycle. Teams can compose graph-based workflows, save and reload them, and export a graph run for reuse or review. JSON workflow import makes it possible to bring existing definitions into the console instead of rebuilding them by hand.

The authoring experience is also more resilient. Autosave and recovery help protect work in progress, global parameters are carried through workflow configuration, and scenario categories can be retained when a workflow is saved or replayed. When an experiment needs to be run again, replay flows preserve the relevant configuration and handle missing scenario jobs more gracefully.

Once a run starts, the console presents it as a job with clearer actions and status information. Failed jobs expose diagnostics and logs directly, and retry handling now supports configurable maximum retries. This gives engineers a better path from a failed experiment to a controlled rerun.

## Organize chaos with categories

Krkn Operator 1.1 adds first-class category management across the API and console. Administrators can create and manage categories, associate them with runs, and use them to organize experiments around applications, environments, teams, or resilience goals.

Categories are also the foundation for the new resiliency history experience. Access control is applied when categories and cluster results are queried, so users see the history they are authorized to view rather than an unfiltered global dataset.

## Track resiliency over time

Single-run resiliency scores now connect to a historical view. The resiliency history API can query multiple categories and clusters, including provider information when cluster names overlap across providers. The console turns those results into charts that show score trends, baselines, configuration groups, and representative runs.

This makes it possible to ask more useful questions than whether one scenario passed:

- Is a service becoming more resilient across repeated experiments?
- Did a configuration change improve the score for a specific cluster?
- Which runs belong to the same comparable configuration group?

Resiliency history can also be exported as a report. Report actions now support PDF and HTML output, while the console provides clearer controls for configuring and downloading the result.

## Explore telemetry and alerts

The Elasticsearch and OpenSearch experience has been expanded from a basic data view into an investigation tool. The new telemetry view includes:

- Client-side pagination for large result sets.
- Faceted filters for scenario type, job status, cloud infrastructure, cloud type, Krkn version, and network plugins.
- Summary statistics for the selected result set.
- Cluster metadata alongside run telemetry.
- A dedicated alerts view for alert documents.
- Date-range filtering for telemetry and alerts.

Saved Elasticsearch configurations remain the recommended integration path, with credentials resolved by the operator. The API also supports one-time inline connections for authenticated users without persisting those credentials. Inline destinations are validated to reduce server-side request forgery risk, and credentials are rejected over plaintext HTTP.

## Understand target health before running

Target discovery now reports cluster health and liveness information. The console can show the health of a selected cluster before an experiment begins and blocks unavailable targets in the terminal flow instead of allowing a run to fail later for an avoidable connectivity reason.

The operator also exposes richer cluster metadata for telemetry and supports target requests for a clearer separation between discovering clusters and selecting the clusters that a run should use.

## Manage credentials and platform state

Cloud provider credentials can now be managed through the operator API and console. The console provides a dedicated management experience for creating, updating, deleting, and selecting credentials, while the operator handles validation and controlled injection into scenario execution.

The release also adds browser-based backup and restore. Operators can download a backup archive from the console and upload it to restore platform state. This provides a practical recovery path for installations that contain targets, provider configuration, workflows, and other operator-managed resources.

## Strengthen supply-chain and upgrade safety

Security and lifecycle behavior received significant attention in 1.1:

- Scenario and image signature verification settings are exposed through the operator and console, with visible verification status and blocking progress during checks.
- The operator resolves scenario images through `krknctl` and supports signed image controls.
- Helm upgrades use migration guards and hooks to preserve legacy custom resources, synchronize CRDs, and pause reconciliation while schemas are being migrated.
- Existing run resources are protected from being reconciled against partially upgraded schemas.
- Kubernetes and OpenShift bundles are published for OperatorHub-style installation, with versioned release channels and compatibility metadata.

The result is a safer upgrade story for installations that already contain scenario runs and graph runs, as well as a more discoverable installation path for new users.

## A more capable operator console

The console release also brings a broader navigation model, responsive run summaries, improved forms, client-side pagination for administrative views, and clearer role-aware management screens. File management is now a full page, and the sidebar groups the growing set of capabilities into a central navigation hub.

These changes are important because the console is becoming more than a run launcher. It is now a place to author experiments, administer the platform, inspect evidence, and communicate resilience results to the wider team.

## Getting started

Krkn Operator 1.1 is available as release candidates while the project completes the release process. To explore the implementation and follow the final release status, see:

- [Krkn Operator documentation](https://krkn-chaos.dev/docs/krkn-operator)

The central idea behind this release is simple: chaos experiments should produce durable engineering knowledge. With workflow reuse, historical resiliency scores, searchable telemetry, safer operations, and a more complete console, Krkn Operator 1.1 makes that feedback loop easier to run and easier to trust.
