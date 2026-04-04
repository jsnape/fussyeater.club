---
status: baseline
---

# Scalability Baseline

This document defines scalability and capacity patterns that apply to all site features.

## API And Data Access

- Prefer bounded, index-friendly queries for hot paths.
- Keep request handlers stateless where possible.
- Use atomic write patterns for shared counters and contention-prone resources.

## Rate And Traffic Management

- Protect public endpoints with layered rate limiting (edge + app as needed).
- Define per-endpoint quotas for burst and sustained traffic.
- Gate rollout with error-rate and latency guardrails.

## Progressive Delivery

- Ship major behavior changes behind feature flags.
- Ramp traffic in stages (internal, partial, full) with explicit stop conditions.
- Keep backward-compatible schema changes during ramp periods.
