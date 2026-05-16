# Household & Family Profiles

> Route: `/household`

## Purpose

Manage family members and configure per-person allergies, sensory preferences, safe foods, and dislikes. This data drives recipe filtering, meal plan safety checks, and shopping list generation across the app.

---

## Layout

- Standard app header with navigation
- Page header row: title, subtitle, and a "Sync Preferences" toggle card (right-aligned on desktop)
- Two-column layout on desktop (member list left, detail editor right); stacks on mobile

---

## Page Header

- **Title:** "Household Profiles"
- **Subtitle:** Explanatory text about managing family members and how preferences filter recipes
- **Sync Preferences Card:**
  - Icon + "Sync Preferences" label + "Apply to Browse & Meal Planner" subtitle
  - Toggle switch (on/off) — when enabled, these profiles actively filter recipes site-wide

---

## Left Column: Family Member List

### Member List Header

- "Family Members" heading
- "+ Add Member" button

### Member Cards (vertical list)

- **Active/editing member card:**
  - Avatar (photo or placeholder icon), name + role label (e.g. "Child"), age range + description (e.g. "Age 4-6 • Picky Eater")
  - Visual indicator showing "Editing" state (e.g. a corner badge)
  - Quick-view tag row below: shows top allergy tags and safe food tags inline
  - Selected/active border treatment

- **Inactive member cards:**
  - Same structure but visually subdued (lower opacity or muted)
  - Clickable to switch editing context to that member
  - Show: avatar, name + role, brief subtitle (e.g. "Adult • No restrictions" or "Adult • Vegetarian")

---

## Right Column: Member Detail Editor

### Profile Header

- Large avatar with camera/edit overlay on hover
- Member name with inline edit icon
- Subtitle: "Managing preferences for 1 family member"
- "Save Changes" primary button (top right on desktop)

### Sections (vertically stacked with dividers)

#### 1. Allergies & Intolerances

- Section icon + heading + explanatory subtitle
- "Add New" action link
- Grid of allergy items (2 columns on desktop):
  - Each item shows: ingredient name, severity badge (e.g. "Severe (Anaphylaxis)" or "Mild Intolerance"), remove button
  - Items are visually distinct by severity level

#### 2. Sensory & Textures

- Heading + question prompt (e.g. "What textures does [name] struggle with?")
- Horizontal wrap of toggle-style buttons for texture types:
  - Unselected textures: neutral style, clickable to add
  - Selected "avoid" textures: emphasized style with remove icon
  - "+ Add Custom" button with dashed border
- Predefined options include: Mushy, Slimy, Crunchy, Mixed Textures, Chewy

#### 3. Safe Foods & Dislikes (side-by-side on desktop)

- **Safe Foods column:**
  - Heading with heart icon + subtitle "Always accepted ingredients"
  - Tag input area: shows existing items as removable chips/tags
  - Inline text input to add new items
  - Example items: "Plain Pasta", "Chicken Nuggets", "Apples"

- **Dislikes column:**
  - Heading with thumbs-down icon + subtitle "Try to avoid, but not allergic"
  - Same tag input pattern as safe foods
  - Example items: "Broccoli", "Onions"

---

## Key Interactions

- Clicking a member card in the left list loads their profile in the right editor
- Adding/removing allergies, textures, safe foods, and dislikes is instant (no save required per field — save all at once via "Save Changes" button)
- Sync toggle applies profile-based filtering globally to Recipes Browse and Meal Planner
- "+ Add Member" opens a form/modal to create a new family member with name, role (child/adult), age range
