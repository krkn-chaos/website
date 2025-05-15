---
title: Power Outage Scenario using Krknctl
description: 
date: 2017-01-04
weight: 2
---

```bash
krknctl run power-outages (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
~-~-cloud-type | Cloud platform on top of which cluster is running, supported platforms - aws, azure, gcp, vmware, ibmcloud, bm | enum | aws | 
~-~-timeout | Duration to wait for completion of node scenario injection | number | 180| 
~-~-shutdown-duration | Duration to wait for completion of node scenario injection | number | 1200 | 
~-~-vsphere-ip | VSpere IP Address | string | 
~-~-vsphere-username | VSpere IP Address | string (secret)| 
~-~-vsphere-password | VSpere password | string (secret)| 
~-~-aws-access-key-id | AWS Access Key Id | string (secret)| 
~-~-aws-secret-access-key | AWS Secret Access Key | string (secret)| 
~-~-aws-default-region | AWS default region | string | 
~-~-bmc-user | Only needed for Baremetal ( bm ) - IPMI/bmc username | string(secret) | 
~-~-bmc-password | Only needed for Baremetal ( bm ) - IPMI/bmc password | string(secret) | 
~-~-bmc-address | Only needed for Baremetal ( bm ) - IPMI/bmc address | string | 
~-~-ibmc-address | IBM Cloud URL | string | 
~-~-ibmc-api-key | IBM Cloud API Key | string (secret)| 
~-~-azure-tenant | Azure Tenant | string  | 
~-~-azure-client-secret | Azure Client Secret | string(secret) | 
~-~-azure-client-id | Azure Client ID | string(secret) | 
~-~-azure-subscription-id | Azure Subscription ID | string (secret)| 
~-~-gcp-application-credentials | GCP application credentials file location | file | 

NOTE: The secret string types will be masked when scenario is ran

To see all available scenario options 
```bash
krknctl run power-outages --help 
```