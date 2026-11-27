---
title: Keycloak
description: Configure Keycloak OIDC login and group discovery for Krkn Operator
weight: 1
---

# Keycloak

This guide configures Keycloak as an external identity provider for Krkn Operator. For the shared login, mapping, and account model, see the [Identity Management overview](../).

You will configure two Keycloak clients: one for interactive OIDC login, and a separate service client for listing remote groups through the Keycloak Admin REST API. The Operator does not connect directly to LDAP behind Keycloak.

## Prerequisites

- A Keycloak realm containing the users and groups that will use Krkn Operator.
- Permission to create OIDC clients, protocol mappers, and realm groups in that realm.
- A test user assigned to at least one Keycloak group.
- Local Krkn Operator groups and permissions created in [User Management](../../user-management/).

## Configure Keycloak

### 1. Find the realm issuer URL

In the Keycloak Admin Console, select the realm that contains the users and groups. The **Issuer URL** is the realm's public URL, for example:

```text
https://sso.example.org/realms/platform
```

Check the `issuer` value in the realm's discovery document:

```text
https://sso.example.org/realms/platform/.well-known/openid-configuration
```

Use the exact issuer value, including scheme, host, port, and path. Do not use the Admin Console URL or a Kubernetes service name that the Operator cannot resolve. Older Keycloak installations may include `/auth` in the path; use it only if the discovery document reports it.

### 2. Create the interactive login client

In Keycloak, open **Clients** and create a client with:

| Setting | Value |
|---------|-------|
| Client type / protocol | OpenID Connect |
| Client ID | For example, `krkn-operator-login` |
| Client authentication | **On** (confidential client) |
| Standard flow | **On** (Authorization Code flow) |
| Direct access grants | Off |
| Implicit flow | Off |
| Service account roles | Off |
| Authorization | Off |

Save the client. In its **Credentials** tab, copy the client secret for the Operator configuration. Treat it as a password.

After creating the Krkn Operator provider below, copy its **Callback URL** into this Keycloak client under **Valid redirect URIs**. The value must match exactly. For provider ID `corp-keycloak` and public Operator URL `https://krkn.example.org`, it is:

```text
https://krkn.example.org/api/v1/auth/oidc/corp-keycloak/callback
```

Do not use a wildcard redirect URI in production. If the console and API are exposed through different public origins, use the browser-reachable callback URL shown by the provider form and configure the ingress or proxy to route it to the Operator.

### 3. Add the groups claim to the ID token

The Operator reads group memberships from the verified ID token's `groups` claim. On the login client, add a **Group Membership** protocol mapper (typically under the client's dedicated client scope → **Mappers** → **Add mapper** → **By configuration**):

| Mapper setting | Value |
|----------------|-------|
| Name | `groups` |
| Token Claim Name | `groups` |
| Full group path | **On** |
| Add to ID token | **On** |
| Add to access token | Optional |
| Add to userinfo | Optional |

Save the mapper. Full group paths are important: a nested group should be emitted as `/Engineering/Ops`, not just `Ops`. The Operator matches the full path exactly.

Create a test group and add your test user to it. Confirm that the mapper emits that group in the user's ID token. For example, a member of `/krkn-ops` must receive `"groups": ["/krkn-ops"]`.

### 4. Create a read-only group-discovery client

Create a second **OpenID Connect** client. For example, use client ID `krkn-operator-groups` and these settings:

| Setting | Value |
|---------|-------|
| Client authentication | **On** |
| Service account roles | **On** |
| Standard flow | Off |
| Direct access grants | Off |
| Implicit flow | Off |
| Authorization | Off |

Save the client and copy its secret from **Credentials**. This client uses the OAuth 2.0 client-credentials flow; it does not need a human username or password.

Assign the service account a read-only role:

1. Open the groups client and select **Service account roles**.
2. Choose **Assign role** → **Client roles**.
3. Select the `realm-management` client and assign `view-users` to the service account.

The tested configuration uses `view-users` to read the realm's group hierarchy. Do not grant `realm-admin`, `manage-users`, or write permissions for group discovery.

**Keycloak 26.8 and later:** also assign the built-in `kc-admin-api` client scope to this service client as a **Default** client scope. Keycloak's Admin REST API requires the service-account access token to include both the Admin API audience and the `kc-admin-api` scope. Keeping this as a default client scope ensures it is included in the client-credentials token. Keep the audience check enabled. See the [Keycloak upgrade guide](https://www.keycloak.org/docs/26.8.2/upgrading/) for details.

## Configure the Keycloak provider in Krkn Operator

In the console, open **User & Groups** → **Identity management** → **Providers**, choose **Add provider**, and select **Keycloak**.

| Krkn Operator field | What to enter |
|---------------------|---------------|
| **Provider ID** | A unique, stable identifier such as `corp-keycloak`. It appears in the callback URL and group mappings and cannot be changed after creation. |
| **Display name** | The label shown on the login page, for example `Corporate Keycloak`. |
| **Issuer URL** | The exact realm issuer from Keycloak discovery, for example `https://sso.example.org/realms/platform`. It cannot be changed after creation; use a new provider ID to use a different realm. |
| **Client ID** | The interactive login client's ID, for example `krkn-operator-login`. |
| **Client secret** | The secret from the interactive login client's **Credentials** tab. |
| **Callback URL** | Copy this exact value to the login client's **Valid redirect URIs** in Keycloak. |
| **Admin client ID** | The separate group-discovery client's ID, for example `krkn-operator-groups`. This is required to browse Keycloak groups in the console. |
| **Admin client secret** | The group-discovery client's secret. This is not the login client's secret. |
| **Additional trusted CA certificate (PEM)** | Leave empty when Keycloak's certificate is already trusted by the Operator. For a private CA, paste the CA certificate in PEM format, including the `BEGIN CERTIFICATE` / `END CERTIFICATE` lines and any required intermediate CA certificates. Do not paste a server certificate or private key. |
| **Skip TLS verification** | Leave disabled in production. Enabling it disables certificate and hostname verification. |
| **Enabled** | Leave disabled until the callback, secrets, and group mapper are configured. Enable the provider when ready to show its login choice. |

Save the provider, return to **Providers**, and enable it. The console login page will show the configured display name.

{{% notice warning %}}
Use HTTPS for the public Operator URL in production. If Keycloak uses a private CA, configure that CA in the provider form instead of enabling **Skip TLS verification**.
{{% /notice %}}

## Verify sign-in and group discovery

Choose the new **Log in with …** option on the console login page and authenticate with the test user. If sign-in succeeds but the user has no permissions, check that the `groups` claim is present and that the full group path is mapped to a local group for this provider. The shared mapping steps are in [Identity Management](../#map-remote-groups-to-local-permissions).

To browse groups, select this provider under **Identity management** → **Group mapping**. If group listing fails, check the separate group-discovery client credentials, its service account, the `realm-management` → `view-users` role, and the `kc-admin-api` default scope on Keycloak 26.8 and later. The login client secret does not authorize group discovery.

## Keycloak references

- [Keycloak Server Administration Guide](https://www.keycloak.org/docs/26.8.2/server_admin/)
- [Keycloak OIDC endpoints and flows](https://www.keycloak.org/securing-apps/oidc-layers)
- [Keycloak Admin REST API](https://www.keycloak.org/docs-api/26.8.2/rest-api/)
