---
title: Supported Cloud Providers
description: >
date: 2017-01-05
weight: 1
---
- [AWS](#aws)
- [GCP](#gcp)
- [Openstack](#openstack)
- [Azure](#azure)
- [Alibaba](#alibaba)
- [VMware](#vmware)
- [IBMCloud](#ibmcloud)

## AWS

**NOTE**: For clusters with AWS make sure [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) is installed and properly [configured](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html) using an AWS account. This should set a configuration file at `$HOME/.aws/config` for your the AWS account. If you have multiple profiles configured on AWS, you can change the profile by setting `export AWS_DEFAULT_PROFILE=<profile-name>`

```bash
export AWS_DEFAULT_REGION=<aws-region>
```

This configuration will work for self managed AWS, ROSA and Rosa-HCP


## GCP
**NOTE**: For clusters with GCP make sure [GCP CLI](https://cloud.google.com/sdk/docs/install#linux) is installed.

A google service account is required to give proper authentication to GCP for node actions. See [here](https://cloud.google.com/docs/authentication/getting-started) for how to create a service account.

**NOTE**: A user with 'resourcemanager.projects.setIamPolicy' permission is required to grant project-level permissions to the service account.

After creating the service account, enable it by exporting the credentials path or running `gcloud init`:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="<serviceaccount.json>"
```

In krkn-hub, you'll need to both set the environment variable and also copy the file to the local container:

```bash
-e GOOGLE_APPLICATION_CREDENTIALS=<container_creds_file>
```

The container path needs to match the path mounted via the `-v` flag below:

```bash
-v <local_gcp_creds_file>:<container_creds_file>:Z
```

Example:

```bash
podman run -e GOOGLE_APPLICATION_CREDENTIALS=/home/krkn/GCP_app.json -e DURATION=10 --net=host  -v <kubeconfig>:/home/krkn/.kube/config:Z -v <local_gcp_creds_file>:/home/krkn/GCP_app.json:Z -d containers.krkn-chaos.dev/krkn-chaos/krkn-hub:...
```


## Openstack

**NOTE**: For clusters with Openstack Cloud, ensure to create and source the [OPENSTACK RC file](https://docs.openstack.org/newton/user-guide/common/cli-set-environment-variables-using-openstack-rc.html) to set the OPENSTACK environment variables from the server where Kraken runs.

## Azure

**NOTE**: You will need to create a service principal and give it the correct access, see [here](https://docs.openshift.com/container-platform/4.5/installing/installing_azure/installing-azure-account.html) for creating the service principal and setting the proper permissions.

To properly run the service principal requires “Azure Active Directory Graph/Application.ReadWrite.OwnedBy” api permission granted and “User Access Administrator”.

Before running you will need to set the following:

```bash
export AZURE_SUBSCRIPTION_ID=<subscription_id>
export AZURE_TENANT_ID=<tenant_id>
export AZURE_CLIENT_SECRET=<client secret>
export AZURE_CLIENT_ID=<client id>
```

{{% alert title="Note" %}} 
This configuration will only work for self managed Azure, not ARO. ARO service puts a deny assignment in place over cluster managed resources, that only allows the ARO service itself to modify the VM resources. This is a capability unique to Azure and the structure of the service to prevent customers from hurting themselves. Refer to the links below for more documentation around this.
- https://learn.microsoft.com/en-us/azure/openshift/openshift-service-definitions#azure-resource-architecture
- https://learn.microsoft.com/en-us/azure/openshift/support-policies-v4#cluster-management
{{% /alert %}}

## Alibaba

See the [Installation guide](https://www.alibabacloud.com/help/en/alibaba-cloud-cli/latest/installation-guide) to install alicloud cli.

```bash
export ALIBABA_ID=<access_key_id>
export ALIBABA_SECRET=<access key secret>
export ALIBABA_REGION_ID=<region id>
```

Refer to [region and zone page](https://www.alibabacloud.com/help/en/elastic-compute-service/latest/regions-and-zones#concept-2459516) to get the region id for the region you are running on.

Set cloud_type to either alibaba or alicloud in your node scenario yaml file.

## VMware

Set the following environment variables:

```bash
export VSPHERE_IP=<vSphere_client_IP_address>
export VSPHERE_USERNAME=<vSphere_client_username>
export VSPHERE_PASSWORD=<vSphere_client_password>
```

These are the credentials that you would normally use to access the vSphere client.


## IBMCloud
If no api key is set up with proper VPC resource permissions, use the following to create: 
* [Access group](https://cloud.ibm.com/docs/account?topic=account-groups&interface=ui#create_ag)
* [Service ID with the following access:](https://cloud.ibm.com/docs/account?topic=account-serviceids&interface=ui#create_serviceid)
  * With policy **VPC Infrastructure Services**
  * Resources = All
  * Roles: 
    * Editor
    * Administrator 
    * Operator  
    * Viewer
* [API Key](https://cloud.ibm.com/docs/account?topic=account-manapikey&interface=ui)

Set the following environment variables:

```bash
export IBMC_URL=https://<region>.iaas.cloud.ibm.com/v1
export IBMC_APIKEY=<ibmcloud_api_key>
```


## IBMCloud Power
If no api key is set up with proper VPC resource permissions, use the following to create: 
* [Access group](https://cloud.ibm.com/docs/account?topic=account-groups&interface=ui#create_ag)
* [Service ID with the following access:](https://cloud.ibm.com/docs/account?topic=account-serviceids&interface=ui#create_serviceid)
  * With policy **Power Virtual Server Workspace**
  * Resources = All
  * Roles: 
    * Editor
    * Administrator 
    * Operator  
    * Viewer
    * Manager
    * Serivce Configuration Reader
    * Key Manager
* [API Key](https://cloud.ibm.com/docs/account?topic=account-manapikey&interface=ui)

Set the following environment variables:

```bash
export IBMC_POWER_URL="https://<region>.power-iaas.cloud.ibm.com"
export IBMC_APIKEY=<ibmcloud_api_key>
export IBMC_POWER_CRN=<workspace_crn>
```