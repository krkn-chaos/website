---
title: What is krkn-operator?
description: Kubernetes Operator for Krkn Chaos Engineering
weight: 2
---

## Overview

**krkn-operator** is a Kubernetes Operator that orchestrates Krkn-based chaos scenarios using **Kubernetes as the execution platform** instead of Docker/Podman as krknctl does.

### Cloud-Native Architecture

krkn-operator is built following **cloud-native best practices**:
- All component interactions happen through **Kubernetes Custom Resource Definitions (CRDs)**
- Fully declarative configuration
- Native integration with Kubernetes security model

### Important: Multi-Cluster Design

A critical architectural principle of krkn-operator is that **the cluster running the operator does NOT execute chaos scenarios against itself**. Instead:

- The **control plane cluster** runs krkn-operator and orchestrates chaos execution
- **Target clusters** are where chaos scenarios are actually injected
- This design **preserves the original Krkn architecture** where chaos testing is performed from an external control point

This separation ensures that chaos experiments cannot destabilize the orchestration layer itself.

## Security Benefits

One of the major advantages of krkn-operator over previous approaches (krknctl, krkn-hub containers) is **enhanced credential security**:

### Previous Approach (krknctl / krkn-hub)
- Users needed direct access to **target cluster credentials** (kubeconfig files, service account tokens)
- Credential sharing made user onboarding/offboarding **complex and risky**
- Each user managed their own credentials, increasing the attack surface

### krkn-operator Approach
- Target cluster credentials are **configured once by the krkn-operator administrator**
- Users are granted access through the **KrknUser CRD**, a custom resource that manages user permissions
- **No cluster credentials are shared** with end users
- User permissions are managed declaratively through KrknUser resources
- Simplified and secure onboarding/offboarding process

{{% notice info %}}
**Security Model**: Users interact with krkn-operator through CRDs. The operator holds the credentials and executes chaos on their behalf, eliminating the need to distribute sensitive cluster access tokens.
{{% /notice %}}

## Modular Design

krkn-operator features a **modular, extensible architecture** that supports integration with various target providers:

- Exposes **well-defined interfaces** for target provider integration operators
- Allows extending chaos capabilities to different cluster management platforms
- **Example**: [krkn-operator-acm](https://github.com/krkn-chaos/krkn-operator-acm) provides integration with Red Hat Advanced Cluster Management (ACM) and Open Cluster Management (OCM)

This design enables organizations to integrate krkn-operator with their existing cluster management infrastructure seamlessly.

## Getting Started

Documentation for installation and configuration is coming soon.
