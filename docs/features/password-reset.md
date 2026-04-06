---
status: design-review
---

# Forgot Password Reset

Allow users to securely reset their password when they cannot sign in, with reset emails sent through Resend.

---

## Routes

| Path | Purpose |
| --- | --- |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password using a reset token |
| `/login` | Return destination after a successful reset |

---

## Source Scope

This feature extends the authentication flow documented in [docs/features/registration.md](../features/registration.md).

This feature must also conform to shared baselines:

- [Security Baseline](../designs/security.md)
- [Scalability Baseline](../designs/scalability.md)
- [Reliability Baseline](../designs/reliability.md)
- [Observability Baseline](../designs/observability.md)
- [Maintainability Baseline](../designs/maintainability.md)

---

## User Flows

### Request Password Reset

```
/login
  -> click "Forgot password?"
  -> /forgot-password
  -> enter email address
  -> submit
  -> server accepts request (always generic response)
  -> if account exists, send reset email via Resend
  -> show confirmation screen: "If the email exists, we sent a reset link"
```

### Complete Password Reset

```
email inbox
  -> click reset link
  -> /reset-password?token=...
  -> enter new password + confirm password
  -> submit
  -> server validates token and password policy
  -> update password and invalidate token
  -> redirect -> /login with success message
```

### Invalid Or Expired Token

```
/reset-password?token=...
  -> token invalid, expired, or already used
  -> show "Link expired or invalid" state
  -> provide CTA to /forgot-password to request a new link
```

---

## Email Delivery (Resend)

### Provider

- Use [Resend](https://resend.com) as the transactional email provider for password reset emails.
- Use a verified sending domain for production (for example: `fussyeater.club`).
- Use a no-reply sender address (for example: `no-reply@fussyeater.club`).

### Email Content

Subject:

- `Reset your FussyEater Club password`

Body requirements:

- Include a single-use reset URL to `/reset-password?token=<token>`.
- State expiry time clearly (default target: 30 minutes).
- Include "If you did not request this, ignore this email" guidance.
- Do not include account-sensitive information beyond the recipient address.

### Delivery Rules

- Reset email dispatch should be fire-and-forget with `waitUntil` where appropriate on Workers.
- Failures to send should be logged with structured JSON logs and correlation identifiers.
- UI response for reset request must remain generic even when delivery fails.

---

## API Dependencies

This feature uses Better Auth password-reset capabilities behind app routes and/or Better Auth endpoints.

### POST `/api/auth/forgot-password`

Purpose:

- Accept email and initiate reset workflow.

Request:

- `email`: required, valid email format.
- `idempotencyKey`: required for repeated submissions.

Response:

- Always return `200` with generic success message to prevent account enumeration.

Behavior:

- If the account exists, issue a short-lived single-use token and send a Resend email.
- If no account exists, return the same response without sending email.

### POST `/api/auth/reset-password`

Purpose:

- Exchange reset token for a new password.

Request:

- `token`: required, single-use reset token.
- `newPassword`: required, password policy compliant.

Response:

- `204` on success.
- `400` on invalid payload.
- `401` or `422` on invalid/expired/used token.

Behavior:

- Invalidate token after successful reset.
- Invalidate all active sessions for the user after password change.
- Record password reset audit event.

Contract notes:

- If these endpoints are spec-governed in TypeSpec, update `specs/api/routes/auth.tsp` first.
- Recompile TypeSpec and regenerate frontend types after contract changes.

---

## Validation And Rules

### Forgot Password Request

- Email is required and must be valid format.
- Apply per-IP and per-email rate limits.
- Always return a generic success response.

### Reset Password Submission

- Token is required and must be active, unexpired, and unused.
- New password rules:
  - Minimum 8 characters.
  - At least one number.
  - Must differ from the current password.
- Confirm password must match on the client.

### Security Controls

- Token is random, high-entropy, and single-use.
- Token expiry target: 30 minutes.
- Store only hashed token server-side (never plaintext token at rest).
- Do not log tokens or raw password values.
- Enforce CSRF protections for authenticated mutation routes as applicable.

---

## Observability

Emit structured JSON logs and metrics for:

- Reset request accepted (generic).
- Reset email send attempted/succeeded/failed (provider status only, no sensitive payloads).
- Reset token validation failures (reason bucketed: expired, used, invalid).
- Password reset completed.

Suggested dimensions:

- `requestId`
- `householdId` when resolvable
- `authProvider` (`email-password`)
- `emailProvider` (`resend`)
- `result` (`accepted`, `sent`, `failed`, `completed`)

---

## Test Scenarios

1. Request reset with known email returns generic success and triggers Resend send path.
2. Request reset with unknown email returns same generic success and does not leak existence.
3. Reset with valid token changes password and invalidates token.
4. Reusing the same token fails.
5. Expired token fails with recoverable UI state.
6. Password policy violations return field-level errors.
7. Rate limit blocks abusive request patterns.
8. Resend provider failure logs observability events without changing generic UI response.

---

## Environment Variables

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

---

## MVP Out Of Scope

- Passwordless magic link sign-in.
- Multi-factor verification during reset.
- Admin-triggered password resets.
- Custom branded email editor or localization beyond default copy.
