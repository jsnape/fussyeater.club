---
status: design-review
---

# Household

Manage the current household after registration. MVP scope is intentionally narrow:

1. List current household members.
2. Manage household invite codes (create/regenerate, revoke, and monitor remaining uses).

---

## Route

| Path         | Purpose                                      |
| ------------ | -------------------------------------------- |
| `/household` | Household members and invite management page |

---

## Source Scope

This page reuses behavior already defined in [docs/features/registration.md](../features/registration.md):

- One-account-to-one-household model in MVP.
- Invite lifecycle: create, redeem, revoke, exhaust.
- Invite counters: `max_uses` and `remaining_uses`.
- Invite link format based on registration entry points.

This feature must also conform to shared baselines:

- [Security Baseline](../designs/security.md)
- [Scalability Baseline](../designs/scalability.md)
- [Reliability Baseline](../designs/reliability.md)
- [Observability Baseline](../designs/observability.md)
- [Maintainability Baseline](../designs/maintainability.md)

---

## User Flows

### Household Owner Views Household Page

```
/household
  -> load household summary
  -> list members (name, email, role, joined date)
  -> list active/recent invites with usage state
```

### Create Or Regenerate Invite

```
/household
  -> click "Create invite" (or "Regenerate invite")
  -> provide max uses and optional expiry days
  -> submit
  -> server returns new code + remaining uses + expiry
  -> new invite appears in list
  -> previous active code is invalidated when regenerate=true
```

### Revoke Invite

```
/household
  -> click revoke on an active invite
  -> confirm action
  -> submit revoke
  -> invite status updates to revoked
  -> invite can no longer be redeemed
```

---

## Page Design (MVP)

Single-page, two-section layout with clear operational hierarchy.

### Design Standards

Follow the project design system in [design-system/fussyeater-club/MASTER.md](../../design-system/fussyeater-club/MASTER.md).

- Visual voice: warm, practical, and reassuring.
- Use existing Flowbite-Svelte components first, then minimal custom styling.
- Keep touch targets at least 44x44.
- Ensure visible focus states and minimum 4.5:1 text contrast.
- Use masked invite codes except at creation/regeneration confirmation.

### Section A: Members

```
┌─────────────────────────────────────────────────────────────┐
│ Household Members                                           │
├─────────────────────────────────────────────────────────────┤
│ Name             Email                  Role      Joined    │
│ Alex Carter      alex@example.com       owner     2026-04-01│
│ Sam Lee          sam@example.com        member    2026-04-02│
│ ...                                                         │
└─────────────────────────────────────────────────────────────┘
```

Display fields:

- Member name
- Member email
- Role (`owner` or `member`)
- Joined timestamp (human readable)

MVP constraints:

- Read-only members table (no role editing/removal in this phase).

### Section B: Invites

```
┌─────────────────────────────────────────────────────────────┐
│ Household Invites                              [Create Invite]
├─────────────────────────────────────────────────────────────┤
│ Active Invites                                              │
│ Code: ABCD-EFGH                                             │
│ Uses: 2 / 3                                                 │
│ Expires: 2026-04-12                                         │
│ [Copy Link] [Regenerate] [Revoke]                           │
│                                                             │
│ Expired Invites                                             │
│ Masked Code   Status     Remaining   Expires      Updated   │
│ JKL...QRS     revoked    0 / 3       2026-04-10   yesterday │
└─────────────────────────────────────────────────────────────┘
```


The household page contains an invites section with two areas:

- **Active Invite** (single current invite, if one exists)
- **Expired Invites** (non-active historical invites only)

### Active Invite

Displays:

- Full code **only immediately after create/regenerate**
- Uses as `used / max` (`maxUses - remainingUses` / `maxUses`)
- Expiry date

Actions:

- **Copy Link** → copies `/register?invite=<CODE>`
- **Regenerate invite** → revokes prior active invite and creates a new one
- **Revoke** → revokes the current active invite

### Expired Invites

Displays columns:

- Masked code
- Status (`revoked`, `expired`, `exhausted`)
- Uses as `used / max`
- Expiry date

Rules:

- Active invites are not shown in the expired invites list.
- Historical rows do not include per-row action buttons.
- At most one invite is active at any time.

### Create vs Regenerate

- Show **Create invite** when there is no active invite.
- Show **Regenerate invite** when an active invite exists.
- Both paths refresh the full invite list after success.

Display fields:

- Masked code for historical invites.
- Full code shown only immediately after creation/regeneration.
- Status (`active`, `revoked`, `exhausted`, `expired`).
- Remaining uses vs max uses.
- Expiry timestamp.

Actions:

- Create invite
- Regenerate invite (invalidates previous active invite)
- Revoke invite
- Copy registration link (`/register?invite=<CODE>`)

---

## API Dependencies

This page relies on existing registration-scope API contracts.

### GET /api/households/invites

Used to render active and recent invites.

Response shape:

- `invites[]`: `{ id, codeMasked, maxUses, remainingUses, expiresAt, status }`
- Return active invite plus up to 20 recent historical invites, ordered by most recently updated.

### POST /api/households/invites

Used to create or regenerate an invite.

Request:

- `maxUses`: integer (`>=1`, required)
- `expiresInDays`: integer (`>=1`, optional default 7)
- `regenerate`: boolean
- `idempotencyKey`: string (required)

Response:

- `code`
- `maxUses`
- `remainingUses`
- `expiresAt`

### DELETE /api/households/invites/{inviteId}

Used to revoke an active invite.

Response:

- `204` no body on success

### GET /api/households/members

Canonical members endpoint for household page rendering.

Response shape:

- `members[]`: `{ userId, name, email, role, joinedAt }`

Error responses:

- `403`: authenticated user is not allowed to view household members.
- `404`: household not found for current user context.
- `503`: transient service/database unavailable.

Contract source of truth:

- Define this endpoint in TypeSpec before implementation.
- Regenerate API types after TypeSpec compile.

---

## Validation And Rules

### Invite Create/Regenerate

- `maxUses` required and `>=1`.
- `expiresInDays` required to be `>=1` when supplied.
- Only household owner may create or regenerate invites in MVP.
- Regenerate operation invalidates previous active invite immediately.

### Invite Revoke

- Only household owner may revoke invites in MVP.
- Revoking an already revoked/exhausted/expired invite is idempotent on UI state.

### Member List

- User must be authenticated and belong to a household.
- If user has no household, show deterministic empty-state guidance.

---

## Cross-Cutting Controls (Required)

Security requirements:

- CSRF protection is required on `POST /api/households/invites` and `DELETE /api/households/invites/{inviteId}`.
- Never log raw invite codes in server logs or analytics payloads.
- Return deterministic `403` for unauthorized household invite mutations.

Observability requirements:

- Every request/response path includes request correlation via `x-request-id`.
- Emit structured audit events for create/regenerate/revoke invite actions:
  - `event`, `action`, `actorId`, `householdId`, `inviteId` (if available), `outcome`, `timestamp`
- Emit explicit idempotency replay events for create/regenerate replays.

Reliability and scalability requirements:

- Create/regenerate requires `idempotencyKey`.
- Duplicate in-flight idempotency requests return deterministic `409` for create/regenerate.
- Invite listing is bounded and index-friendly:
  - Return active invite plus up to 20 recent historical invites sorted by `updatedAt` descending.

---

## Error And Loading States

- Members loading: skeleton rows.
- Invite list loading: skeleton cards/rows.
- Form submit in progress: disable action button and show spinner.
- `403`: show permission error (household owner required for invite mutations).
- `404`: invite not found for stale revoke action.
- `409`: shown only for duplicate in-progress idempotent create/regenerate requests.
- `429`: show cooldown guidance and retry-after hint.
- `503`: show retry guidance and preserve current page state.

Contract alignment notes:

- Revoke endpoint currently uses `204`/`403`/`404`/`503` only.
- If `409` is needed for revoke contention, add it in TypeSpec and implementation before UI depends on it.

---

## Accessibility

- Members and invites presented in semantic tables or equivalent list semantics.
- Action buttons have descriptive labels (for example, "Revoke invite ABC...FGH").
- Copy-link and status updates announced with `aria-live="polite"`.
- Keyboard focus returns to a logical control after modals/confirmations.
- Minimum touch target size 44x44 for invite action controls.

---

## Acceptance Criteria (MVP)

1. Household page displays all current members for the active household.
2. Household page displays invite status including remaining uses and expiration.
3. Household owner can create an invite with configurable max uses.
4. Household owner can regenerate invite and immediately invalidate prior active code.
5. Household owner can revoke an invite and revoked invite cannot be redeemed.
6. Full invite code is only shown at create/regenerate time; historical list remains masked.
7. Invite management actions are idempotent at the UI level and resilient to retries.
8. Error states for `403`, `429`, and `503` are user-friendly and non-destructive.

---

## Verification Plan

Required checks before feature sign-off:

- Contract tests:
  - TypeSpec includes all household endpoints and error codes used by UI.
  - Generated API types match implemented handlers.

- Integration tests:
  - Owner can list/create/regenerate/revoke invites.
  - Non-owner receives deterministic `403` on invite mutations.
  - Duplicate in-flight create/regenerate with same `idempotencyKey` returns deterministic `409` behavior.
  - Revoke stale/nonexistent invite returns deterministic `404` behavior.

- Concurrency and idempotency:
  - Parallel create/regenerate attempts do not duplicate side effects.
  - Replay with same `idempotencyKey` returns the same successful result.

- Security and observability regression checks:
  - CSRF failures are enforced on mutation endpoints.
  - Logs redact invite codes and other sensitive fields.
  - Responses include `x-request-id` and logs include `requestId`.
  - Audit events are emitted for create/regenerate/revoke outcomes.

---

## Out Of Scope (For Future Iterations)

- Editing member roles.
- Removing members from household.
- Audit timeline UI beyond basic invite status timestamps.
- Multi-household membership support.
