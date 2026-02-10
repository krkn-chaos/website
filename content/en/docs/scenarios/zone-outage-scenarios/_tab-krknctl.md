
```bash
krknctl run zone-outages (optional: --<parameter>:<value> )
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      |  Default | 
| ----------------------- | ----------------------    | ----------------  | ------------------------------------ | 
~-~-cloud-type | Cloud platform on top of which cluster is running, supported platforms - aws,  gcp | enum | aws | 
~-~-duration | Duration in seconds after which the zone will be back online | number | 600 | 
~-~-vpc-id | cluster virtual private network to target |string | 
~-~-subnet-id | subnet-id to deny both ingress and egress traffic ( REQUIRED ). Format: [subnet1, subnet2]  | string | 
~-~-zone | cluster zone to target (only for gcp cloud type )| string | 
~-~-kube-check | Connecting to the kubernetes api to check the node status, set to False for SNO | enum |
~-~-aws-access-key-id | AWS Access Key Id | string (secret)| 
~-~-aws-secret-access-key | AWS Secret Access Key | string (secret)| 
~-~-aws-default-region | AWS default region | string | 
~-~-gcp-application-credentials | GCP application credentials file location | file | 

NOTE: The secret string types will be masked when scenario is ran

To see all available scenario options 
```bash
krknctl run zone-outages --help 
```