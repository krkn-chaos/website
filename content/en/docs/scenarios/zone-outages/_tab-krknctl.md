
```bash
krknctl run zone-outages [--<parameter> <value>]
```

Can also set any global variable listed [here](../all-scenario-env-krknctl.md)


Scenario specific parameters: 
| Parameter      | Description    | Type      | Required |  Default | 
| ----------------------- | ----------------------    | ----------------  | :------: | ------------------------------------ | 
`--cloud-type` | Cloud platform on top of which cluster is running, supported platforms - aws,  gcp | enum | No | aws | 
`--duration` | Duration in seconds after which the zone will be back online | number | No | 600 | 
`--vpc-id` | cluster virtual private network to target |string | No | 
`--subnet-id` | subnet-id to deny both ingress and egress traffic ( REQUIRED ). Format: [subnet1, subnet2]  | string | No | 
`--zone` | cluster zone to target (only for gcp cloud type )| string | No | 
`--kube-check` | Connecting to the kubernetes api to check the node status, set to False for SNO | enum | No |
`--aws-access-key-id` | AWS Access Key Id | string (secret)| No | 
`--aws-secret-access-key` | AWS Secret Access Key | string (secret)| No | 
`--aws-default-region` | AWS default region | string | No | 
`--gcp-application-credentials` | GCP application credentials file location | file | No | 

NOTE: The secret string types will be masked when scenario is ran

To see all available scenario options 
```bash
krknctl run zone-outages --help
```