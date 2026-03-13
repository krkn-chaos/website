---
title: Configuration
description: Configure target clusters for chaos testing
weight: 2
---

This guide walks you through configuring target Kubernetes or OpenShift clusters where you want to run chaos engineering scenarios.

## Overview

Before running chaos experiments, you need to add one or more target clusters to the Krkn Operator. Target clusters are the Kubernetes/OpenShift clusters where chaos scenarios will be executed. You can add multiple target clusters and manage them through the web console.

{{% notice info %}}
**Administrator Access Required**: Adding and managing target clusters requires administrator privileges. Only users with admin access can configure target clusters through the Settings menu.
{{% /notice %}}

---

## Accessing Cluster Configuration

### Step 1: Open Admin Settings

Log in to the Krkn Operator Console and click on your profile in the top-right corner. Select **Admin Settings** from the dropdown menu.

<p align="center">
  <img src="/img/admin-menu.png" alt="Admin Settings Menu" style="max-width: 400px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
</p>

{{% notice warning %}}
**Admin Only**: If you don't see the "Admin Settings" option, you don't have administrator privileges. Contact your Krkn Operator administrator to request access or to add target clusters on your behalf.
{{% /notice %}}

### Step 2: Navigate to Cluster Targets

In the Admin Settings page, click on the **Cluster Targets** tab in the left sidebar. This will show you a list of all configured target clusters (if any).

---

## Adding a New Target Cluster

### Step 3: Open the Add Target Dialog

Click the **Add Target** button in the top-right corner of the Cluster Targets page. This will open the "Add New Target" dialog.

<p align="center">
  <img src="/img/add-new-target.png" alt="Add New Target Dialog" style="max-width: 700px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
</p>

### Step 4: Enter Cluster Information

You'll need to provide:

1. **Cluster Name** (required): A friendly name to identify this cluster (e.g., "Production-US-East", "Dev-Cluster", "OpenShift-QA")

2. **Authentication Type** (required): Choose one of three authentication methods:
   - **Kubeconfig** - Full kubeconfig file (recommended)
   - **Service Account Token** - Token-based authentication
   - **Username/Password** - Basic authentication (for clusters that support it)

---

## Authentication Methods

The Krkn Operator supports three different ways to authenticate to target clusters. Choose the method that best fits your cluster's security configuration.

### Method 1: Kubeconfig (Recommended)

This is the most common and recommended method. It uses a complete kubeconfig file to authenticate to the target cluster.

**When to use:**
- You have direct access to the cluster's kubeconfig file
- You want to authenticate with certificates or tokens defined in the kubeconfig
- The cluster supports standard Kubernetes authentication

**How to configure:**

1. Select **Kubeconfig** as the Authentication Type
2. Obtain the kubeconfig file for your target cluster:
   ```bash
   # For most Kubernetes clusters
   kubectl config view --flatten --minify > target-cluster.kubeconfig

   # For OpenShift clusters
   oc login https://api.cluster.example.com:6443
   oc config view --flatten > target-cluster.kubeconfig
   ```
3. Open the kubeconfig file in a text editor and copy its entire contents
4. Paste the kubeconfig content into the **Kubeconfig** text area in the dialog
5. Click **Create**

{{% notice info %}}
**Automatic Encoding**: The kubeconfig content will be automatically base64-encoded and stored securely. You don't need to encode it manually.
{{% /notice %}}

**Example kubeconfig content:**

```yaml
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: LS0tLS1CRUdJTi...
    server: https://api.cluster.example.com:6443
  name: my-cluster
contexts:
- context:
    cluster: my-cluster
    user: admin
  name: my-cluster-context
current-context: my-cluster-context
users:
- name: admin
  user:
    client-certificate-data: LS0tLS1CRUdJTi...
    client-key-data: LS0tLS1CRUdJTi...
```

---

### Method 2: Service Account Token

Use this method if you want to authenticate using a Kubernetes Service Account token.

**When to use:**
- You want fine-grained RBAC control over what the operator can do
- You're following a zero-trust security model
- You want to create a dedicated service account for chaos testing

**How to configure:**

1. Create a service account in the target cluster with appropriate permissions:
   ```bash
   # Create service account
   kubectl create serviceaccount krkn-operator -n krkn-system

   # Create ClusterRole with necessary permissions
   kubectl create clusterrolebinding krkn-operator-admin \
     --clusterrole=cluster-admin \
     --serviceaccount=krkn-system:krkn-operator

   # Get the service account token
   kubectl create token krkn-operator -n krkn-system --duration=8760h
   ```

2. In the "Add New Target" dialog:
   - Enter a **Cluster Name**
   - Select **Service Account Token** as the Authentication Type
   - Enter the **API Server URL** (e.g., `https://api.cluster.example.com:6443`)
   - Paste the **Service Account Token** you generated
   - **(Optional)** Provide **CA Certificate** data if your cluster uses a self-signed or custom Certificate Authority
   - Click **Create**

**About CA Certificate (Optional):**

The CA Certificate field is optional and only needed in specific scenarios:

- **When to provide it**: If your cluster uses a self-signed certificate or a custom/private Certificate Authority (CA) that is not trusted by default
- **When to skip it**: If your cluster uses certificates from a public CA (like Let's Encrypt, DigiCert, etc.) or standard cloud provider certificates
- **What it does**: The CA certificate allows the Krkn Operator to verify the identity of your cluster's API server and establish a secure TLS connection
- **How to get it**: Extract the CA certificate from your cluster's kubeconfig file (the `certificate-authority-data` field, base64-decoded) or from your cluster administrator

Example of extracting CA certificate from kubeconfig:
```bash
# Extract and decode CA certificate
kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d > ca.crt
```

{{% notice warning %}}
**Token Expiration**: Service account tokens can expire. If your cluster targets stop working, check if the token has expired and generate a new one.
{{% /notice %}}

---

### Method 3: Username/Password

Use basic authentication with a username and password. This method is only supported by clusters that have basic auth enabled.

**When to use:**
- Your cluster supports basic authentication
- You're testing in a development environment
- You have credentials for a user with appropriate permissions

**How to configure:**

1. In the "Add New Target" dialog:
   - Enter a **Cluster Name**
   - Select **Username/Password** as the Authentication Type
   - Enter the **API Server URL** (e.g., `https://api.cluster.example.com:6443`)
   - Enter your **Username**
   - Enter your **Password**
   - **(Optional)** Provide **CA Certificate** data if your cluster uses a self-signed or custom Certificate Authority
   - Click **Create**

**About CA Certificate (Optional):**

Same as with token authentication, the CA Certificate is optional:

- **When needed**: Only if your cluster uses self-signed certificates or a custom/private Certificate Authority
- **When to skip**: If using public CA certificates or standard cloud provider setups
- **Purpose**: Enables secure TLS verification when connecting to the cluster's API server

{{% notice danger %}}
**Security Warning**: Basic authentication is less secure than certificate-based or token-based authentication. It's recommended only for development and testing environments. Most production Kubernetes/OpenShift clusters have basic auth disabled by default.
{{% /notice %}}

---

## Verifying Target Cluster

After adding a target cluster, the Krkn Operator will attempt to connect to it and verify the credentials.

### Successful Configuration

If the cluster is configured correctly, you'll see it appear in the **Cluster Targets** list with a green status indicator. You can now use this cluster as a target for chaos scenarios.

### Troubleshooting Connection Issues

If the cluster connection fails, check the following:

| Issue | Possible Cause | Solution |
|-------|---------------|----------|
| Connection timeout | Incorrect API server URL | Verify the API server URL is correct and accessible from the operator |
| Authentication failed | Invalid credentials | Re-check your kubeconfig, token, or username/password |
| Certificate error | CA certificate mismatch | Provide the correct CA certificate for clusters with custom CAs |
| Permission denied | Insufficient RBAC permissions | Ensure the service account or user has cluster-admin or necessary permissions |
| Network unreachable | Firewall or network policy | Ensure the Krkn Operator can reach the target cluster's API server |

You can view detailed error messages in the operator logs:

```bash
kubectl logs -n krkn-operator-system -l app.kubernetes.io/name=krkn-operator -c manager
```

---

## Managing Target Clusters

### Viewing Configured Clusters

Navigate to **Admin Settings** → **Cluster Targets** to see all configured target clusters. Each cluster shows:
- Cluster name
- Connection status
- Last verified time
- Authentication method used

### Editing a Target Cluster

To modify an existing target cluster:
1. Click the **Edit** button next to the cluster in the list
2. Update the cluster name or authentication credentials
3. Click **Save**

### Removing a Target Cluster

To remove a target cluster:
1. Click the **Delete** button next to the cluster in the list
2. Confirm the deletion

{{% notice warning %}}
**Active Scenarios**: If you delete a target cluster that has running chaos scenarios, those scenarios will be terminated immediately.
{{% /notice %}}

---

## Required Permissions

The service account or user used to connect to target clusters needs the following permissions:

### Minimum RBAC Permissions

For most chaos scenarios, the operator needs cluster-admin privileges or at least these permissions:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: krkn-operator-target-access
rules:
# Pod chaos scenarios
- apiGroups: [""]
  resources: ["pods", "pods/log", "pods/exec"]
  verbs: ["get", "list", "watch", "create", "delete", "deletecollection"]

# Node chaos scenarios
- apiGroups: [""]
  resources: ["nodes"]
  verbs: ["get", "list", "watch", "update", "patch"]

# Deployment/StatefulSet/DaemonSet scenarios
- apiGroups: ["apps"]
  resources: ["deployments", "statefulsets", "daemonsets", "replicasets"]
  verbs: ["get", "list", "watch", "update", "patch", "delete"]

# Service and networking scenarios
- apiGroups: [""]
  resources: ["services", "endpoints"]
  verbs: ["get", "list", "watch", "create", "update", "delete"]

- apiGroups: ["networking.k8s.io"]
  resources: ["networkpolicies"]
  verbs: ["get", "list", "watch", "create", "update", "delete"]

# Namespace scenarios
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["get", "list", "watch"]

# Job creation for scenario execution
- apiGroups: ["batch"]
  resources: ["jobs"]
  verbs: ["get", "list", "watch", "create", "update", "delete"]

# Events for monitoring
- apiGroups: [""]
  resources: ["events"]
  verbs: ["get", "list", "watch"]
```

{{% notice info %}}
**OpenShift Clusters**: For OpenShift clusters, you may also need permissions for OpenShift-specific resources like `Route`, `DeploymentConfig`, and `Project`.
{{% /notice %}}

---

## Best Practices

1. **Use Dedicated Service Accounts**: Create a dedicated service account in each target cluster specifically for chaos testing. This makes it easier to audit and control permissions.

2. **Rotate Credentials Regularly**: Periodically rotate kubeconfig files and service account tokens to maintain security.

3. **Test Connectivity First**: After adding a target cluster, run a simple non-destructive scenario to verify connectivity before running destructive chaos tests.

4. **Organize by Environment**: Use clear naming conventions like `prod-us-east-1`, `staging-eu-west`, `dev-local` to easily identify clusters.

5. **Limit Production Access**: Consider restricting production cluster access to specific users or requiring additional approval workflows.

6. **Monitor Operator Logs**: Regularly check operator logs for authentication errors or connection issues.

---

## Next Steps

Now that you've configured your target clusters, you're ready to run chaos scenarios:

- [Create Your First Scenario](../scenarios/) - Learn how to create and execute chaos experiments
- [ACM Integration](../acm-integration/) - Automatically manage clusters via Advanced Cluster Management
- [Scenario Templates](../templates/) - Use pre-built scenario templates for common chaos patterns
