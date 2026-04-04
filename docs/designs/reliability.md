---
status: baseline
---

# Reliability Baseline

This document defines reliability expectations that apply to all site features.

## Failure Semantics

- Return deterministic transient failures (`503`) for retryable backend dependency issues.
- Avoid partial-success side effects on failed mutations.
- Preserve user input state in UI on retryable failures.

## Idempotency And Retry Safety

- Require idempotency keys for mutation endpoints that can be retried by clients.
- Ensure replaying the same idempotency key does not duplicate side effects.
- Use bounded exponential backoff with jitter on retryable failures (`429`, `503`).

## Concurrency Control

- Define explicit behavior under contention and race conditions.
- Use atomic update conditions for single-winner scenarios.
- Provide deterministic conflict/expiry outcomes (`409`, `410`) where appropriate.
