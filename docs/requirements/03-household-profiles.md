# Household & Profiles

> Route: `/household`
>
> Current status: **Partially implemented** — household members and invite management are implemented; dietary profiles are not yet built.

## Purpose

Manage the household in two dimensions:

1. **Team management** — members, roles, permissions, and invitations.
2. **Dietary profiles** — per-member allergies, sensory preferences, safe foods, and dislikes.

This page is the data engine of the app. Household profile data drives recipe filtering, planner safety checks, and shopping list generation.

---

## Source Scope

This page reuses behavior already defined in `docs/features/registration.md`:

- One-account-to-one-household model in MVP.
- Invite lifecycle: create, redeem, revoke, exhaust.
- Invite counters: `max_uses` and `remaining_uses`.
- Invite link format based on registration entry points.

This feature must also conform to the shared baselines referenced by the household feature:

- Security Baseline
- Scalability Baseline
- Reliability Baseline
- Observability Baseline
- Maintainability Baseline

---

## Layout

- Standard app header with navigation.
- Page header with title and subtitle.
- Tabbed interface with two tabs: **Team** and **Profiles**.
- Content adapts per tab.
- On desktop, Team uses a two-column bento layout with main content and an invite sidebar; Profiles uses a two-column member-list/detail-editor layout.
- Stacks vertically on mobile.
- Same footer as the landing page footer.

### Page Header

- **Team title:** "Household Settings"
- **Team subtitle:** "Manage your family members and kitchen permissions."
- **Profiles title:** "Household Profiles"
- **Profiles subtitle:** explanatory text about managing family members and how preferences filter recipes.

---

## Tab 1: Team

### Household Summary

- Household name (editable inline).
- Seat usage indicator/badge (for example, "2 of 3 Seats Filled" or "3 of 5 seats filled").
- Status cards grid may include:
  - **Pending Invitation** card with active invite count and expiry note.
  - **Subscription Plan** card with plan name and next billing date.

### Kitchen Team / Member List

- Card with heading such as **Kitchen Team** or **Household Members**.
- Vertical list of member rows showing:
  - Avatar (initials, placeholder, or photo).
  - Display name.
  - Email.
  - Role label/badge.
  - Joined timestamp (human readable).
- Role management UI in design includes:
  - Role dropdown selector for managed members.
  - Settings icon for admin-owned controls.
  - Role options shown in UX sources: Admin, Member, Viewer.
  - Role badges shown in UX sources: Owner, Admin, Member, Viewer.
- Remove button for non-owners, with confirmation.

### Empty Slots

- Dashed-border placeholder rows for unused seats.
- Person-add icon.
- "Empty Slot" label.
- "Ready for a new helper" subtitle.
- Empty slot is a visual indicator and is not clickable; the invite area is the entry point for adding someone.

### Invite Sidebar / Invite Section

- Sticky sidebar on desktop.
- Centered card layout with:
  - Large icon in a rotated square container.
  - Heading: "Invite a Family Member".
  - Description explaining code sharing for syncing meal plans.
- Access code display in a bordered or dashed container with label such as **ACCESS CODE**.
- Large active code text.
- Expiry countdown or expiry date.
- Info note explaining invite codes grant **Member** access by default and can be upgraded later.

#### Active Invite

Displays:

- Full code for the current active invite.
- Uses as `used / max` (`maxUses - remainingUses` / `maxUses`).
- Expiry date.

Actions:

- **Copy Link** / **Copy Invite Link** to copy `/register?invite=<CODE>`.
- **Create invite** when there is no active invite.
- **Regenerate invite** when an active invite exists.
- **Revoke** to revoke the current active invite.

Rules:

- Previous active code is invalidated on regenerate.
- At most one invite is active at any time.
- Full code is shown only for the current active invite and at creation/regeneration confirmation.

#### Historical / Expired Invites

- Separate historical list for non-active invites only.
- Historical rows show:
  - Masked code.
  - Status (`revoked`, `expired`, `exhausted`).
  - Uses as `used / max`.
  - Expiry date.
- Historical rows do not include per-row action buttons.
- Active invites are not shown in the historical list.

### Decorative Section

- Full-width rounded image banner.
- Gradient text overlay.
- Inspirational family-cooking heading and body copy.

### Current Implementation

- Member list and invite management are functional.
- Invite create, revoke, and copy flow works.
- Role editing and seat limits are not yet implemented.
- MVP member management remains read-only.

---

## Tab 2: Profiles

### Sync Preferences Toggle

- Prominent toggle card at the top of the tab.
- Icon + "Sync Preferences" label.
- Subtitle such as "Apply to Browse & Meal Planner".
- When enabled, profile data actively filters recipes site-wide and flags planner conflicts.
- When disabled, profiles are stored but do not affect other views.
- Sync setting persists independently via API.

### Family Member Selector

- Active member selector with highlighted current member.
- Clicking a member switches the editor context below with no page reload.
- UX references include:
  - A horizontal scrollable row of member avatar chips.
  - A family member list/card column with **Family Members** heading and **+ Add Member** action.
- Member item states include:
  - **Active/editing** styling with strong border treatment or editing indicator.
  - **Inactive** styling with muted appearance.
- Member items can show:
  - Avatar.
  - Name and role label.
  - Age range and short description.
  - Quick-view allergy tags and safe food tags.
- **+ Add Member** opens a form or modal to create a new family member with name, role (`child`/`adult`), and age range.

### Profile Editor (Selected Member)

#### Header

- Large avatar with camera/edit overlay.
- Member name with inline edit affordance.
- Role label.
- Age range selector.
- Subtitle such as "Managing preferences for 1 family member".
- "Save Changes" primary button.

#### Allergies & Intolerances

- Section icon, heading, and explanatory subtitle.
- Grid of allergy items.
- Each item shows:
  - Ingredient name.
  - Severity badge.
  - Remove action.
- Severity examples:
  - Severe (Anaphylaxis)
  - Moderate
  - Mild Intolerance
- Add flow via **+ Add Allergy** or **Add New**.
- Add form captures ingredient plus severity.

#### Sensory & Textures

- Heading and question prompt such as "What textures does [name] struggle with?"
- Horizontal wrap of toggle-style buttons.
- Unselected textures are neutral.
- Selected textures are emphasized and removable.
- **+ Add Custom** affordance with dashed styling.
- Predefined options across sources include:
  - Mushy
  - Slimy
  - Crunchy
  - Mixed Textures
  - Chewy
  - Stringy
  - Grainy

#### Safe Foods

- Heading with heart icon.
- Subtitle: "Always accepted ingredients".
- Tag/chip input pattern.
- Existing items shown as removable chips.
- Inline text input to add new items.
- Example items:
  - Plain Pasta
  - Chicken Nuggets
  - Apples

#### Dislikes

- Heading with thumbs-down icon.
- Subtitle: "Try to avoid, but not allergic".
- Same tag/chip input pattern as safe foods.
- Example items:
  - Broccoli
  - Onions
  - Mushrooms

### Current Implementation

**Not built.** The Profiles tab, dietary data model, and profile CRUD operations are new work and require:

- New database tables for family member profiles, allergies, textures, safe foods, and dislikes.
- New API endpoints for profile CRUD.
- TypeSpec additions for profile models.

---

## Key Interactions

- Tab switching preserves state with no page reload.
- Member selector changes the active profile editor context.
- Allergy, texture, safe food, and dislike changes are collected locally and saved with **Save Changes**.
- Sync Preferences is a separate setting and persists independently.
- Role dropdown changes are intended to take effect immediately, with optimistic update and rollback on error.
- Copy-link actions copy the invite URL/code to the clipboard with confirmation.
- Regenerating an invite invalidates the previous code and requires confirmation.
- Form submit states disable actions and show progress feedback.

---

## API Dependencies

### GET `/api/households/members`

Canonical members endpoint for household page rendering.

Response shape:

- `members[]`: `{ userId, name, email, role, joinedAt }`

Error responses:

- `403`: authenticated user is not allowed to view household members.
- `404`: household not found for current user context.
- `503`: transient service or database unavailable.

Contract source of truth:

- Define this endpoint in TypeSpec before implementation.
- Regenerate API types after TypeSpec compile.

### GET `/api/households/invites`

Used to render the active invite and recent invite history.

Response shape:

- `invites[]`: `{ id, codeMasked, code?, maxUses, remainingUses, expiresAt, status }`

Rules:

- Return the active invite plus up to 20 recent historical invites.
- Order by most recently updated.
- The active invite may include `code` so the UI can copy the registration link after refresh.
- Historical invites return `codeMasked` only.

### POST `/api/households/invites`

Used to create or regenerate an invite.

Request:

- `maxUses`: integer (`>=1`, required)
- `expiresInDays`: integer (`>=1`, optional, default 7)
- `regenerate`: boolean
- `idempotencyKey`: string (required)

Response:

- `code`
- `maxUses`
- `remainingUses`
- `expiresAt`

### DELETE `/api/households/invites/{inviteId}`

Used to revoke an active invite.

Response:

- `204` with no body on success

### Profile APIs

Profile data and CRUD APIs are new work. The requirements sources call for new API endpoints for profile CRUD and TypeSpec additions for profile models, but do not define those endpoint contracts yet.

---

## Validation And Rules

### Invite Create / Regenerate

- `maxUses` is required and must be `>=1`.
- `expiresInDays` must be `>=1` when supplied.
- Only the household owner may create or regenerate invites in MVP.
- Creating or regenerating invalidates any previous active invite immediately.
- Invite creation and regeneration require `idempotencyKey`.

### Invite Revoke

- Only the household owner may revoke invites in MVP.
- Revoking an already revoked, exhausted, or expired invite is idempotent at the UI state level.

### Member List

- User must be authenticated and belong to a household.
- If the user has no household, show deterministic empty-state guidance.

### Profiles

- Profile data is stored per family member.
- Sync Preferences determines whether stored profile data actively filters recipes and planner behavior.

---

## Cross-Cutting Controls

### Security

- CSRF protection is required on `POST /api/households/invites` and `DELETE /api/households/invites/{inviteId}`.
- Never log raw invite codes in server logs or analytics payloads.
- Return deterministic `403` for unauthorized household invite mutations.
- Use masked invite codes except at creation or regeneration confirmation.

### Observability

- Every request and response path includes request correlation via `x-request-id`.
- Emit structured audit events for create, regenerate, and revoke invite actions with:
  - `event`
  - `action`
  - `actorId`
  - `householdId`
  - `inviteId` (if available)
  - `outcome`
  - `timestamp`
- Emit explicit idempotency replay events for create or regenerate replays.

### Reliability And Scalability

- Duplicate in-flight idempotency requests return deterministic `409` for create or regenerate.
- Parallel create or regenerate attempts must not duplicate side effects.
- Replay with the same `idempotencyKey` returns the same successful result.
- Invite listing is bounded and index-friendly: active invite plus up to 20 recent historical invites sorted by `updatedAt` descending.

---

## Error And Loading States

- Members loading uses skeleton rows.
- Invite loading uses skeleton cards or rows.
- Submit in progress disables the action button and shows a spinner.
- `403`: show permission error; household owner required for invite mutations.
- `404`: show stale or not-found revoke guidance.
- `409`: show duplicate in-progress idempotent create or regenerate guidance.
- `429`: show cooldown guidance and retry-after hint.
- `503`: show retry guidance and preserve current page state.

Contract alignment note:

- Revoke currently uses `204`, `403`, `404`, and `503` only.
- If `409` is required for revoke contention, add it in TypeSpec and implementation before UI depends on it.

---

## Accessibility And Design Standards

### Design Standards

- Follow the project design system.
- Visual voice is warm, practical, and reassuring.
- Use existing Flowbite-Svelte components first, then minimal custom styling.

### Accessibility

- Keep touch targets at least `44x44`.
- Ensure visible focus states.
- Maintain minimum `4.5:1` text contrast.
- Present members and invites in semantic tables or equivalent list semantics.
- Action buttons require descriptive labels such as "Revoke invite ABC...FGH".
- Copy-link and status updates are announced with `aria-live="polite"`.
- Keyboard focus returns to a logical control after modals or confirmations.

---

## Acceptance Criteria

1. The household page displays all current members for the active household.
2. The household page displays invite status, including remaining uses and expiration.
3. The household owner can create an invite with configurable max uses.
4. The household owner can regenerate an invite and immediately invalidate the prior active code.
5. The household owner can revoke an invite and a revoked invite cannot be redeemed.
6. Full invite codes are shown only for the current active invite and at create or regenerate time; historical invites remain masked.
7. Invite management actions are idempotent at the UI level and resilient to retries.
8. Error states for `403`, `429`, and `503` are user-friendly and non-destructive.
9. The Profiles tab supports per-member allergies, sensory preferences, safe foods, and dislikes.
10. Sync Preferences can be enabled or disabled independently and controls whether profile data affects Browse and Meal Planner behavior.

---

## Verification Plan

Required checks before sign-off:

- **Contract tests**
  - TypeSpec includes all household endpoints and error codes used by the UI.
  - Generated API types match implemented handlers.
- **Integration tests**
  - Owner can list, create, regenerate, and revoke invites.
  - Non-owner receives deterministic `403` on invite mutations.
  - Duplicate in-flight create or regenerate with the same `idempotencyKey` returns deterministic `409` behavior.
  - Revoke of a stale or nonexistent invite returns deterministic `404` behavior.
- **Concurrency and idempotency**
  - Parallel create or regenerate attempts do not duplicate side effects.
  - Replay with the same `idempotencyKey` returns the same successful result.
- **Security and observability regression checks**
  - CSRF failures are enforced on mutation endpoints.
  - Logs redact invite codes and other sensitive fields.
  - Responses include `x-request-id` and logs include `requestId`.
  - Audit events are emitted for create, regenerate, and revoke outcomes.

---

## Out Of Scope (Future Iterations)

- Editing member roles.
- Removing members from the household.
- Audit timeline UI beyond basic invite status timestamps.
- Multi-household membership support.
