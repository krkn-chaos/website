---
title: Security self-assessment
description: The Self-assessment is the initial document regarding the security of the project.
weight: 11
---

# Krkn Security Self-Assessment

Security reviewers: Tullio Sebastiani, Paige Patton, Naga Ravi Elluri

This document is intended to aid in roadmapping, and the onboarding of new maintainers.

## Table of Contents

* [Metadata](#metadata)
  * [Security links](#security-links)
* [Overview](#overview)
  * [Background](#background)
  * [Actors](#actors)
  * [Actions](#actions)
  * [Goals](#goals)
  * [Non-goals](#non-goals)
* [Self-assessment use](#self-assessment-use)
* [Security functions and features](#security-functions-and-features)
* [Project compliance](#project-compliance)
* [Secure development practices](#secure-development-practices)
* [Security issue resolution](#security-issue-resolution)
* [Appendix](#appendix)

## Metadata

| | |
|-----------|------|
| Software | https://github.com/krkn-chaos/krkn </br> https://github.com/krkn-chaos/krkn-lib </br> https://github.com/krkn-chaos/krkn-hub </br> https://github.com/krkn-chaos/krknctl |
| Security Provider? | No. Krkn is designed to measure application or cluster resilience injecting controlled resource disruptions, but it should not be considered a security provider. |
| Languages | Python, Go, Bash |
| Software Bill of Materials | 🔹 Krkn : https://github.com/krkn-chaos/krkn/releases/latest/download/sbom.json </br> 🔹 krkn-lib : https://github.com/krkn-chaos/krkn-lib/releases/latest/download/sbom.json </br> 🔹 krknctl : https://github.com/krkn-chaos/krknctl/releases/latest/download/sbom.json </br>|
| Security Links | Known Weakness. Creation of a security-insights.yml should be added to the roadmap. |

## Overview

krkn is a chaos and resiliency testing tool for Kubernetes. Krkn injects deliberate failures into Kubernetes clusters to check if it is resilient to turbulent conditions.

### Background
There are a couple of false assumptions that users might have when operating and running their applications in distributed systems:

* The network is reliable
* There is zero latency
* Bandwidth is infinite
* The network is secure
* Topology never changes
* The network is homogeneous
* Consistent resource usage with no spikes
* All shared resources are available from all places

Various assumptions led to a number of outages in production environments in the past. The services suffered from poor performance or were inaccessible to the customers, leading to missing Service Level Agreement uptime promises, revenue loss, and a degradation in the perceived reliability of said services.

### Actors

1. [Krkn](https://github.com/krkn-chaos/krkn) Is the project source repository, is the python project containing the application sources, all the scenarios plugins and the configuration files
2. [krkn-lib](https://github.com/krkn-chaos/krkn-lib) Is the main project library repository containing all the classes, the data models and the helper functions used by the krkn scenarios
3. [krkn-hub](https://github.com/krkn-chaos/krkn-hub) Hosts container images and wrapper for running scenarios supported by Krkn, a chaos testing tool for Kubernetes clusters to ensure it is resilient to failures. All we need to do is run the containers with the respective environment variables defined as supported by the scenarios without having to maintain and tweak files.
4. [krknctl](https://github.com/krkn-chaos/krknctl) Krknctl is a tool designed to run and orchestrate krkn chaos scenarios utilizing container images from the krkn-hub. Its primary objective is to streamline the usage of krkn by providing features like command auto-completion, input validation, scenario descriptions and detailed instructions and much more, effectively abstracting the complexities of the container environment.

### Actions

The Krkn Core orchestrates chaos scenarios outside from the cluster interacting with cluster APIs and collecting metrics

![Krkn workflow](images/kraken-workflow.png)

Krkn-lib methods and classes are used by the Krkn core to execute actions and interact with cluster APIs.

Krkn-hub scripts and CI/CD pipelines build the core Krkn components, including Krkn, krkn-lib, and init scripts. These are packaged with all necessary dependencies into multiple container images, each tagged for a specific scenario. The init scripts then translate the container's environment variables into a valid Krkn configuration, enabling scenarios to run without any manual installation of dependencies.

Krknctl is a powerful CLI for managing chaos scenarios. It can list, inspect, and run all available scenario tags by fetching their input metadata directly from the container registry. The tool simplifies execution by translating environment variables into command-line arguments and validates all input using a robust typing protocol defined within each image's manifest.Beyond basic scenario management, Krknctl can run multiple Krkn instances in both parallel and serial modes. This capability allows you to create and orchestrate powerful, complex chaos conditions.

### Goals

#### Test coverage
The project's testing strategy is multi-layered, covering individual primitives, the core application, and the command-line tool.

**Krkn-lib**</br>
Krkn-lib was created by extracting core primitives from the main Krkn codebase, allowing them to be tested individually. It has a dedicated testing pipeline with over 80% coverage.

**Krkn core**</br>
The Krkn core functionality is validated through a suite of functional test scripts that execute the krkn binary and collect test results.

**Krknctl**</br>
The Krknctl command-line tool has a dedicated test suite with approximately 50% coverage. To qualify Krknctl for a stable release, our internal goal is to raise its test coverage to a minimum of 80%.

#### Dependency check

**Krkn**</br>
The project dependencies are currently monitored by [Snyk](https://snyk.io) and github dependabot

**krkn-lib**</br>
The project dependencies are currently monitored by github dependabot

**krknctl**</br>
The project dependencies are currently monitored by github dependabot

#### Static code analysis

**Krknctl**</br>

Krknctl code is currently tested in the CI pipeline with [staticcheck](https://staticcheck.dev/) and [gosec](https://github.com/securego/gosec)

**Krkn**</br>
Known Weakness. Krkn static code analysis should be added to the roadmap.

**Krkn-lib**</br>
Known Weakness. krkn-lib static code analysis should be added to the roadmap.

#### Container image scanning

Our base image on top of which all the tags are build is scanned on the building phase by [Snyk](https://snyk.io) CLI in the CI pipeline.

#### Input validation protocol
Python's flexible typing has made user input validation a challenge for the Krkn core. To solve this, we've established a new validation protocol between the Krknctl CLI and our container images. By making Krknctl the main entry point for running Krkn, we can now rely on it to ensure all user input is robustly validated.


### Non-Goals

#### Target systems integrity
Krkn includes a rollback system designed to restore a cluster to its original state. However, due to the highly disruptive nature of certain scenarios, particularly those targeting critical subsystems, it may lead to non-recoverable conditions. For this reason, maintaining the integrity and security of the target system is a non-goal for the project.

## Self-assessment Use

This self-assessment was created by the Krkn team to perform an internal security analysis of the project. It is not intended to serve as a security audit of the Krkn development team, nor does it function as an independent assessment or attestation of the team's security health.

This document provides Krkn users with an initial understanding of the project's security posture. It serves as a guide to existing security documentation, outlines the Krkn team's security plans, and offers a general overview of the team's security practices for both development and project maintenance.

Finally, the document gives Krkn maintainers and stakeholders additional context. This information is intended to help inform the roadmap creation process, ensuring that security and feature improvements can be prioritized accordingly.

## Security functions and features

| Component | Applicability | Description of Importance |
| --------- | ------------- | ------------------------- |
| Krkn Rollback System | Critical | The `Rollback System` component enables Krkn to restore targeted Kubernetes objects or subsystems to their original state. This is a critical feature that allows for an asynchronous rollback persisting all changes to the filesystem before the chaos scenario is executed, which is necessary when unpredictable conditions interrupt a scenario and prevent the normal restoration process from completing. |
| krknctl Input Validation | Critical | This system ensures that all user-provided inputs are valid, preventing scenario execution failures and a wide range of unexpected behaviors that could result from malformed data. |

## Project Compliance

Krkn does not currently adhere to any compliance standards.

### Future State

To address the need for certification, we are absolutely open to considering it. However, we have not yet encountered the necessity to adhere to a specific standard in any production environment where Krkn is currently deployed.

## Secure Development Practices

Despite being a sandbox project, Krkn is committed to secure development practices in all our repositories. Our approach, which aligns with industry standards, is detailed in the sections below.

- Branch protection on the default (`main`) branch:
  - Require signed commits
  - Require a pull request before merging
    - Require approvals: 1
    - Dismiss stale pull request approvals when new commits are pushed
    - Require review from Code Owners
    - Require approval of the most recent reviewable push
    - Require conversation resolution before merging
  - Require status checks to pass before merging
    - Require branches to be up to date before merging

### Communication Channels

Krkn's communication channels are structured to facilitate both internal collaboration and public engagement.

#### Internal Communication

Krkn maintainers and contributors primarily communicate through the public Slack channel (`#krkn` on `kubernetes.slack.com`) and direct messages.

#### Public Communication

* **Inbound:** We welcome incoming messages and feedback through **GitHub Issues** and the public Slack channel.
* **Outbound:** We communicate project news and updates to our users primarily via **documentation** and **release notes**. Our public Slack channel is used for secondary announcements.

## Security Issue Resolution

The Krkn security policy is maintained in the SECURITY.md file and can be quickly found through the [GitHub Security Overview](https://github.com/krkn-chaos/krkn/blob/main/SECURITY.md).

### Responsible Disclosure Practice

The Krkn project accepts vulnerability reports exclusively through [GitHub Vulnerability Reporting](https//docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) tool.

Anyone can submit a report by using the dedicated [reporting form](https://github.com/krkn-chaos/krkn/security/advisories/new) within the GitHub repository. Once a report is received, a maintainer will collaborate directly with the reporter via the Security Advisory until the issue is resolved.

### Incident Response

When a vulnerability is reported, the maintainer team will first collaborate to determine its validity and criticality. Based on this assessment, a fix will be triaged and a patch will be issued in a timely manner.

Patches will be applied to all versions currently supported by the project's security policy. Information about the fix will then be disseminated to the community through all appropriate outbound channels as quickly as circumstances allow.

## Appendix

- Known Issues Over Time
  - Known issues are currently tracked in the project roadmap. There are currently some security issues that need to be addressed by two downstream dependencies of the base image (Openshift CLI oc, python docker sdk)
    - Python: [urllib3 1.26.20](https://github.com/urllib3/urllib3/security/advisories/GHSA-pq67-6m6q-mj2v)
    - Go: [golang.org/x/net	v0.36.0](https://nvd.nist.gov/vuln/detail/CVE-2025-22872)
- OpenSSF Best Practices
  - 91% Score
- Case Studies
  - This project is used by several companies to test cluster reliability and resilience, refer to our [ADOPTERS.md](https://github.com/krkn-chaos/krkn/blob/main/ADOPTERS.md) file for the detailed case studies.
