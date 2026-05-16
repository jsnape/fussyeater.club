# Shopping List

> Route: `/shopping`
>
> Current status: **Not started** — entirely new feature.

## Purpose

Display a consolidated, categorised grocery list generated from the weekly meal plan. Support checking off items while shopping, allergen alerts with safe swap suggestions, per-member filtering, and multiple view modes (list and aisle).

---

## Layout

- Standard app header with navigation
- Sticky utility bar below header
- Two-panel layout on desktop: sidebar (left) + item list (right)
- Stacks on mobile: utility bar → filters (collapsible) → list
- Floating action button (mobile)

---

## Utility Bar (sticky)

### Left Side

- "Shopping List" heading
- Week label (e.g. "For week of 12 – 18 June")
- Total item count badge (e.g. "42 items")

### Right Side

- View toggle: "List" | "Aisle" (switches between list view and aisle card view)
- "+ Add Item" button — manually add a non-recipe item
- "Share" button — share/export the list
- "Print" button — print-optimised view

---

## Left Sidebar: Filters & Progress

### Progress Widget

- Circular/donut progress indicator showing completion percentage
- Large percentage number in centre
- Subtitle: "X of Y items collected"

### Household Member Filter

- "Household" heading
- Pill-shaped member buttons (vertical stack):
  - "Everyone" (default, active state)
  - Individual members with avatar + name + dietary note (e.g. "Alex (Dairy Free)")
- Selecting a member filters the list to show only items relevant to their recipes

### Smart Filters (toggle switches)

- "Exclude Allergens" — hides items that conflict with any member's allergies
- "Hide Disliked" — hides ingredients on any member's dislikes list
- "Show Safe Swaps" — displays swap suggestions inline with flagged items

### Tip of the Week (desktop only)

- Decorative card with brief shopping/cooking tip
- Rotates periodically

---

## Main Area: List View (default)

### Category Sections

Items grouped by grocery category, each collapsible:

#### Section Header

- Category icon + name (e.g. "🥦 Produce", "🧀 Dairy & Alternatives", "🥫 Pantry")
- Item count for category
- Sections with allergen alerts have a distinct header indicator

#### Item Row

- **Checkbox** (large, accessible) — click to mark as collected
- **Item name** (bold)
- **Recipe source tags** (small pills below name): "For: [Recipe Name]" — can show multiple
- **Quantity** (right-aligned): amount + unit (e.g. "6 units", "2 bags", "500g")
- **Quantity stepper** (optional, shown on tap/hover): −/+ to adjust

#### Allergen Alert Item

Items conflicting with a member's allergies show:
- Warning icon + "Alert" badge next to item name
- Highlighted row background
- **Safe swap suggestion inline:**
  - Swap icon + "Safe Swap:" + replacement ingredient name
  - "Apply" button to accept the swap (replaces item in place)

### Checked Items Section (collapsible, bottom)

- Expandable container with toggle: "Checked Items (N)"
- When expanded: shows collected items with:
  - Filled checkbox icon
  - Item name with strikethrough
  - Reduced opacity
- "Clear checked" action to remove collected items from list

---

## Main Area: Aisle View (alternative)

Switched via view toggle in the utility bar. Shows items grouped as cards by store aisle/zone.

### Aisle Cards

- Large cards (2-column grid on desktop, single column mobile)
- Each card represents a store zone (e.g. "Fresh Produce", "Dairy Fridge", "Bakery", "Frozen")
- Card contents:
  - Zone heading + item count
  - Checklist of items within the zone
  - Each item: checkbox + name + quantity
  - Progress bar at bottom of card showing zone completion

---

## Empty State

When no meals are planned for the current week:

- Friendly illustration
- Heading: "Your list is empty"
- Body: "Plan some meals first, then your shopping list will appear here automatically."
- CTA button: "Go to Meal Planner" (navigates to `/planner`)

---

## Mobile Experience

- Sidebar filters collapse into a horizontal scrollable chip bar
- Member filter is a horizontal pill row (not sidebar)
- FAB (floating action button, bottom-right): "+" to quick-add a manual item
- Swipe-right on an item to mark as collected (alternative to checkbox)
- View toggle remains in utility bar

---

## Key Interactions

- **Checkbox toggle:** marks items collected, moves to "Checked Items" section, updates progress widget in real-time
- **Quantity stepper:** adjust amounts up/down; supports fractional and unit values
- **Apply swap:** replaces flagged ingredient with safe alternative in place
- **"+ Add Item":** opens inline input to add a freeform item to any category
- **Member filter:** shows only items for the selected member's meals
- **Smart filter toggles:** immediately show/hide items based on criteria
- **View toggle:** switches between list and aisle modes (preserving checked state)
- **"Share":** generates shareable link or opens system share sheet
- **"Print":** opens print-optimised layout respecting current filters
- **Section collapse:** category sections can be collapsed/expanded
- **"Clear checked":** removes all collected items (with confirmation)
- **List auto-refreshes** if the meal plan changes while the shopping list is open
