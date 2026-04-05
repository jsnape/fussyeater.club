---
status: baseline
---

# Observability Baseline

This document defines observability controls that apply to all site features.

## Audit Events

- Emit structured audit events for security-relevant user and system actions.
- Include action type, actor id (when available), target id, outcome, and timestamp.
- Ensure event payloads avoid sensitive raw secrets.

## Tracing And Correlation

- Attach correlation IDs to requests and propagate them through logs and responses.
- Capture enough context to debug incidents without exposing sensitive values.

## Alerts And SLO Signals

- Track endpoint error rates and latency percentiles.
- Alert on anomalous failure patterns and abuse indicators.
- Define release stop conditions tied to SLO guardrails.

## Registration Staging Validation Checklist

- Confirm all registration, invite, and auth endpoints emit JSON log lines with `event`, `requestId`, and `timestamp` fields.
- Verify every API response in the registration flow includes `x-request-id`, including validation and feature-flag failures.
- Confirm sensitive values are redacted in logs for cookies, auth headers, passwords, invite codes, join tokens, and email-like user scope values.
- Validate that idempotency replay paths emit explicit replay events without leaking request payload details.
- Capture a staging sample of successful create flow, successful join flow, exhausted invite, and invalid CSRF flow for release evidence.

## Registration Rollout Guardrails

- Error-rate guardrail: stop rollout if any registration endpoint exceeds 2% 5xx responses for 10 minutes.
- Latency guardrail: stop rollout if p95 latency for `POST /api/register/complete` exceeds 1200 ms for 10 minutes.
- Security guardrail: stop rollout immediately for sustained CSRF failures above normal baseline or missing correlation headers.
- Business guardrail: stop rollout if invite redeem success rate drops below baseline by more than 20%.

## Staged Rollout Readiness Steps

- Keep rollout flags (`AUTH_REGISTRATION_V2_ENABLED`, `AUTH_INVITE_MULTIUSE_ENABLED`) at 0% for initial deploy.
- Ramp to 10%, 25%, 50%, and 100% only after each stage passes all guardrails for at least 30 minutes.
- Require explicit rollback criteria: any guardrail breach, unexplained elevated 4xx/5xx rates, or correlation-id propagation failures.
- Document each stage decision (go/hold/rollback) with timestamp, approver, and observed metrics.
