# Authentication

> Routes: `/login`, `/register`, `/forgot-password`, `/reset-password`, `/api/auth/*`
>
> Current status: **Implemented** for login and registration, **design-review** for password reset, with Microsoft OAuth present behind a feature flag.

## Purpose

Authenticate existing users, onboard new users, support household invite-code flows, recover access when a user cannot sign in, and support Microsoft social login.

---

## Routes

| Path | Purpose |
| --- | --- |
| `/login` | Sign in to an existing account |
| `/register` | Create a new account |
| `/forgot-password` | Request a password reset email |
| `/reset-password` | Set a new password using a reset token |
| `/api/auth/*` | Better Auth handler endpoints for sign-in, callbacks, session, and sign-out |
| `/api/invites/redeem` | Exchange an invite code for a short-lived join intent |
| `/api/register/complete` | Complete registration and apply create/join household action |
| `/api/auth/forgot-password` | Initiate password reset |
| `/api/auth/reset-password` | Exchange a reset token for a new password |

---

## Shared Experience

- Minimal, auth-focused pages with centred card layout, the site logo above the card, and simplified chrome.
- Login and registration share the same visual pattern; UX exploration also supports a combined tabbed auth card with **Log In** and **Create Account** tabs that switch client-side without reloading.
- The social auth area sits below the primary form, separated by an **or** divider.
- Password inputs use a show/hide toggle.
- Invite-aware flows preserve `?invite=` through auth and prefill the registration join flow when applicable.

---

## Technical Foundation

### Better Auth + Cloudflare Workers

- Better Auth is the end-user authentication layer for email/password and OAuth.
- Cloudflare Access is used for admin and infrastructure protection only.
- Auth configuration lives in `src/lib/server/auth.ts` and is wired through `hooks.server.ts`.
- Better Auth uses `/api/auth/*` for sign-in, callbacks, and session actions.
- Workers compatibility requires `compatibility_flags = ["nodejs_compat"]` or `nodejs_als`.
- Pass Worker `waitUntil` into Better Auth background task handling where deferred operations are enabled.
- Mandatory email verification is skipped for MVP.

### D1 Persistence

- Better Auth tables are stored in Cloudflare D1 via the `env.DB` binding.
- Better Auth-managed schema and migrations are part of deployment checks.
- Household invite data stores expiry metadata, revocation status, `max_uses`, `remaining_uses`, and redemption audit records.
- Invite redemption must enforce atomic decrement on each successful use.

### Environment Variables

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

---

## Login

### Purpose

Authenticate existing users, including invite-aware entry points and future OAuth providers.

### Layout And UI

- Centred card on a minimal background.
- Logo above the card.
- Footer link back to the landing page.
- Heading: **Welcome back**.
- Required inputs: email and password.
- **Forgot password?** link below or aligned with the password label.
- Full-width primary **Sign In** action.
- Divider with **or** text.
- Microsoft OAuth button in the social-auth position; on the login page it remains disabled with **Coming soon** until the feature flag is enabled.
- Footer link to registration.
- If `?invite=` is present, show a callout that directs the user to `/register?invite=...`.

### Validation Rules

| Field | Rules |
| --- | --- |
| Email | Required, valid email format |
| Password | Required |

### API And Interactions

- Form submission posts to `POST /api/auth/login`.
- On success, invalidate the auth session cache and redirect to `/` or a return URL.
- Preserve invite-code context through the flow.
- Tab and Enter keyboard navigation are supported.

### Error States

- Invalid credentials: inline error message above the form.
- Account locked or disabled: distinct error with support link.
- Network error: generic retry message.

---

## Registration

### Purpose

Create a new user account. Registration supports two paths: creating a new household or joining an existing household via invite code.

### Layout And UI

- Centred card on a minimal background, matching the login page style.
- Logo above the card.
- Footer link back to the landing page.
- Heading: **Create your account**.
- Required identity fields: display name / caregiver name, email, password, confirm password.
- Full-width primary **Create Account** action.
- Divider with **or** text.
- **Continue with Microsoft** OAuth button, feature-flagged.
- Footer link to login.
- UX detail: the registration form can include a terms agreement checkbox linking to Terms of Service and Privacy Policy, with allergy-disclaimer copy reminding the user to verify ingredients.

### Household Choice

- **Start a new household**: the user becomes Owner of a new household.
- **Join an existing household**: reveal invite-code input.
- When creating a household, show a household-name field.
- When joining a household, show a single invite-code field used for both manual entry and link-based invites.
- If `?invite=` is present, prefill the invite-code field and default the form to **Join existing household**.
- Invite redemption is a separate action before account creation.
- Successful redeem shows household summary and confirmation.
- Invalid or expired codes show a retryable error state.

### Microsoft Continuation Mode

- If the user arrives from Microsoft OAuth redirect, the email is pre-filled and treated as the provider identity.
- Password fields are hidden.
- The user completes display name and household choice only.
- Invite-prefill and join flow still apply in continuation mode.

### Validation Rules

| Field | Rules |
| --- | --- |
| Display name / full name | Required, 2-100 characters |
| Email | Required, valid format |
| Password | Required, minimum 8 characters, at least one number |
| Confirm password | Required for email/password registration; must match password |
| Household action | Required; one of `create` or `join` |
| Household name | Required when action is `create`; 2-100 characters; unique per owner |
| Invite code | Required when action is `join`; prefilled from `invite` URL param when available |

### Household Join Rules

| Field | Rules |
| --- | --- |
| Invite code | Required when joining manually; case-insensitive; format validated server-side |
| Invite status | Must exist, not expired, not revoked, and still joinable (`remaining_uses > 0`) |
| Membership constraint | A user may belong to only one household in MVP |
| Concurrency behavior | Invite redemption decrements `remaining_uses` atomically; parallel attempts fail once the limit is reached |

Client-side validation runs on blur. Server responses return field-level errors beneath each field.

### API Contracts

#### POST `/api/invites/redeem`

Purpose:

- Exchange an invite code for a short-lived join intent token.

Request body:

- `code`: string (required)

Success response (`200`):

- `joinIntentToken`: opaque token
- `household`: `{ id, name }`
- `remainingUses`: number
- `expiresAt`: ISO date-time

Failure responses:

- `404`: code not found
- `410`: invite expired or no remaining uses
- `409`: user already belongs to a household when authenticated
- `429`: rate limited
- `503`: transient service or database unavailable

#### POST `/api/register/complete`

Purpose:

- Complete registration and apply household action in one transaction.

Request body:

- `name`: string
- `email`: string (email/password mode only)
- `password`: string (email/password mode only)
- `householdAction`: `create` or `join`
- `householdName`: string (required for `create`)
- `joinIntentToken`: string (required for `join`)
- `idempotencyKey`: string (required)

Success response (`201`):

- `userId`
- `householdId`
- `actionApplied`: `create` or `join`

Failure responses:

- `400`: validation failure
- `401`: unauthenticated social continuation without valid session
- `403`: CSRF failure
- `409`: unique-per-owner household-name conflict or single-household membership conflict
- `410`: join intent expired or invite exhausted during confirmation
- `429`: rate limited
- `503`: transient service or database unavailable

### Key Interactions And Errors

- Registration completes via `POST /api/register/complete` after optional invite redemption via `POST /api/invites/redeem`.
- Invite-code query params auto-select **Join** and prefill the code.
- On successful completion, redirect to `/login` with a success message.
- Email already registered: inline error with link to login.
- Weak password: inline validation feedback.
- Invalid invite code: error with retry option.
- Network error: generic retry message.
- Submit-in-progress state disables the action and shows a spinner.
- Rate limits should show a friendly cooldown message without leaking account-existence details.

---

## OAuth

### Scope

- Microsoft is the only social provider for MVP.
- GitHub stays disabled for launch and is revisited post-MVP.
- The OAuth button is feature-flagged in the login and registration experiences.

### Flow

```text
/login or /register
  -> click "Continue with Microsoft"
  -> OAuth redirect
  -> /api/auth/* callback
  -> server exchanges code and upserts user
  -> known user: redirect to / or original destination
  -> new user: continue on /register in profile + household mode
```

### Continuation Rules

- Email and password are not re-collected in social continuation mode.
- The provider identity is shown as read-only.
- If an `invite` value is present, invite input is prefilled and join mode is preselected.
- Social login failures use the same form-level alert pattern with a retry path.
- UX exploration places social auth in a shared block beneath the divider; the implemented provider scope for MVP is Microsoft.

---

## Password Reset

### Purpose

Allow users to securely reset their password when they cannot sign in, with reset emails sent through Resend.

### User Flows

#### Request Password Reset

```text
/login
  -> click "Forgot password?"
  -> /forgot-password
  -> enter email address
  -> submit
  -> server accepts request with a generic response
  -> if account exists, send reset email via Resend
  -> show confirmation screen: "If the email exists, we sent a reset link"
```

#### Complete Password Reset

```text
email inbox
  -> click reset link
  -> /reset-password?token=...
  -> enter new password + confirm password
  -> submit
  -> server validates token and password policy
  -> update password and invalidate token
  -> redirect to /login with success message
```

#### Invalid Or Expired Token

```text
/reset-password?token=...
  -> token invalid, expired, or already used
  -> show "Link expired or invalid" state
  -> provide CTA to /forgot-password to request a new link
```

### Email Delivery (Resend)

- Use Resend as the transactional email provider.
- Use a verified sending domain for production and a no-reply sender address.
- Subject: `Reset your FussyEater Club password`.
- Email body must include a single-use reset URL to `/reset-password?token=<token>`.
- State the expiry time clearly; default target is 30 minutes.
- Include guidance to ignore the email if the request was not made by the recipient.
- Do not include account-sensitive information beyond the recipient address.
- Dispatch should be fire-and-forget with `waitUntil` where appropriate on Workers.
- Failures to send should be logged with structured JSON logs and correlation identifiers.
- The UI response must remain generic even when delivery fails.

### API Contracts

#### POST `/api/auth/forgot-password`

Purpose:

- Accept email and initiate the reset workflow.

Request:

- `email`: required, valid email format
- `idempotencyKey`: required for repeated submissions

Response:

- Always return `200` with a generic success message to prevent account enumeration.

Behavior:

- If the account exists, issue a short-lived single-use token and send a Resend email.
- If no account exists, return the same response without sending email.

#### POST `/api/auth/reset-password`

Purpose:

- Exchange a reset token for a new password.

Request:

- `token`: required, single-use reset token
- `newPassword`: required, password-policy compliant

Response:

- `204` on success
- `400` on invalid payload
- `401` or `422` on invalid, expired, or used token

Behavior:

- Invalidate the token after successful reset.
- Invalidate all active sessions for the user after password change.
- Record a password-reset audit event.

### Validation Rules

#### Forgot Password Request

- Email is required and must use a valid format.
- Apply per-IP and per-email rate limits.
- Always return a generic success response.

#### Reset Password Submission

- Token is required and must be active, unexpired, and unused.
- New password must be at least 8 characters.
- New password must contain at least one number.
- New password must differ from the current password.
- Confirm password must match on the client.

---

## Security Considerations

- Mutating endpoints use CSRF verification and shared authorization checks.
- Generic auth error behavior is required where account enumeration is a risk.
- Idempotency keys are required for replay-safe mutating requests such as registration completion and forgot-password submission.
- Invite codes are transient bootstrap values: exchange them for short-lived join intents and remove the raw code from the address bar immediately.
- Invite policy uses 8-character uppercase alphanumeric codes, excludes ambiguous characters, defaults to 7-day expiry, supports revocation, and allows configurable max uses.
- Regenerating an invite immediately invalidates previously issued active invite links.
- One account may belong to only one household in MVP.
- Password reset tokens must be random, high-entropy, single-use, and hashed at rest.
- Do not log reset tokens or raw password values.
- Resetting a password invalidates all active sessions.
- Structured JSON logs should preserve correlation IDs and redact sensitive fields.

---

## Test Scenarios

1. Login with valid email/password redirects to `/` or the original destination.
2. Login with `?invite=` preserves invite awareness and directs users toward `/register?invite=...`.
3. Invalid credentials, locked/disabled accounts, and network failures show the correct login error states.
4. Registration with `householdAction=create` creates the account and household in one successful submission.
5. Registration with a valid invite code and `householdAction=join` consumes one invite use and joins the household.
6. A prefilled `invite` value is removed from the URL after redeem and remains editable in the form.
7. When `remaining_uses` reaches `0`, further redeem attempts fail with a clear exhausted-invite error.
8. Parallel redeem attempts for the last remaining use produce exactly one success.
9. Repeated submissions with the same idempotency key do not create duplicate users, households, or invite records.
10. Social continuation mode preserves provider identity and does not ask the user to re-enter a password.
11. Forgot-password requests for known and unknown emails return the same generic success response.
12. Reset with a valid token changes the password, invalidates the token, and invalidates active sessions.
13. Reusing the same reset token fails.
14. Expired reset tokens show a recoverable UI state with a path back to `/forgot-password`.
15. Password policy violations return field-level reset errors.
16. Rate limiting blocks abusive reset request patterns.
17. Resend provider failures are logged through observability events without changing the generic UI response.
