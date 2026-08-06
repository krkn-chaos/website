
```bash
krknctl run power-outages [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      | Required |  Default | 
| ----------------------- | ----------------------    | ----------------  | :------: | ------------------------------------ | 
`--cloud-type` | Cloud platform on top of which cluster is running, supported platforms - aws, azure, gcp, vmware, ibmcloud, bm | enum | No | aws | 
`--timeout` | Time in seconds to wait for each node to be stopped or running after the cluster comes back | number | No | 180| 
`--shutdown-duration` | Duration in seconds to shut down the cluster | number | No | 1200 | 
`--vsphere-ip` | vSphere IP address | string | No | 
`--vsphere-username` | vSphere IP address | string (secret)| No | 
`--vsphere-password` | vSphere password | string (secret)| No | 
`--aws-access-key-id` | AWS Access Key Id | string (secret)| No | 
`--aws-secret-access-key` | AWS Secret Access Key | string (secret)| No | 
`--aws-default-region` | AWS default region | string | No | 
`--bmc-user` | Only needed for Baremetal ( bm ) - IPMI/bmc username | string(secret) | No | 
`--bmc-password` | Only needed for Baremetal ( bm ) - IPMI/bmc password | string(secret) | No | 
`--bmc-address` | Only needed for Baremetal ( bm ) - IPMI/bmc address | string | No | 
`--ibmc-address` | IBM Cloud URL | string | No | 
`--ibmc-api-key` | IBM Cloud API Key | string (secret)| No | 
`--azure-tenant` | Azure Tenant | string | No | 
`--azure-client-secret` | Azure Client Secret | string(secret) | No | 
`--azure-client-id` | Azure Client ID | string(secret) | No | 
`--azure-subscription-id` | Azure Subscription ID | string (secret)| No | 
`--gcp-application-credentials` | GCP application credentials file location | file | No | 

NOTE: The secret string types will be masked when scenario is ran

To see all available scenario options 
```bash
krknctl run power-outages --help
```
