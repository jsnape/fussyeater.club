# Household & Profiles

> Route: `/household`
>
> Current status: **Partially implemented** — team management and invites work; dietary profiles not yet built.

## Purpose

Manage the household in two dimensions:
1. **Team management** — members, roles, invitations (from Stitch)
2. **Dietary profiles** — per-member allergies, sensory preferences, safe foods, dislikes (from UX Pilot)

This page is the **data engine** of the app. Profile data drives recipe filtering, planner safety checks, and shopping list intelligence.

---

## Layout

- Standard app header with navigation
- Tabbed interface with two tabs: "Team" and "Profiles"
- Content area adapts per tab

---

## Tab 1: Team

### Household Summary

- Household name (editable inline)
- Seat usage indicator (e.g. "3 of 5 seats filled")

### Member List

- Vertical list of member rows, each showing:
  - Avatar (initials or photo)
  - Display name
  - Role badge: Owner, Admin, Member, Viewer
  - Role dropdown (for Owner/Admin managing others) — options: Admin, Member, Viewer
  - Remove button (for non-owners, with confirmation)

### Empty Slots

- Dashed-border placeholder rows for unused seats
- Person-add icon + "Empty Slot" + "Ready for a new helper" subtitle

### Invite Section

- "Invite a Family Member" heading
- Access code display in a bordered container (e.g. "FUSSY-ABC")
- Code expiry countdown (e.g. "Expires in 23h")
- "Copy Invite Link" primary button
- "Regenerate Code" secondary action
- Info note: explains that invites grant "Member" access by default

### Current implementation

Member list and invite management are functional. Role editing and seat limits are not yet implemented. The invite create/revoke/copy flow works.

---

## Tab 2: Profiles

### Sync Preferences Toggle

- Prominent toggle card at top of tab
- "Apply Profiles to Recipes & Planner" label
- When enabled: dietary data actively filters recipes site-wide and flags planner conflicts
- When disabled: profiles are stored but don't affect other views

### Family Member Selector

- Horizontal scrollable row of member avatar chips
- Active member is highlighted
- Clicking switches the editor below to that member's profile

### Profile Editor (for selected member)

#### Header

- Large avatar with edit overlay
- Member name + role label
- Age range selector (Child 0-3, Child 4-6, Child 7-12, Teen, Adult)
- "Save Changes" primary button

#### Allergies & Intolerances

- Section heading with icon
- Grid of allergy items (2 columns on desktop):
  - Ingredient name
  - Severity badge: Severe (Anaphylaxis), Moderate, Mild Intolerance
  - Remove button
- "+ Add Allergy" button opens inline form (ingredient + severity selector)

#### Sensory & Textures

- Heading + prompt: "What textures does [name] struggle with?"
- Horizontal wrap of toggle buttons for texture types:
  - Predefined: Mushy, Slimy, Crunchy, Mixed Textures, Chewy, Stringy, Grainy
  - Selected items are emphasised with remove icon
  - "+ Add Custom" button for user-defined textures

#### Safe Foods

- Heading with heart icon + "Always accepted ingredients"
- Tag/chip input: shows existing items as removable chips
- Text input to add new items
- Examples: "Plain Pasta", "Chicken Nuggets", "Apples"

#### Dislikes

- Heading with thumbs-down icon + "Try to avoid, but not allergic"
- Same tag/chip input pattern as safe foods
- Examples: "Broccoli", "Onions", "Mushrooms"

### Current implementation

**Not built.** The profiles tab, dietary data model, and all profile CRUD operations are new work. Requires:
- New DB tables for family member profiles, allergies, textures, safe foods, dislikes
- New API endpoints for profile CRUD
- TypeSpec additions for profile models

---

## Key Interactions

- Tab switching preserves state (no page reload)
- Member selector in Profiles tab switches the editor context
- Allergy/texture/food changes are collected locally and saved with "Save Changes" button
- Sync toggle is a separate setting (persists independently via API)
- Role dropdown changes take effect immediately (with optimistic update + rollback on error)
- "Copy Invite Link" copies to clipboard with toast confirmation
- Regenerating code invalidates the previous code (with confirmation dialog)
