---
status: design-review
---

# Registration & Login

Support email/password and Microsoft social login using Better Auth. Registration is a single SPA-style flow where users create a household or join one during sign-up.

---

## Routes

| Path | Purpose |
|---|---|
| `/register` | Create a new account |
| `/login` | Sign in to an existing account |
| `/api/auth/*` | Better Auth handler endpoints (sign-in, callback, session, sign-out) |
| `/api/invites/redeem` | Exchange invite code for short-lived server join intent |
| `/logout` | Sign out and clear session |

---

## User Flows

### New User (Email/Password)

```
/register
  → fill name, email, password
  → choose household action: create new OR join existing
  → if join existing: enter invite code (prefilled from URL if present)
  → submit → server validates → create account and create/join household
  → redirect → /
```

### New User (Invite Link With Code)

```
/register?invite=ABC123
  → invite code input is prefilled with ABC123
  → client calls /api/invites/redeem to exchange code for short-lived join intent
  → URL is cleaned with history replace (remove `invite` query param)
  → complete registration with "Join existing household" selected
  → show household summary for code
  → user confirms join
  → redirect → /
```

### Returning User (Email/Password)

```
/login
  → fill email, password
  → submit → server validates
  → redirect → / (or original destination)
```

### Social Login (Microsoft)

```
/login  (or /register)
  → click "Continue with Microsoft"
  → OAuth redirect → /api/auth/* callback
  → server exchanges code → upsert user
  → new user  → /register continuation flow in "complete profile + household" mode
  → email/password fields are not re-collected in social continuation mode
  → if `invite` is present, invite input is prefilled and join mode is preselected
  → known user → / (or original destination)
```

### Existing Account Uses Invite Link

```
/register?invite=ABC123 or /login?invite=ABC123
  → if authenticated and not in a household: open join confirmation with prefilled invite
  → if authenticated and already in a household: block join and show membership constraint message
  → if unauthenticated: continue normal auth, then resume invite join flow
```

### Forgot Password

```
/login
  → click "Forgot password?"
  → /forgot-password: enter email → send reset link
  → /reset-password?token=… → enter new password → /login
```

---

## Implementation (Better Auth + Cloudflare)

### Shared Architecture Baselines

The following cross-cutting controls apply to this feature and the whole site:

- [Security Baseline](../designs/security.md)
- [Scalability Baseline](../designs/scalability.md)
- [Reliability Baseline](../designs/reliability.md)
- [Observability Baseline](../designs/observability.md)
- [Maintainability Baseline](../designs/maintainability.md)

### Auth Strategy

- Use Better Auth as the application auth layer for email/password and OAuth.
- Ship Microsoft as the only social provider for MVP.
- Keep GitHub disabled for launch and revisit post-MVP.

### Server Integration

- Define auth config in `src/lib/server/auth.ts`.
- Wire Better Auth into SvelteKit via `hooks.server.ts` using the Better Auth SvelteKit handler.
- Use Better Auth default API base path (`/api/auth/*`) for sign-in, callbacks, and session actions.

### Cloudflare Workers Compatibility

- Enable AsyncLocalStorage support in Worker config:
  - `compatibility_flags = ["nodejs_compat"]` (or `nodejs_als` if only ALS support is required).
- Pass Worker context `waitUntil` to Better Auth background task handler where deferred operations are enabled.

### Database

- Store Better Auth tables in Cloudflare D1.
- Use the D1 binding (`env.DB`) in Better Auth database config.
- Use Better Auth-managed schema/migrations workflow and run migrations as part of deployment checks.
- Persist household invite codes with expiry metadata and revocation status.
- Persist invite usage counters (`max_uses`, `remaining_uses`) and enforce atomic decrement on each successful redemption.
- Store invite redemption audit records (invite id, user id, timestamp, outcome).

### Environment Variables

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL` (public app URL)
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`

### Household Invite Model

- A household owner/admin can generate an invite code from household settings.
- Owner chooses a max uses value when generating the invite (e.g., 3 invites for 3 family members).
- Invite link format: `/register?invite=<CODE>` (or `/login?invite=<CODE>` for existing accounts).
- The register page includes one invite code input used for both manual entry and link-based invites.
- If a valid invite code is present in URL, prefill that input and default household action to "Join existing household".
- If no code is present, users can still select join and enter the code manually in the same input.
- Regenerating an invite code immediately invalidates previously issued active invite links.
- Invite codes from URL are treated as transient bootstrap values only: server exchanges them for short-lived join intents and clients remove the code from the address bar immediately.
- Join confirmation and invite redemption are idempotent for the same user + join intent token.
- Each successful join decrements `remaining_uses`; invite becomes invalid when `remaining_uses = 0`.

---

## Page Designs

All auth pages share a centred, single-column card layout with the site logo above, consistent with the white card / `bg-primary-50` surface pattern used throughout the design system.

### /register — Create Account

```
┌──────────────────────────────────────────┐
│         🍽 FussyEater Club                │  ← Logo/brand link to /
├──────────────────────────────────────────┤
│   Create your account                    │  ← h2, text-2xl, primary-900
│                                          │
│  Full name           [____________]      │
│  Email               [____________]      │
│  Password            [____________]      │  ← show/hide toggle
│  Confirm password    [____________]      │
│                                          │
│  Household setup                         │
│  (•) Create new household                │
│  ( ) Join existing household             │
│                                          │
│  Household name      [____________]      │  ← shown when "Create" selected
│  Invite code         [____________]      │  ← shown when "Join" selected; prefilled from URL `invite`
│                                          │
│  Social continuation mode                │  ← if arriving from Microsoft callback
│  - Email shown as read-only identity     │
│  - Password fields hidden                │
│                                          │
│  [ Continue ]                            │  ← Button color="yellow" fullWidth
│                                          │
│  ───────────── or ─────────────          │
│  [ 🔵 Continue with Microsoft ]          │  ← Button color="light" fullWidth
│                                          │
│  Already have an account? Log in         │  ← link to /login
└──────────────────────────────────────────┘
```

### /login — Sign In

```
┌────────────────────────────────────┐
│         🍽 FussyEater Club          │
├────────────────────────────────────┤
│   Welcome back                     │
│                                    │
│  Email             [____________]  │
│  Password          [____________]  │
│                          Forgot?   │  ← small link, right-aligned
│                                    │
│  [ Sign in ]                       │  ← Button color="yellow" fullWidth
│                                    │
│  ─────────── or ───────────        │
│  [ 🔵 Continue with Microsoft ]    │
│                                    │
│  No account yet? Register          │  ← link to /register
└────────────────────────────────────┘
```

---

## Components & Tokens

| Element | Flowbite component | Notes |
|---|---|---|
| Page wrapper | — | `min-h-dvh bg-primary-50 flex items-center justify-center px-4` |
| Card | `<Card>` | `border-primary-200 bg-white w-full max-w-sm` |
| Heading | — | `text-2xl font-semibold text-primary-900` |
| Label + Input | `<Label>` + `<Input>` | Standard pattern from design system |
| Password input | `<Input type="password">` | Suffix slot for show/hide toggle |
| Primary action | `<Button color="yellow">` | Full width |
| Social button | `<Button color="light">` | Full width, icon prefix |
| Divider | — | `<hr>` with "or" label, `text-primary-600 text-sm` |
| Error alert | `<Alert color="red">` | Inline, above primary action |
| Spinner | `<Spinner>` | Replaces button text during submit |

---

## Validation

### Register

| Field | Rules |
|---|---|
| Full name | Required, 2–100 chars |
| Email | Required, valid format |
| Password | Required, min 8 chars, at least one number |
| Confirm password | Must match password |
| Household action | Required; one of `create` or `join` |
| Household name | Required when action is `create`; 2–100 chars; unique per owner |
| Invite code | Required when action is `join`; prefilled from `invite` URL param when available |

### Login

| Field | Rules |
|---|---|
| Email | Required, valid format |
| Password | Required |

### Household Join

| Field                 | Rules                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| Invite code           | Required when joining manually; case-insensitive; format validated server-side                         |
| Invite status         | Must exist, not expired, not revoked, and still joinable (`remaining_uses > 0`)                        |
| Membership constraint | User may belong to only one household in MVP; joining is blocked if already assigned                   |
| Concurrency behavior  | Invite redemption decrements `remaining_uses` atomically; parallel attempts fail once limit is reached |

Client-side validation runs on blur. Server returns field-level errors on failed submission; displayed beneath each field (`text-sm text-red-600`).

---

## Error & Loading States

- **Submit in progress**: button disabled, shows `<Spinner size="4" />` inline
- **Field error**: `<Helper color="red">` beneath the input
- **Form-level error** (e.g. wrong credentials): `<Alert color="red">` above the submit button
- **Social login failure**: same `<Alert color="red">` with short message + retry link
- **Rate limit hit**: show friendly cooldown message with retry-after hint; do not reveal account-existence details
- **Temporary service issue**: show non-destructive retry guidance and preserve form state

---

## Decisions (Resolved)

1. **Cloudflare Access scope**: Cloudflare Access is used for admin/infrastructure protection only; Better Auth is the end-user auth system.
2. **Invite code policy**: Use 8-character uppercase alphanumeric codes (exclude ambiguous chars), default 7-day expiry, manually revocable by household owner, with configurable max uses and atomic decrement per redemption.
3. **Account verification**: Skip mandatory email verification for MVP to reduce onboarding friction; add verification post-MVP.
4. **Social provider scope for MVP**: Ship Microsoft-only social login for MVP; keep GitHub disabled.
5. **Invite prefill behavior**: Keep prefilled invalid code in the input and show inline validation error so users can edit and retry.
6. **Household name uniqueness**: Enforce uniqueness per owner (not global).
7. **Membership model (MVP)**: One account may belong to only one household.
8. **Invite regeneration**: Owner can regenerate code and this immediately invalidates prior links.
9. **Cross-cutting quality controls**: Security, scalability, reliability, observability, and maintainability requirements come from shared design baselines in [docs/designs/security.md](../designs/security.md), [docs/designs/scalability.md](../designs/scalability.md), [docs/designs/reliability.md](../designs/reliability.md), [docs/designs/observability.md](../designs/observability.md), and [docs/designs/maintainability.md](../designs/maintainability.md).

---

## API Contracts (MVP)

### POST /api/invites/redeem

Purpose: Exchange an invite code for a short-lived join intent token.

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
- `409`: user already belongs to a household (when authenticated)
- `429`: rate limited
- `503`: transient service/database unavailable

### POST /api/register/complete

Purpose: Complete registration and apply household action in one transaction.

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
- `409`: unique-per-owner household name conflict, or single-household membership conflict
- `410`: join intent expired or invite exhausted during confirmation
- `429`: rate limited
- `503`: transient service/database unavailable

### POST /api/households/invites

Purpose: Generate or regenerate an invite code with configurable max uses.

Request body:

- `maxUses`: integer (`>=1`, required)
- `expiresInDays`: integer (`>=1`, default 7)
- `regenerate`: boolean (if true, invalidates active prior codes)
- `idempotencyKey`: string (required)

Success response (`201`):

- `code`
- `maxUses`
- `remainingUses`
- `expiresAt`

Failure responses:

- `403`: caller is not household owner/admin
- `400`: invalid maxUses/expiresInDays
- `429`: rate limited
- `503`: transient service/database unavailable

### DELETE /api/households/invites/{inviteId}

Purpose: Revoke an active invite before expiry.

Success response (`204`):

- No body

Failure responses:

- `403`: caller is not household owner/admin
- `404`: invite not found

### GET /api/households/invites

Purpose: List active and recent invites with usage status.

Success response (`200`):

- `invites[]`: `{ id, codeMasked, maxUses, remainingUses, expiresAt, status }`

Failure responses:

- `403`: caller is not household owner/admin

---

## Acceptance Criteria (MVP)

1. Register with `householdAction=create` creates account and household in one successful submission.
2. Register with valid invite code and `householdAction=join` consumes one invite use and joins household.
3. Prefilled `invite` query is removed from URL after redeem; user can still edit code input before submit.
4. When `remaining_uses` reaches `0`, subsequent redeem attempts fail with a clear "invite exhausted" error.
5. Parallel redeem attempts against the same last available use result in exactly one success.
6. Regenerating invite code invalidates previous active links immediately.
7. User already in a household cannot join another household in MVP and receives deterministic conflict response.
8. Social continuation mode does not request password re-entry and preserves provider identity.
9. Household name uniqueness is enforced per owner only.
10. Revoking an invite immediately blocks further redeems for that invite.
11. Invite list endpoint never returns full raw codes after creation (masked display only).
12. Repeated submit retries with the same idempotency key do not create duplicate users, households, or invite records.
13. Existing authenticated sessions remain valid across rollout and rollback events.
14. New schema fields are backward-compatible and do not break legacy reads/writes.
15. Feature-specific implementation follows shared architecture baselines in [docs/designs/security.md](../designs/security.md), [docs/designs/scalability.md](../designs/scalability.md), [docs/designs/reliability.md](../designs/reliability.md), [docs/designs/observability.md](../designs/observability.md), and [docs/designs/maintainability.md](../designs/maintainability.md).

---

## Engineering Breakdown

### Phase 1: Data And Contracts

1. Add D1 schema changes for invite status, usage counters, and audit metadata.
2. Update API contract source of truth in TypeSpec for all auth and invite endpoints used by this feature.
3. Regenerate API types and confirm no breaking type regressions in existing consumers.

Deliverables:

1. Migration file(s) under migrations.
2. Updated TypeSpec endpoint and schema definitions.
3. Regenerated frontend API type artifacts.

Dependencies:

1. None.

Risk:

1. Medium: schema and contract drift if migrations and TypeSpec updates are not shipped together.

### Phase 2: Core Server Flows

1. Implement invite redeem endpoint with short-lived join intent exchange.
2. Implement register-complete endpoint for create or join household action.
3. Implement invite create/list/revoke endpoints with owner authorization.
4. Enforce owner-scoped household-name uniqueness and single-household membership guard.

Deliverables:

1. Route handlers under src/routes/api.
2. Shared server logic under src/lib/server for invite and registration orchestration.
3. Deterministic error mapping for 400/401/403/404/409/410/429/503.

Dependencies:

1. Phase 1 complete.

Risk:

1. High: race conditions around invite usage counters if atomic decrement is not implemented correctly.

### Phase 3: Client Registration Experience

1. Build SPA register flow with create versus join household branch.
2. Implement invite query prefill and immediate URL cleanup after redeem.
3. Implement social continuation mode with read-only identity and no password recollection.
4. Add resilient error states and preserved form state for retryable failures.

Deliverables:

1. Updated registration page/component logic.
2. Client-side validation and conditional-field behavior.
3. UX copy for conflict, exhausted invite, rate limit, and transient service states.

Dependencies:

1. Phase 2 endpoints available in local/staging.

Risk:

1. Medium: user confusion if create/join mode transitions and field visibility are not clear.

### Phase 4: Security And Quality Controls

1. Add CSRF verification, generic auth error behavior, and endpoint-level authorization checks.
2. Add idempotency key enforcement for mutating endpoints.
3. Add logging redaction and correlation-id propagation.
4. Add rollout flags and ensure flags-off behavior preserves legacy paths.

Deliverables:

1. Security middleware and endpoint guards.
2. Idempotency storage and replay-safe handling.
3. Feature flag wiring and runtime checks.

Dependencies:

1. Phase 2 complete.

Risk:

1. High: security regressions if any mutating endpoint bypasses shared controls.

### Phase 5: Verification And Rollout

1. Implement unit, integration, and e2e tests for all critical acceptance criteria.
2. Add concurrency tests for final remaining invite use and idempotency replays.
3. Validate observability events and release guardrail metrics in staging.
4. Execute staged rollout and stop on guardrail breach.

Deliverables:

1. Automated tests in test suite.
2. Staging sign-off checklist.
3. Production rollout log with ramp decisions.

Dependencies:

1. Phases 1 to 4 complete.

Risk:

1. Medium: insufficient load and race-condition coverage may miss production edge cases.

### Suggested Ticket Slice

1. Ticket A: Schema and TypeSpec contracts.
2. Ticket B: Invite redeem and join intent server flow.
3. Ticket C: Register-complete create/join orchestration.
4. Ticket D: Invite management APIs (create/list/revoke).
5. Ticket E: Register UI create/join + invite prefill.
6. Ticket F: Social continuation mode.
7. Ticket G: Security middleware, idempotency, and logging redaction.
8. Ticket H: Test matrix implementation and rollout readiness.

Definition of done for this feature:

1. All acceptance criteria in this document pass.
2. Shared architecture baseline requirements are satisfied.
3. Rollout can be disabled via flags without data loss.

---

## Accessibility

- All inputs have visible `<Label>` and `aria-describedby` pointing to any helper/error text
- Password show/hide toggle uses `aria-label="Show password"` / `"Hide password"`
- Submit button communicates loading state with `aria-busy="true"` during submission
- Household action radio group is keyboard-operable and announced with clear group label.
- Focus order in register mode: name → email → password → confirm → household action → conditional household field (name or invite code) → submit → social button.
- Switching household action moves focus to the newly revealed conditional field.
- Invite validation errors (including invalid prefilled invite) are announced via `aria-live="polite"`.

---

## Open Questions

None for MVP scope.
