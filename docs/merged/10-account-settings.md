# Account Settings

> Route: `/account`
>
> Current status: **Not started** — new page.

## Purpose

Manage personal account details, notification preferences, and app-wide settings. Separate from household management (which lives at `/household`).

---

## Layout

- Standard app header with navigation
- Centred content area (max-width constrained)
- Vertical sections with dividers

---

## Sections

### 1. Profile

- Avatar with edit overlay (upload or change)
- Display name (editable inline or via input)
- Email address (display only — change requires verification flow)
- "Change Password" button → expands to show current/new/confirm password fields

### 2. Notifications

- Toggle switches:
  - "Meal plan reminders" — daily/weekly nudge to complete the plan
  - "Shopping list ready" — notify when list is generated
  - "Household activity" — new members, invites redeemed
  - "Recipe suggestions" — periodic recipe inspiration
- Delivery method selector (future): email, push, or both

### 3. Preferences

- **Default servings:** number input (used as default when creating recipes)
- **Week starts on:** dropdown (Monday / Sunday)
- **Measurement units:** radio group (Metric / Imperial)
- **Dietary profile sync:** toggle with note — "Apply your household profiles to recipe browse and meal planner" (mirrors the toggle on `/household` profiles tab for convenience)

### 4. Data & Privacy

- "Export my data" button — downloads account data as JSON/CSV
- "Delete my account" danger button — confirmation dialog with consequences explained
- Privacy policy link
- Terms of service link

### 5. Household Summary (read-only)

- Household name
- Role in household
- Member count
- "Manage Household →" link to `/household`

---

## Key Interactions

- Profile changes auto-save on blur or via explicit "Save" button per section
- Password change requires current password verification
- "Delete account" shows a multi-step confirmation (type household name to confirm)
- Preference toggles take effect immediately
- Export generates a downloadable file (async, with progress indicator if large)
