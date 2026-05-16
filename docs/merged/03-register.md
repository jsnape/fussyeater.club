# Register

> Route: `/register`
>
> Current status: **Implemented** — supports create household, join via invite, and Microsoft continuation.

## Purpose

Create a new user account. Supports two paths: creating a new household or joining an existing one via invite code.

---

## Layout

- Centred card on a minimal background (matches login page style)
- Logo above the card
- Footer link back to landing page

---

## Registration Card

- **Heading:** "Create your account"
- **Subtitle:** Welcoming copy about getting started

### Form Fields

- Display name input (required)
- Email input (required, email validation)
- Password input (required, min length, with show/hide toggle)
- Confirm password input (required, must match)

### Household Choice (radio group)

- **"Start a new household"** — user becomes Owner of a new household
- **"Join an existing household"** — reveals invite code input

### Invite Code Section (conditional)

- Appears when "Join an existing household" selected
- Code input field (pre-filled if `?invite=` param present)
- "Redeem" button to validate the code
- Success state: shows household name + confirmation
- Error state: invalid/expired code message

### Actions

- "Create Account" primary submit button (full-width)
- Divider with "or" text
- "Continue with Microsoft" OAuth button (feature-flagged)

### Footer

- "Already have an account? Log in" link

---

## Microsoft Continuation Path

- If user arrives from Microsoft OAuth redirect, email is pre-filled and password fields are hidden
- User only needs to set display name and choose household option

---

## Error States

- Email already registered: inline error with link to login
- Weak password: inline validation feedback
- Invalid invite code: error with retry option
- Network error: generic retry message

---

## Current Implementation Notes

Fully functional. Registration completes via POST to `/api/register/complete` after optional invite redemption via POST to `/api/invites/redeem`. No functional changes needed — visual polish only.

---

## Key Interactions

- Invite code param auto-selects "Join" radio and pre-fills code
- Redeeming invite is a separate action before account creation
- On success: redirects to `/login` with success message
- Password strength indicator updates in real-time
