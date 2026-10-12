---
title: KubeVirt VM Outage
description: This page has been renamed. Please visit the VMI Outage scenario for current documentation.
date: 2017-01-04
weight: 3
redirect: /docs/scenarios/vmi-outage/
---

# This page has been moved

The **KubeVirt VM Outage** scenario has been renamed to **[VMI Outage](/docs/scenarios/vmi-outage/)** to better reflect the scenario name used in the chaos engineering tools.

## What changed?

- **Scenario name in configuration file**: Changed from `kubevirt_vm_outage` references to `vmi_outage`
- **Krkn-hub and krknctl**: Changed from kubevirt-outage to vmi-outage

## Next steps

Please visit the **[VMI Outage Scenario](/docs/scenarios/vmi-outage/)** page for the current documentation, examples, and how to run the scenario.

The functionality remains the same—this is only a naming and organization change to align with the tool's scenario naming conventions. The `KubeVirtVMOutage` scenario remains available for backward compatibility but will be removed in the next major release. 
