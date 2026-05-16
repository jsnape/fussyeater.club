# Shopping List

> Route: `/shopping`

## Purpose

Display a categorised grocery list generated from the weekly meal plan. Users can check off items as they shop, filter by household member, and see which recipes each item is for.

---

## Layout

- Standard app header with navigation (includes search + filter + account buttons)
- Two-column layout: household filter sidebar (left, 3 cols) + item list (right, 9 cols)
- Bottom nav bar (mobile)
- Floating action button (FAB) for adding items

---

## Header Bar

- Logo/wordmark (left)
- Right side: inline search bar (desktop, pill-shaped with placeholder "Search your list...") + filter icon button + account icon button

---

## Left Sidebar: Household Filter

### Member Filter

- Card with heading "Household"
- Pill-shaped member buttons (vertical list on desktop, horizontal wrap on mobile):
  - "Everyone" (active/filled state by default, with groups icon)
  - Individual members: icon + name (e.g. "Leo", "Mia", "Mom")
- Selecting a member filters the list to show only items for their meals

### Inspiration Image (desktop only)

- Rounded decorative image card with gradient text overlay
- "Tip of the week" label + brief tip text

---

## Main Area: Shopping List

### List Header

- Title: "Shopping List"
- Subtitle: item count summary (e.g. "24 items needed for this week's meals")
- "Share List" text link with share icon (desktop only)

### Category Sections

Items grouped by grocery category, each section has:

- **Section header:** category icon + category name (e.g. "Produce", "Dairy & Eggs", "Pantry")
- **Item rows** within section:
  - Each item row:
    - **Checkbox** (rounded square, custom styled) — click to mark as collected
    - **Item name** (body text)
    - **Recipe source tags** (small pill badges below name): "For: [Recipe Name]" — can have multiple
    - **Quantity** (right-aligned): amount + unit (e.g. "6 units", "2 bags", "1 tub")

### Checked Items Section (collapsible)

- Rounded container at the bottom
- Toggle button: checkmark icon + "Checked Items (N)" heading + expand/collapse chevron
- When expanded: shows checked items with:
  - Filled checkmark icon
  - Item name with strike-through text
  - Reduced opacity

---

## Floating Action Button (FAB)

- Fixed position (bottom-right, above bottom nav)
- Plus icon — opens quick-add input for manually adding items

---

## Mobile Bottom Navigation

- 4-tab bar: Kitchen, Recipes, List (active), Progress
- Active tab has filled pill container treatment

---

## Key Interactions

- **Checkbox toggle:** marks items collected; moves them to "Checked Items" section
- **Member filter:** selecting a member shows only items relevant to their meals
- **"Share List":** generates a shareable link or opens share sheet
- **FAB (+ button):** opens quick-add interface for manual items
- **Checked items toggle:** expand/collapse the completed items section
- **Recipe source tags:** informational (show which recipe needs this ingredient)
