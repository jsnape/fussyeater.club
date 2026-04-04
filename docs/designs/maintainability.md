---
status: baseline
---

# Maintainability Baseline

This document defines maintainability and change-management standards for all site features.

## API Contract Discipline

- Document request/response contracts and error codes for each endpoint.
- Keep breaking changes behind versioning or feature flags.
- Preserve backward compatibility during migrations and phased rollout.

## Delivery And Rollback

- Use non-destructive migrations for production rollouts.
- Roll back by disabling feature flags first, not by destructive schema reversals.
- Keep explicit migration, rollout, and rollback checklists.

## Testing Requirements

- Cover critical paths with unit, integration, and end-to-end tests.
- Include concurrency and idempotency tests for mutation endpoints.
- Add security regression checks for authn/authz, CSRF, and data leakage patterns.
