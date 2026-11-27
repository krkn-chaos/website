---
title: Identity Management
description: Configure external identity providers and map remote groups to Krkn Operator permissions
weight: 3
---

# Identity Management <a href="/docs/krkn-operator/#permission-model"><span class="krkn-badge krkn-badge--admin">Admin</span></a>

Krkn Operator can authenticate users through an external identity provider while keeping authorization in Krkn Operator. The provider verifies a user's identity; administrators decide what that user can do by mapping remote groups to local Krkn Operator groups.

**Keycloak is the currently supported identity provider.** This chapter explains the shared identity and authorization model. Provider-specific setup lives in a child chapter so future integrations can document their own configuration alongside Keycloak. Dex and other providers are not available until their integrations are implemented.

{{% notice info %}}
External sign-in does not replace local password login or API Bearer tokens. Browser sign-in creates an HttpOnly Krkn Operator session cookie; external provider tokens are not exposed to console JavaScript.
{{% /notice %}}

## Provider setup guides

- [Keycloak](keycloak/): configure OIDC login, the group membership claim, and remote group discovery.

When another provider is implemented, add its setup as a sibling page in this section.

## Shared authentication flow

```text
User browser ── OIDC Authorization Code + PKCE ──> Identity provider
     │                                                │
     └──── callback to Krkn Operator <── auth code ───┘
                   │
                   ├── verifies the OIDC response and creates an operator session
                   └── resolves the user's groups against local group mappings

Admin console ── group-list request ──> Operator ── provider adapter ──> Group directory
```

- An enabled provider appears as a login choice. Krkn Operator validates the OIDC issuer, signature, audience, expiry, nonce, and PKCE exchange before creating its own session.
- On first successful sign-in, Krkn Operator provisions a local external-user record with the normal `user` role. Roles assigned by an identity provider do not grant Krkn Operator administrator access.
- Group discovery is a separate server-to-server operation. The operator uses provider-specific credentials configured by an administrator; it does not use the administrator's personal identity-provider session.
- Remote memberships grant only the permissions of mapped local groups. Unmapped groups grant no permissions.

## Prerequisites

Before configuring external sign-in:

1. Ensure the installed Operator and console releases support identity providers. Deploy a compatible console before enabling a provider.
2. Make sure the browser can reach the configured callback URL and the Operator can reach the provider's issuer and group directory.
3. Use HTTPS for public endpoints in production. If the identity provider uses a private certificate authority, prepare its CA certificate chain in PEM format.
4. Create the local Krkn Operator groups and assign their cluster permissions in [User Management](../user-management/) before mapping remote memberships.
5. Obtain the OIDC client credentials and any separate group-discovery credentials required by the provider integration.

## Configure a provider

Sign in as a Krkn Operator administrator and open **User & Groups** → **Identity management** → **Providers**. Select **Add provider**, choose an available provider type, and complete the form.

The common configuration identifies the provider, its OIDC issuer, the browser login client, and the callback. Group-discovery credentials and their permissions depend on the provider. See the relevant provider guide for exact values and setup instructions.

| Provider field | Purpose |
|----------------|---------|
| **Provider ID** | A unique, stable identifier used in callback URLs, external account identities, and group mappings. |
| **Display name** | The text shown on the console's login choice. |
| **Issuer URL** | The provider's OIDC issuer. Use the exact URL advertised by its discovery document. |
| **Client ID** and **Client secret** | Credentials for the interactive OIDC login client, when required by the provider. |
| **Callback URL** | The public Operator callback URL. Register the exact value with the identity provider's login client. |
| **Group-discovery credentials** | Separate server-side credentials used to list remote groups. Their roles and values are provider-specific. |
| **Additional trusted CA certificate (PEM)** | Optional CA certificate chain used to validate a provider that uses a private CA. |
| **Skip TLS verification** | Disables certificate and hostname checks. Keep disabled in production; use only for a temporary trusted test. |
| **Enabled** | Controls whether the provider is available for login. Leave disabled until callback and provider settings are ready. |

Provider configuration and credentials are stored in Kubernetes Secrets. Secret values are not returned by the admin API. Operator backup archives include these Secrets, so protect backups accordingly.

{{% notice warning %}}
Use HTTPS for public Operator and identity-provider endpoints in production. Configure the provider's trusted CA instead of enabling **Skip TLS verification**.
{{% /notice %}}

## Map remote groups to local permissions

Create local groups and set their permissions in [User Management](../user-management/). Then:

1. In **Identity management**, open **Group mapping**.
2. Select the provider whose remote directory you want to browse.
3. Find the remote group in **Browse remote groups**. Use its full path and provider ID to distinguish groups with the same name.
4. Select **Map**. In the dialog, choose the local Krkn Operator group that should receive the remote members' permissions, then confirm.
5. Check that the relationship appears under **Existing mappings**.

A mapping is scoped to a provider and its exact group claim value. The same group path from two providers represents two distinct remote groups. The remote directory ID helps administrators identify the entry in the explorer; authorization uses the provider ID and claim value returned by the login integration.

A remote group may map to multiple local groups, and a local group may receive members from multiple remote groups. When a user belongs to multiple mapped groups, their effective permissions are combined. Review mappings carefully because they can grant access to additional clusters and features. Existing local users keep their local group assignments.

Mapping changes apply on the next request. Changes to a user's remote group membership require a fresh sign-in so the updated membership reaches the Operator.

## Manage external accounts

After a user's first successful external sign-in, Krkn Operator creates a local external-user record. Administrators can manage the record under **Identity management** → **Accounts**.

- **Disable** an account to block it on subsequent API requests, including requests made with an existing session.
- **Delete** removes the local user record. A later valid sign-in may provision the record again.
- **Delete & blacklist** stores the external identity key before removing its user record. The blocked identity cannot sign in again until an administrator removes it under **Blocked accounts**.

## Troubleshooting

| Symptom | What to check |
|---------|---------------|
| The provider login choice is missing | Confirm the provider is enabled and both Operator and console releases support provider discovery. |
| The callback is rejected | Compare the configured callback URL with the exact URL registered in the provider's login client. Check the provider ID, scheme, hostname, and path. |
| OIDC discovery or callback fails with a TLS error | Confirm the issuer is reachable from the Operator pod and matches the provider discovery document. Add the issuing CA chain and keep verification enabled. |
| Sign-in succeeds but the user has no permissions | Confirm the user has a remote membership included in the OIDC identity, and that its exact provider/group value is mapped to a local group. Sign in again after changing remote memberships. |
| Remote groups cannot be listed | Check the provider-specific group-discovery credentials and permissions. See the provider setup guide for its directory API requirements. |

## Extending provider support

The local authorization model is independent of the identity product: external users are matched to mappings by provider ID and exact remote group claim value, then receive permissions from the mapped `KrknUserGroup` resources.

Adding a provider still requires an explicit integration. The public `pkg/identity.OIDCAuthenticator` contract handles the verified OIDC login result. `pkg/identity.GroupDirectory` adapts provider-specific group discovery to the common group-list API, and `pkg/identity.PagedGroupDirectory` can preserve a directory's pagination model. An adapter returns the stable configured provider ID and the exact group value used by authorization.

This separation allows a future integration to reuse the OIDC Authorization Code + PKCE flow while implementing its own group-directory adapter. For example, a future Dex setup could authenticate users through OIDC and list groups through LDAP. Keycloak is currently the only selectable provider; Dex and generic LDAP are not yet available in the console.
