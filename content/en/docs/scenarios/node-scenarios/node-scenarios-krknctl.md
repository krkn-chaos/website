---
title: Node Scenarios using Krknctl
description: 
date: 2017-01-04
weight: 3
---

```bash
krknctl run node-scenarios (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters:  (be sure to scroll to right)
| Parameter      | Description    | Type      |  Default | Possible Values | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | :----------------:  | 
~-~-action | action performed on the node, visit https://github.com/krkn-chaos/krkn/blob/main/docs/node_scenarios.md for more infos | enum |  | node_start_scenario,node_stop_scenario,node_stop_start_scenario,node_termination_scenario,node_reboot_scenario,stop_kubelet_scenario,stop_start_kubelet_scenario,restart_kubelet_scenario,node_crash_scenario,stop_start_helper_node_scenario | 
~-~-label-selector | Node label to target | string | node-role.kubernetes.io/worker | 
~-~-exclude-label  | excludes nodes marked by this label from chaos ||
~-~-node-name | Node name to inject faults in case of targeting a specific node; Can set multiple node names separated by a comma | string | 
~-~-instance-count | Targeted instance count matching the label selector | number | 1 | 
~-~-runs | Iterations to perform action on a single node | number | 1 | 
~-~-cloud-type | Cloud platform on top of which cluster is running, supported platforms - aws, azure, gcp, vmware, ibmcloud, bm | enum | aws | 
~-~-kube-check | Connecting to the kubernetes api to check the node status, set to False for SNO | enum | true | 
~-~-timeout | Duration to wait for completion of node scenario injection | number | 180| 
~-~-duration | Duration to wait for completion of node scenario injection | number | 120 | 
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
~-~-ibmc-power-address | IBM Power Cloud URL | string | 
~-~-ibmc-cnr | IBM Cloud Power Workspace CNR | string | 
~-~-disable-ssl-verification | Disable SSL verification, to avoid certificate errors | enum | false |
~-~-azure-tenant | Azure Tenant | string  | 
~-~-azure-client-secret | Azure Client Secret | string(secret) | 
~-~-azure-client-id | Azure Client ID | string(secret) | 
~-~-azure-subscription-id | Azure Subscription ID | string (secret)| 
~-~-gcp-application-credentials | GCP application credentials file location | file | 

NOTE: The secret string types will be masked when scenario is ran

To see all available scenario options 
```bash
krknctl run node-scenarios --help 
```