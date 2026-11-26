---
title: Identity Management
description: Configure external sign-in and map remote groups to Krkn Operator permissions
weight: 3
---

# Identity Management <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Krkn Operator can authenticate users through an external OpenID Connect (OIDC) identity provider while keeping authorization in Krkn Operator. The identity provider verifies who a user is; administrators decide what that user may do by mapping remote groups to local Krkn Operator groups.

**Keycloak is the currently supported provider.** The provider model is designed so additional identity-management systems can be added without changing local groups or their permissions. Other OIDC providers, including Dex, are not selectable until their provider and group-directory integrations are implemented.

{{% notice info %}}
External sign-in does not replace local password login or existing API Bearer tokens. The browser OIDC flow uses an HttpOnly session cookie; Keycloak tokens are kept by the operator and are not exposed to console JavaScript.
{{% /notice %}}

## How it works

```text
User browser ── OIDC Authorization Code + PKCE ──> Keycloak
     │                                               │
     └──── callback to Krkn Operator <── auth code ──┘
                   │
                   ├── verifies the ID token and creates an operator session
                   └── resolves the user's groups against local group mappings

Admin console ── group-list request ──> Operator ── client credentials ──> Keycloak Admin API
```

- The login button is shown only for enabled providers. The operator validates the OIDC issuer, signature, audience, expiry, nonce, and PKCE exchange, then creates its own session cookie.
- The operator provisions a local external-user record on first successful login. External users receive the normal `user` role; Keycloak administrator roles do not grant Krkn Operator administrator access.
- Group discovery is a separate server-to-server connection. The operator uses a dedicated Keycloak service client; the Krkn administrator's personal Keycloak session and password are not used.
- A remote group grants the permissions of the local Krkn Operator group to which it is mapped. Unmapped groups grant no permissions.

## Prerequisites

Before configuring a provider, make sure that:

1. The operator and console releases both include OIDC provider support. Deploy the updated console before enabling the provider.
2. The operator and console are reachable through their intended public URL. In production, use HTTPS and make sure the operator pod can reach the Keycloak issuer and Admin API.
3. You have an operator administrator account, a Keycloak realm, a test user, and permission to create clients and realm groups in that realm.
4. You have decided which Keycloak groups should receive which existing local Krkn Operator permissions. Create the local groups first in [User Management](user-management/).

## Configure Keycloak

Use a dedicated OIDC client for browser login and a separate service client for remote group discovery. The login client needs a secret because the operator exchanges the authorization code on the server. The group client is used only by the operator and must not be used for interactive user login.

### 1. Choose a realm and issuer URL

In the Keycloak Admin Console, select the realm that contains the users and groups. The **Issuer URL** is the realm's public URL, for example:

```text
https://sso.example.org/realms/platform
```

Check the `issuer` value in the realm's discovery document:

```text
https://sso.example.org/realms/platform/.well-known/openid-configuration
```

Use the exact issuer value, including scheme, host, port, and path. Do not use the Admin Console URL or a Kubernetes service name that the operator cannot resolve. Older Keycloak installations may include `/auth` in the path; use it only if the discovery document reports it.

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

Save the client. In its **Credentials** tab, copy the client secret for the operator configuration. Treat it as a password.

After you create the Krkn Operator provider in the next section, copy its **Callback URL** back into this Keycloak client under **Valid redirect URIs**. The value must match exactly. For provider ID `corp-keycloak` and public operator URL `https://krkn.example.org`, it is:

```text
https://krkn.example.org/api/v1/auth/oidc/corp-keycloak/callback
```

Do not use a wildcard redirect URI in production. If the console and API are exposed through different public origins, use the browser-reachable operator callback URL shown by the provider form and configure the surrounding ingress/proxy to route it to the operator.

### 3. Add the groups claim to the ID token

The operator reads group memberships from the verified ID token's `groups` claim. On the login client, add a **Group Membership** protocol mapper (typically under the client's dedicated client scope → **Mappers** → **Add mapper** → **By configuration**):

| Mapper setting | Value |
|----------------|-------|
| Name | `groups` |
| Token Claim Name | `groups` |
| Full group path | **On** |
| Add to ID token | **On** |
| Add to access token | Optional |
| Add to userinfo | Optional |

Save the mapper. Full group paths are important: a nested group should be emitted as `/Engineering/Ops`, not just `Ops`. This avoids collisions between groups with the same name in different branches. The operator matches the full path exactly.

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

The operator only calls the Keycloak Admin REST API. It does not connect directly to LDAP behind Keycloak.

## Configure the provider in Krkn Operator

Sign in as a Krkn Operator administrator and open **User & Groups** → **Identity management** → **Providers**. Select **Add provider** in the upper-right corner and choose **Keycloak**.

Fill in the provider form:

| Krkn Operator field | What to enter |
|---------------------|---------------|
| **Provider ID** | A unique, stable identifier such as `corp-keycloak`. This ID appears in the callback URL and group mappings. It cannot be changed after creation. |
| **Display name** | The label shown on the login page, for example `Corporate Keycloak`. |
| **Issuer URL** | The exact realm issuer from Keycloak discovery, for example `https://sso.example.org/realms/platform`. It cannot be changed after creation; create a new provider ID to use a different realm. |
| **Client ID** | The interactive login client's ID, for example `krkn-operator-login`. |
| **Client secret** | The secret from the interactive login client's **Credentials** tab. |
| **Callback URL** | The public URL ending in `/api/v1/auth/oidc/<provider-id>/callback`. Copy this exact value to the login client's **Valid redirect URIs** in Keycloak. |
| **Admin client ID** | The separate group-discovery client's ID, for example `krkn-operator-groups`. This is required to browse Keycloak groups in the console. |
| **Admin client secret** | The group-discovery client's secret. This is not the login client's secret. |
| **Additional trusted CA certificate (PEM)** | Leave empty when the Keycloak certificate is already trusted by the operator. For a private CA, paste the CA certificate in PEM format, including the `BEGIN CERTIFICATE` / `END CERTIFICATE` lines and any required intermediate CA certificates. Do not paste a server certificate or a private key. |
| **Skip TLS verification** | Leave disabled in production. Enable only for a short-lived test on a network you trust; it disables certificate and hostname verification. |
| **Enabled** | Leave disabled until the callback, secrets, and group mapper are configured. Enable it when you are ready to show the login choice. |

Save the provider, return to **Providers**, and enable it. The console's login page will now show the configured display name. The provider configuration and credentials are stored by the operator in Kubernetes Secrets; secret values are not returned by the admin API. Operator backup archives include these secrets, so protect backups accordingly.

{{% notice warning %}}
Use HTTPS for the public operator URL in production. If Keycloak uses a private CA, configure that CA in the provider form instead of enabling **Skip TLS verification**.
{{% /notice %}}

### Verify sign-in

Open the console login page and choose the new **Log in with …** option. Authenticate with the test user. The callback should return to Krkn Operator and establish a browser session. If the user is not yet mapped to a local group, sign-in can still succeed; the user will have no group-derived permissions and the console will show its empty state.

Local password login remains available. Existing API clients can continue using Bearer JWTs.

## Map remote groups to local permissions

Create local groups and set their cluster permissions first in [User Management](user-management/). Then:

1. In **Identity management**, open **Group mapping**.
2. Select the authentication provider. The provider ID is shown with its display name.
3. Find the remote Keycloak group under **Browse remote groups**. Use the full **Path** and **Remote ID** to distinguish nested or identically named groups.
4. Select **Map**. In the dialog, choose the local Krkn Operator group whose permissions should be granted to members of that remote group, then select **Map group**.
5. Confirm the mapping appears under **Existing mappings**.

The mapping key is the provider ID plus the exact group path in the OIDC `groups` claim. For example, `/Ops` from `corp-keycloak` is distinct from `/Ops` from `partner-keycloak`. The remote ID is useful for identifying a Keycloak group in the explorer, but authorization matches the provider ID and claim path.

A local Krkn Operator group can receive members from multiple remote groups. A remote group can also be mapped to multiple local groups; permissions from all matching local groups are combined. Review mappings carefully to avoid granting broader access than intended. Local users continue to use their existing local group assignments.

When an external user belongs to several mapped groups, their effective permissions are the union of those groups' permissions. A remote group that has no mapping grants nothing. Changes to local mappings apply on the next request; after changing a user's Keycloak group membership, have that user sign in again so the new `groups` claim reaches the operator.

## Manage external accounts and access

After a user's first successful OIDC login, Krkn Operator creates an external `KrknUser` record. The account appears under **Identity management** → **Accounts**. The record keeps display metadata such as username and email; the stable identity is based on the provider, issuer, and OIDC subject (`sub`), not on email matching.

- **Disable an account** to block it on subsequent API requests, including existing browser sessions.
- **Delete** removes the local user record. A later valid login can provision it again.
- **Delete & blacklist** records the provider/issuer/subject identity before deleting the account. It prevents that identity from signing in again, even if the local user record is recreated. The saved username/email are display-only metadata. An administrator can remove a block under **Blocked accounts**.

Blacklists and provider configuration are stored in Kubernetes Secrets; they do not require an external database.

## Troubleshooting

| Symptom | What to check |
|---------|---------------|
| The provider button is missing | The provider must be enabled, and the console release must support provider discovery. Check that both operator and console are updated. |
| Keycloak reports an invalid redirect URI | Compare the provider form's full **Callback URL** with the login client's **Valid redirect URIs**. The provider ID is part of the path; avoid wildcards and stale IDs. |
| OIDC discovery or callback fails with a TLS error | Confirm the issuer is reachable from the operator pod and the URL matches Keycloak discovery. Add the issuing CA chain in PEM format. Keep TLS verification enabled for production. |
| Group listing returns an error | Check the separate Admin client ID/secret, its service account, the `realm-management` → `view-users` role, and the `kc-admin-api` default scope on Keycloak 26.8+. The login client secret does not authorize group discovery. |
| Login succeeds but the user has no permissions | Confirm the login client mapper adds `groups` to the **ID token**, **Full group path** is on, the user belongs to that Keycloak group, and the exact path is mapped to a local group for the correct provider ID. Sign in again after changing Keycloak membership. |
| Similar group names appear in the explorer | Use the full group **Path** and the provider ID. A short name such as `Ops` does not identify a nested group uniquely. |

## Extending provider support

The authorization model is provider-neutral: a remote group is identified by a configured provider ID and the exact value emitted in the OIDC `groups` claim, then mapped to a local `KrknUserGroup`. New identity systems can reuse this model and the existing local permission rules.

Adding another system still requires an explicit integration. The public `pkg/identity.OIDCAuthenticator` contract handles the verified OIDC login result, while `pkg/identity.GroupDirectory` adapts provider-specific group discovery to the common group-list API. A directory can optionally implement `pkg/identity.PagedGroupDirectory` when its pagination model needs to be preserved. An adapter must return the stable configured provider ID and the exact claim value that authorization will match; this keeps identically named groups from different providers separate. For example, a future Dex integration could reuse the shared Authorization Code + PKCE flow and provide an LDAP-backed `GroupDirectory` adapter. The operator does not currently expose Dex or generic LDAP as selectable provider types.

For Keycloak's OIDC and service-account setup, see the [Keycloak Server Administration Guide](https://www.keycloak.org/docs/26.8.2/server_admin/), [OIDC endpoints and flows](https://www.keycloak.org/securing-apps/oidc-layers), and [Keycloak Admin REST API](https://www.keycloak.org/docs-api/26.8.2/rest-api/).
