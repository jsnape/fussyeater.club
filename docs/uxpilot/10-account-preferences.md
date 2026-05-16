# Account & Preferences

> Route: `/account`

## Purpose

Manage account settings, notification preferences, and view the allergy safety disclaimer. Provides a single location for all user-level configuration.

---

## Layout

- Standard app header with navigation (includes notification bell + user avatar)
- Two-column layout: settings sidebar navigation (left) + settings content (right)
- On mobile: sidebar becomes a horizontal scrollable tab bar or collapses into a menu

---

## Settings Sidebar (sticky on desktop)

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

---

## Settings Content

### Account & Security

- Section heading + subtitle: "Manage your email, password, and primary caregiver details."
- Card containing:
  - **Profile photo:** circular avatar with camera overlay on hover (click to change)
  - **Caregiver Name** — text input, pre-filled
  - **Email Address** — email input, pre-filled
  - **Phone (Optional)** — tel input
  - Divider
  - "Change Password" text link
  - "Save Changes" primary button (right-aligned)

### Notification Preferences

- Section heading + subtitle: "Choose how and when we reach out to you."
- Card with toggle rows:
  - **Weekly Meal Plan Reminders**
    - Description: "Get a nudge to build your plan for the week."
    - Toggle switch (on/off)
  - Divider
  - **New Safe Recipe Alerts**
    - Description: "When we add recipes matching your household's safe list."
    - Toggle switch (on/off)

### Allergy & Safety Disclaimer

- Highlighted callout card (distinct from regular content cards):
  - Shield/heart icon
  - Heading: "A Note on Allergy Safety"
  - Body text: disclaimer that ingredient formulations change, users should always double-check labels, and the app provides suggestions but is not a substitute for medical advice

---

## Key Interactions

- Sidebar navigation scrolls the content area to the relevant section (smooth scroll with scroll-margin offset)
- "Save Changes" saves account profile edits
- "Change Password" opens a password change flow (inline expansion or modal)
- Notification toggles save immediately on change (no separate save button)
- "Sign Out" logs the user out and redirects to the landing page
- Profile photo click opens file picker for a new avatar image
