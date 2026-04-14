# API Reference — Tokens Studio Rails

> **Base URL:** `http://localhost:3000/api/v1`  
> **Auth:** Bearer token (`Authorization: Bearer <jwt>`) required on all endpoints unless marked public.  
> **Interactive docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)  
> **OpenAPI spec:** [`config/openapi/`](../../config/openapi/)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Organizations](#organizations)
4. [Organization Memberships](#organization-memberships)
5. [Invitations](#invitations)
6. [Projects](#projects)
7. [Project Memberships](#project-memberships)
8. [Branches (Change Sets)](#branches-change-sets)
9. [Tokens](#tokens)
10. [Token Sets](#token-sets)
11. [Themes](#themes)
12. [Variables](#variables)
13. [Styles](#styles)
14. [Releases](#releases)
15. [Assets](#assets)
16. [Integrations](#integrations)
17. [CI Integrations](#ci-integrations)
18. [Registry](#registry)
19. [Service Account Tokens](#service-account-tokens)
20. [Billing / Stripe](#billing--stripe)
21. [AI Assistant](#ai-assistant)
22. [Token Script](#token-script)
23. [ADRs](#adrs)
24. [Documentation (Project Docs)](#documentation-project-docs)
25. [Import Jobs](#import-jobs)
26. [Uploads](#uploads)
27. [Activity](#activity)
28. [Onboarding](#onboarding)
29. [Feature Flags](#feature-flags)
30. [OAuth & OIDC](#oauth--oidc)
31. [What's New](#whats-new)
32. [Consents & Legal](#consents--legal)
33. [Token Tools](#token-tools)

---

## Authentication

All auth endpoints are under `/api/v1/auth`.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/sign_in` | Sign in with email + password. Returns JWT. |
| `DELETE` | `/auth/sign_out` | Sign out (invalidate JWT). |
| `POST` | `/auth/sign_up` | Register a new user. |
| `POST` | `/auth/password` | Request password reset email. |
| `PUT` | `/auth/password` | Reset password with token. |
| `GET` | `/auth/validate_token` | Validate a JWT token. |

### Sign In
**POST** `/auth/sign_in`
```json
// Request
{ "email": "user@example.com", "password": "secret" }

// Response 200
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe"
  },
  "token": "eyJ..."
}
```

### Sign Up
**POST** `/auth/sign_up`
```json
// Request
{ "email": "user@example.com", "password": "secret", "name": "Jane Doe" }
```

---

## Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users/me` | Get current user profile |
| `PATCH` | `/users/me` | Update current user profile |
| `GET` | `/users/me/organizations` | List orgs the current user belongs to |

### Get Current User
**GET** `/users/me`
```json
// Response 200
{
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "avatar_url": null,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Update Current User
**PATCH** `/users/me`
```json
// Request
{ "name": "Jane Smith", "avatar_url": "https://..." }
```

---

## Organizations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/organizations` | List organizations for current user |
| `POST` | `/organizations` | Create organization |
| `GET` | `/organizations/:id` | Get organization |
| `PATCH` | `/organizations/:id` | Update organization |
| `DELETE` | `/organizations/:id` | Delete organization |
| `GET` | `/organizations/:id/billing` | Get billing info |
| `GET` | `/organizations/:id/subscription` | Get subscription details |
| `GET` | `/organizations/:id/roles` | List organization roles |

### Create Organization
**POST** `/organizations`
```json
// Request
{
  "name": "My Org",
  "timezone": "UTC",
  "locale": "en"
}

// Response 201
{
  "data": {
    "id": "uuid",
    "name": "My Org",
    "slug": "my-org",
    "status": "active",
    "current_plan": null,
    "subscription_status": null
  }
}
```

---

## Organization Memberships

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/organizations/:organization_id/memberships` | List members |
| `PATCH` | `/organizations/:organization_id/memberships/:id` | Update member role |
| `DELETE` | `/organizations/:organization_id/memberships/:id` | Remove member |
| `DELETE` | `/organizations/:organization_id/memberships/leave` | Leave organization |

---

## Invitations

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/organizations/:organization_id/invitations` | List invitations |
| `POST` | `/organizations/:organization_id/invitations` | Create invitation |
| `DELETE` | `/invitations/:id` | Revoke invitation |
| `POST` | `/invitations/:token/accept` | Accept invitation |
| `POST` | `/invitations/:token/decline` | Decline invitation |

### Create Invitation
**POST** `/organizations/:organization_id/invitations`
```json
// Request
{
  "email": "newuser@example.com",
  "role_name": "member",
  "project_id": "uuid",        // optional — to also invite to a project
  "message": "Join us!"        // optional
}

// Response 201
{
  "data": {
    "id": "uuid",
    "token": "abc123",
    "email": "newuser@example.com",
    "status": "pending",
    "expires_at": "2024-02-01T00:00:00Z"
  }
}
```

---

## Projects

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/organizations/:organization_id/projects` | List projects |
| `POST` | `/organizations/:organization_id/projects` | Create project |
| `GET` | `/projects/:id` | Get project |
| `PATCH` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Archive project |
| `GET` | `/projects/:project_id/dashboard` | Project dashboard stats |
| `POST` | `/projects/:project_id/test_data/generate` | Generate test tokens/branches (dev) |
| `POST` | `/projects/:project_id/test_data/generate_design_system` | Generate demo design system (dev) |
| `GET` | `/projects/:project_id/exports/orthogonality` | Analyze theme export orthogonality |

### Create Project
**POST** `/organizations/:organization_id/projects`
```json
// Request
{ "name": "Design System", "description": "Our tokens" }

// Response 201
{
  "data": {
    "id": "uuid",
    "name": "Design System",
    "slug": "design-system",
    "organization_id": "uuid"
  }
}
```

---

## Project Memberships

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/memberships` | List project members |
| `POST` | `/projects/:project_id/memberships` | Invite member to project |
| `PATCH` | `/projects/:project_id/memberships/:id` | Update member role |
| `DELETE` | `/projects/:project_id/memberships/:id` | Remove member / revoke invite |
| `POST` | `/projects/:project_id/memberships/:id/resend_invitation` | Resend invitation email |
| `DELETE` | `/projects/:project_id/memberships/leave` | Leave project |

---

## Branches (Change Sets)

Branches represent Git-like isolated editing sessions. Every project has a `main` branch.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/branches` | List branches |
| `POST` | `/projects/:project_id/branches` | Create branch |
| `GET` | `/projects/:project_id/branches/:id` | Get branch |
| `PATCH` | `/projects/:project_id/branches/:id` | Update branch |
| `DELETE` | `/projects/:project_id/branches/:id` | Delete branch |
| `POST` | `/projects/:project_id/branches/:id/merge` | Merge branch into main |
| `GET` | `/projects/:project_id/branches/:id/diff` | Get diff vs main |
| `POST` | `/projects/:project_id/branches/:id/pull` | Pull latest from main into branch |
| `GET` | `/projects/:project_id/branches/:id/conflicts` | List merge conflicts |
| `POST` | `/projects/:project_id/branches/:id/resolve_conflicts` | Resolve conflicts |
| `POST` | `/projects/:project_id/branches/:id/archive` | Archive (soft-delete) branch |
| `POST` | `/projects/:project_id/branches/:id/restore` | Restore archived branch |
| `GET` | `/projects/:project_id/branches/:id/review` | Get review request |
| `POST` | `/projects/:project_id/branches/:id/review` | Create review request |
| `DELETE` | `/projects/:project_id/branches/:id/review` | Delete review request |
| `POST` | `/projects/:project_id/branches/:id/review/approve` | Approve branch |
| `GET` | `/projects/:project_id/branches/:id/review/approvals` | List approvals |
| `DELETE` | `/projects/:project_id/branches/:id/review/approvals/:approval_id` | Dismiss approval |
| `GET` | `/projects/:project_id/branches/:id/review/comments` | List review comments |
| `POST` | `/projects/:project_id/branches/:id/review/comments` | Add review comment |
| `PATCH` | `/projects/:project_id/branches/:id/review/comments/:comment_id` | Update comment |
| `DELETE` | `/projects/:project_id/branches/:id/review/comments/:comment_id` | Delete comment |
| `POST` | `/projects/:project_id/branches/:id/review/comments/:comment_id/resolve` | Resolve comment |

### Create Branch
**POST** `/projects/:project_id/branches`
```json
// Request
{ "name": "feature/new-colors" }

// Response 201
{
  "data": {
    "type": "branches",
    "id": "uuid",
    "attributes": {
      "name": "feature/new-colors",
      "status": "active",
      "is_main": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Merge Branch
**POST** `/projects/:project_id/branches/:id/merge`
```json
// Request (optional)
{ "strategy": "ours" }   // conflict resolution strategy

// Response 200
{ "data": { "success": true, "merged_events": 42 } }
```

> **Query param:** Most token/set/theme read endpoints accept `?change_set_id=<branch_uuid>` to read from a specific branch instead of main.

---

## Tokens

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/tokens` | List tokens (optionally filter by set) |
| `POST` | `/projects/:project_id/tokens` | Create token |
| `GET` | `/projects/:project_id/tokens/:id` | Get token |
| `PATCH` | `/projects/:project_id/tokens/:id` | Update token |
| `DELETE` | `/projects/:project_id/tokens/:id` | Delete token |
| `POST` | `/projects/:project_id/tokens/bulk_create` | Bulk create tokens |
| `POST` | `/projects/:project_id/tokens/bulk_update` | Bulk update tokens |
| `POST` | `/projects/:project_id/tokens/bulk_delete` | Bulk delete tokens |
| `POST` | `/projects/:project_id/tokens/import` | Import tokens from JSON |

Query params: `?change_set_id=uuid`, `?token_set_id=uuid`

### Create Token
**POST** `/projects/:project_id/tokens`
```json
// Request
{
  "data": {
    "attributes": {
      "name": "color.primary",
      "value": "#0070f3",
      "type": "color",
      "token_set_id": "uuid",
      "description": "Brand primary blue"
    }
  }
}
```

---

## Token Sets

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/token_sets` | List token sets |
| `POST` | `/projects/:project_id/token_sets` | Create token set |
| `GET` | `/projects/:project_id/token_sets/:id` | Get token set |
| `PATCH` | `/projects/:project_id/token_sets/:id` | Update token set |
| `DELETE` | `/projects/:project_id/token_sets/:id` | Delete token set |
| `PATCH` | `/projects/:project_id/token_sets/reorder` | Reorder token sets |

### Create Token Set
**POST** `/projects/:project_id/token_sets`
```json
// Request
{
  "data": {
    "attributes": {
      "name": "Primitives",
      "type": "STATIC"   // or "GENERATED"
    }
  }
}
```

---

## Themes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/theme_groups` | List theme groups |
| `POST` | `/projects/:project_id/theme_groups` | Create theme group |
| `GET` | `/projects/:project_id/theme_groups/:id` | Get theme group |
| `PATCH` | `/projects/:project_id/theme_groups/:id` | Update theme group |
| `DELETE` | `/projects/:project_id/theme_groups/:id` | Delete theme group |
| `POST` | `/projects/:project_id/theme_groups/:theme_group_id/theme_options` | Create theme option |
| `PATCH` | `/projects/:project_id/theme_groups/:theme_group_id/theme_options/:id` | Update theme option |
| `DELETE` | `/projects/:project_id/theme_groups/:theme_group_id/theme_options/:id` | Delete theme option |

### Create Theme Group
**POST** `/projects/:project_id/theme_groups`
```json
// Request
{
  "data": {
    "attributes": {
      "name": "Color Mode",
      "options": [
        { "name": "Light", "token_sets": ["uuid1", "uuid2"] },
        { "name": "Dark",  "token_sets": ["uuid3"] }
      ]
    }
  }
}
```

---

## Variables

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/variables` | List Figma variable mappings |
| `POST` | `/projects/:project_id/variables` | Create variable mapping |
| `GET` | `/projects/:project_id/variables/:id` | Get variable mapping |
| `PATCH` | `/projects/:project_id/variables/:id` | Update variable mapping |
| `DELETE` | `/projects/:project_id/variables/:id` | Delete variable mapping |
| `POST` | `/projects/:project_id/variables/bulk` | Bulk upsert variable mappings |

---

## Styles

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/styles` | List style mappings |
| `POST` | `/projects/:project_id/styles` | Create style mapping |
| `PATCH` | `/projects/:project_id/styles/:id` | Update style mapping |
| `DELETE` | `/projects/:project_id/styles/:id` | Delete style mapping |
| `POST` | `/projects/:project_id/styles/bulk` | Bulk upsert style mappings |

---

## Releases

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/releases` | List releases |
| `POST` | `/projects/:project_id/releases` | Create release (snapshot) |
| `GET` | `/projects/:project_id/releases/:id` | Get release |
| `DELETE` | `/projects/:project_id/releases/:id` | Delete release |

### Create Release
**POST** `/projects/:project_id/releases`
```json
// Request
{
  "data": {
    "attributes": {
      "name": "v1.2.0",
      "description": "Q1 design refresh",
      "change_set_id": "uuid"   // branch to snapshot
    }
  }
}
```

---

## Assets

Assets are organized into **collections** within projects.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/asset_collections` | List collections |
| `POST` | `/projects/:project_id/asset_collections` | Create collection |
| `GET` | `/projects/:project_id/asset_collections/:id` | Get collection |
| `PATCH` | `/projects/:project_id/asset_collections/:id` | Update collection |
| `DELETE` | `/projects/:project_id/asset_collections/:id` | Delete collection |
| `GET` | `/projects/:project_id/asset_collections/:collection_id/assets` | List assets in collection |
| `POST` | `/projects/:project_id/asset_collections/:collection_id/assets` | Upload asset (returns presigned URL) |
| `GET` | `/projects/:project_id/asset_collections/:collection_id/assets/:id` | Get asset |
| `PATCH` | `/projects/:project_id/asset_collections/:collection_id/assets/:id` | Update asset |
| `DELETE` | `/projects/:project_id/asset_collections/:collection_id/assets/:id` | Delete asset |
| `GET` | `/projects/:project_id/asset_collections/:collection_id/assets/:id/thumbnail` | Get thumbnail presigned URL |
| `GET` | `/projects/:project_id/asset_collections/:collection_id/assets/:id/versions` | List versions |
| `GET` | `/projects/:project_id/assets` | List assets at project level (filter by `?collection_id=`) |
| `POST` | `/projects/:project_id/assets` | Create asset at project level |

Query params: `?change_set_id=uuid`

---

## Integrations

Sync project tokens with external platforms (GitHub, GitLab, etc.).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/integrations` | List integrations |
| `POST` | `/projects/:project_id/integrations` | Create integration |
| `GET` | `/projects/:project_id/integrations/:id` | Get integration |
| `PATCH` | `/projects/:project_id/integrations/:id` | Update integration |
| `DELETE` | `/projects/:project_id/integrations/:id` | Delete integration |
| `POST` | `/projects/:project_id/integrations/:id/sync` | Trigger manual sync |

---

## CI Integrations

Programmatic access for CI/CD pipelines.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/ci/projects/:project_id/tokens` | Export tokens for CI |
| `POST` | `/ci/projects/:project_id/tokens/push` | Push token updates from CI |

---

## Registry

Publish and consume tokens as versioned packages.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/registry/:organization_slug/:project_slug` | Get registry manifest |
| `GET` | `/registry/:organization_slug/:project_slug/:version` | Get specific version |
| `POST` | `/registry/:organization_slug/:project_slug/publish` | Publish a version |

---

## Service Account Tokens

Machine credentials for API access (no user session needed).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/organizations/:organization_id/service_account_tokens` | List service account tokens |
| `POST` | `/organizations/:organization_id/service_account_tokens` | Create service account token |
| `DELETE` | `/organizations/:organization_id/service_account_tokens/:id` | Revoke token |

### Create Service Account Token
**POST** `/organizations/:organization_id/service_account_tokens`
```json
// Request
{ "name": "CI Pipeline", "scopes": ["read", "write"] }

// Response 201 — token only shown once
{ "data": { "id": "uuid", "name": "CI Pipeline", "token": "sat_abc123..." } }
```

---

## Billing / Stripe

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/organizations/:id/billing` | Get billing summary |
| `POST` | `/organizations/:id/billing/checkout` | Create Stripe checkout session |
| `POST` | `/organizations/:id/billing/portal` | Open Stripe customer portal |
| `POST` | `/stripe/webhooks` | Stripe webhook receiver (internal) |
| `GET` | `/plans` | List available plan groups |

### List Plans
**GET** `/plans`
```json
// Response 200
{
  "data": [
    {
      "slug": "starter_plus",
      "display_name": "Starter Plus",
      "included_seats": 1,
      "features": ["...", "..."],
      "prices": {
        "monthly": { "amount": 29.99, "currency": "usd" },
        "annual":  { "amount": 299.99, "currency": "usd" }
      }
    }
  ]
}
```

---

## AI Assistant

Requires `AI_ASSISTANT_ENABLED=true`. Supports streaming via SSE.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/assistant/sessions` | Create a new assistant session |
| `GET` | `/assistant/sessions/:id` | Get session with message history |
| `POST` | `/assistant/sessions/:session_id/messages` | Send message (supports streaming) |

### Create Session
**POST** `/assistant/sessions`
```json
// Request
{
  "project_id": "uuid",
  "change_set_id": "uuid"   // branch context
}
```

### Send Message (streaming)
**POST** `/assistant/sessions/:session_id/messages`

Set `Accept: text/event-stream` for SSE streaming:
```
event: text
data: {"type":"text","content":"Here are your tokens..."}

event: tool_call_start
data: {"type":"tool_call_start","tool_name":"tokens_create"}

event: done
data: {"type":"done","message_id":"uuid","usage":{...}}
```

Without streaming header returns `201` JSON:
```json
{
  "data": {
    "user_message": { "id": "uuid", "role": "user", "content": "..." },
    "assistant_message": { "id": "uuid", "role": "assistant", "content": "..." },
    "usage": { "input_tokens": 120, "output_tokens": 85 }
  }
}
```

---

## Token Script

Generated token sets powered by the TokenScript engine.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/token_script/preview` | Preview TokenScript output |
| `POST` | `/projects/:project_id/token_script/execute` | Execute a TokenScript |
| `GET` | `/projects/:project_id/token_script/schemas` | List available schemas |

---

## ADRs

Architecture Decision Records scoped to a project.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/adrs` | List ADRs |
| `POST` | `/projects/:project_id/adrs` | Create ADR |
| `GET` | `/projects/:project_id/adrs/:id` | Get ADR |
| `PATCH` | `/projects/:project_id/adrs/:id` | Update ADR |
| `DELETE` | `/projects/:project_id/adrs/:id` | Delete ADR |

---

## Documentation (Project Docs)

Rich text documentation pages scoped to a project.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/docs` | List doc pages |
| `POST` | `/projects/:project_id/docs` | Create doc page |
| `GET` | `/projects/:project_id/docs/:id` | Get doc page |
| `PATCH` | `/projects/:project_id/docs/:id` | Update doc page |
| `DELETE` | `/projects/:project_id/docs/:id` | Delete doc page |

---

## Import Jobs

Async bulk-import of tokens from external sources.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/projects/:project_id/import_jobs` | Start an import job |
| `GET` | `/projects/:project_id/import_jobs/:id` | Poll job status |

---

## Uploads

Direct presigned S3/MinIO uploads (bypasses Rails for large files).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/uploads/presign` | Get a presigned upload URL |
| `POST` | `/uploads/complete` | Confirm upload completed |

### Get Presigned URL
**POST** `/uploads/presign`
```json
// Request
{ "filename": "icon.svg", "content_type": "image/svg+xml", "byte_size": 4096 }

// Response 200
{ "data": { "url": "https://minio.../...", "fields": {}, "key": "uploads/uuid/icon.svg" } }
```

---

## Activity

Audit log / event feed for a project.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects/:project_id/activity` | List activity events (paginated) |

Query params: `?page=1&per_page=50&change_set_id=uuid`

---

## Onboarding

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/onboarding/checklist` | Get onboarding checklist status |
| `POST` | `/onboarding/steps/:step/complete` | Mark a step complete |

---

## Feature Flags

PostHog-backed feature flags evaluated server-side.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/feature_flags` | Get all flags for current user/org |

---

## OAuth & OIDC

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/oauth/authorize` | OAuth 2.0 authorization endpoint |
| `POST` | `/oauth/token` | Exchange code for token |
| `POST` | `/oauth/revoke` | Revoke a token |
| `GET` | `/.well-known/openid-configuration` | OIDC discovery document |
| `GET` | `/oidc/userinfo` | OIDC userinfo endpoint |

---

## What's New

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/whats_new` | List what's new entries |
| `POST` | `/whats_new/:id/dismiss` | Dismiss an entry |

---

## Consents & Legal

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/legal_documents` | List legal documents |
| `GET` | `/legal_documents/:id` | Get document |
| `POST` | `/consents` | Record user consent |
| `GET` | `/consents/status` | Check consent status |

---

## Token Tools

Utility endpoints for resolving/transforming tokens (used by the Figma plugin).

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/token_tools/resolve` | Resolve token references |
| `POST` | `/token_tools/transform` | Transform tokens (e.g. px → rem) |

---

## Common Patterns

### Authentication Header
```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

### Branch-scoped reads
Append `?change_set_id=<branch-uuid>` to any read endpoint to read from a specific branch instead of main.

### Error format
```json
{
  "errors": [
    { "detail": "Name can't be blank", "source": { "pointer": "/data/attributes/name" } }
  ]
}
```

### Standard HTTP status codes

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content (delete success) |
| `400` | Bad Request |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (valid token, insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (e.g. merge conflict) |
| `410` | Gone (e.g. expired invitation) |
| `422` | Unprocessable Entity (validation error) |
| `503` | Service Unavailable (feature disabled) |
