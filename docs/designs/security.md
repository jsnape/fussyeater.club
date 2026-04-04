---
status: baseline
---

# Security Baseline

This document defines security controls that apply to all site features.

## Authentication And Session Security

- Use secure session cookies with `Secure`, `HttpOnly`, `SameSite=Lax`, and explicit path/domain scoping.
- Require CSRF protection on all state-changing endpoints.
- Use generic auth failure messages to prevent account enumeration.
- Never auto-link accounts by email alone; require verified provider identity and authenticated linking flow.

## Secrets And Sensitive Data

- Do not log raw passwords, OAuth tokens, invite codes, or other credential-like values.
- Keep secrets in runtime environment bindings and avoid hardcoding in source.
- Rotate secrets using documented operational process.

## Authorization

- Enforce least privilege for owner/admin-only operations.
- Return deterministic authorization failures (`403`) for unauthorized actions.
- Validate ownership on every household-scoped mutation.

## Abuse Prevention

- Apply rate limiting and cooldowns to authentication and high-risk endpoints.
- Use per-IP and per-identifier throttles where relevant.
- Return deterministic `429` behavior and include retry guidance in UI.
