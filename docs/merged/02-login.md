# Login

> Route: `/login`
>
> Current status: **Implemented** — functional email/password login with invite code awareness.

## Purpose

Authenticate existing users. Support invite-code flows and future OAuth providers.

---

## Layout

- Centred card on a minimal background (no sidebar, no app chrome)
- Logo above the card
- Footer link back to landing page

---

## Login Card

- **Heading:** "Welcome back"
- **Subtitle:** Brief welcome text

### Form Fields

- Email input (required, email validation)
- Password input (required, with show/hide toggle)
- "Forgot password?" link (below password field)

### Actions

- "Sign In" primary submit button (full-width)
- Divider with "or" text
- OAuth button: "Continue with Microsoft" (disabled state with "Coming soon" until feature flag enabled)

### Footer

- "Don't have an account? Register" link
- If `?invite=` param present: highlight callout directing to `/register?invite=...`

---

## Error States

- Invalid credentials: inline error message above form
- Account locked/disabled: distinct error with support link
- Network error: generic retry message

---

## Current Implementation Notes

All of the above is functional. The Microsoft OAuth button exists but is feature-flagged off. No changes needed beyond visual polish to match the merged design system.

---

## Key Interactions

- Form submission POSTs to `/api/auth/login`
- On success: invalidates auth session cache, redirects to `/` (or return URL if provided)
- Invite code param preserved through the flow
- Tab/enter keyboard navigation supported
