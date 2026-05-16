# Your Household

> Route: `/household`

## Purpose

Manage household team members, roles, and invite new family members. This is focused on user/permission management rather than dietary profiles (which are handled elsewhere in list preferences).

---

## Layout

- Standard app header with navigation
- Page header with title + subtitle
- Two-column bento grid layout: main content (8 cols) + invite sidebar (4 cols)
- Stacks vertically on mobile

---

## Page Header

- Title: "Household Settings"
- Subtitle: "Manage your family members and kitchen permissions."

---

## Main Content Area (left)

### Kitchen Team Section

- Card with heading "Kitchen Team" + seat usage badge (e.g. "2 of 3 Seats Filled")
- Vertical list of member rows:
  - **Filled member row:**
    - Avatar circle (initial letter or photo)
    - Name + role label (e.g. "Admin", "Member")
    - Right side: settings icon (for admin) OR role dropdown selector (for member — options: Member, Admin, Viewer)
  - **Empty slot row:**
    - Dashed border + reduced opacity
    - Person-add icon + "Empty Slot" text + "Ready for a new helper" subtitle

### Status Cards Grid (2 columns)

- **Pending Invitation card:**
  - Icon + label + heading (e.g. "1 Invite Active")
  - Expiry note: "Expires in 24h"
- **Subscription Plan card:**
  - Shield/verified icon + label + plan name (e.g. "Family Premium")
  - Next billing date

---

## Invite Sidebar (right, sticky on desktop)

- Centred layout within card:
  - Large icon in rotated square container
  - Heading: "Invite a Family Member"
  - Description: explain code sharing for syncing meal plans
- **Access Code display:**
  - Bordered dashed container with label "ACCESS CODE"
  - Large code text (e.g. "FUSSY-123")
- **"Copy Link" button** (full-width primary action with copy icon)
- **Info note** below: explains that invite code grants "Member" access by default, can be upgraded later

---

## Decorative Section (bottom)

- Full-width rounded image banner with gradient text overlay
- Heading + inspirational body text about families cooking together

---

## Footer

- Same as landing page footer

---

## Key Interactions

- Role dropdown on member rows changes role immediately (or with confirm)
- "Copy Link" copies the invite URL/code to clipboard
- Empty slot is a visual indicator (not clickable — use the invite sidebar instead)
- Status cards are informational (link to billing/invites pages if applicable)
