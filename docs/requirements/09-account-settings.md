# Account Settings

> Route: `/account`
>
> Current status: **Not started** — new page.

## Purpose

Manage personal account details, notification preferences, app-wide settings, and view the allergy safety disclaimer. Separate from household management (which lives at `/household`).

---

## Layout

- Standard app header with navigation (includes notification bell + user avatar)
- Centred content area (max-width constrained)
- Two-column layout: settings sidebar navigation (left) + settings content (right)
- On mobile: sidebar becomes a horizontal scrollable tab bar or collapses into a menu
- Vertical sections with dividers

---

## Sections

### Settings Sidebar (sticky on desktop)

Vertical navigation list:
- **Account Profile** (icon: user)
- **Notifications** (icon: bell)
- **Household Defaults** (icon: house)
- **Content Preferences** (icon: sliders)
- **Subscription & Billing** (icon: credit card)
- Divider
- **Help & Support** (icon: question circle)
- **Sign Out** (icon: arrow, destructive/warning style)

Active item has highlighted background. Clicking an item scrolls the content panel to that section.

### 1. Profile

- Avatar with edit overlay (upload or change); circular avatar with camera overlay on hover
- Display name / caregiver name (editable inline or via input)
- Email address (pre-filled; change requires verification flow)
- Phone (optional)
- "Change Password" button or text link → expands inline or opens a modal for the password change flow
- "Save Changes" primary button

### 2. Notifications

- Toggle switches:
  - "Meal plan reminders" — daily/weekly nudge to complete the plan
  - "Shopping list ready" — notify when list is generated
  - "Household activity" — new members, invites redeemed
  - "Recipe suggestions" — periodic recipe inspiration
  - "New safe recipe alerts" — when recipes matching the household's safe list are added
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
- Highlighted callout card: **A Note on Allergy Safety**
  - Shield/heart icon
  - Ingredient formulations change
  - Users should always double-check labels
  - The app provides suggestions but is not a substitute for medical advice

### 5. Household Summary (read-only)

- Household name
- Role in household
- Member count
- "Manage Household →" link to `/household`

---

## Key Interactions

- Sidebar navigation scrolls the content area to the relevant section (smooth scroll with scroll-margin offset)
- Profile changes auto-save on blur or via an explicit "Save Changes" button per section
- Password change requires current password verification
- Preference and notification toggles take effect immediately and save on change
- Profile photo click opens a file picker for a new avatar image
- "Delete account" shows a multi-step confirmation (type household name to confirm)
- Export generates a downloadable file (async, with progress indicator if large)
- "Sign Out" logs the user out and redirects to the landing page
