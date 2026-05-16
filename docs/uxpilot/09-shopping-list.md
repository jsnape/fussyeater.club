# Shopping List

> Route: `/shopping`

## Purpose

Display a consolidated, categorised grocery list generated from the weekly meal plan. Users can check off items as they shop, adjust quantities, apply allergen-safe swaps, and filter the list by family member.

---

## Layout

- Standard app header with navigation (includes notification bell + user avatar)
- Sticky utility action bar below header
- Two-panel layout: filters/progress sidebar (left) + item list sections (right)
- Stacks vertically on mobile (sidebar above list)

---

## Utility Action Bar (sticky)

- **Left side:**
  - "Weekly Groceries" heading
  - Week navigation: left/right arrows + date range label (e.g. "Oct 9 – Oct 15")
  - Total item count badge (e.g. "42 Items Total")
- **Right side:**
  - "+ Add Custom" button — add a manual item not from any recipe
  - "Export" button with print icon — export/print the list
  - "Mark Done" primary button with checkmark icon — mark all collected items as done

---

## Left Panel: Filters & Progress

### Progress Widget

- Circular/donut progress chart showing completion percentage
- Large percentage number in the centre
- Subtitle: "X of Y items collected"

### Household View Filter

- "Household View" heading
- Radio button list of family members:
  - "Everyone" (default, shows all items)
  - Individual member options with avatar + name + dietary note (e.g. "Alex (Dairy Free)")
- Selecting a member filters the list to show only items relevant to recipes for that member

### Smart Filters

- "Smart Filters" heading
- Toggle switches:
  - "Exclude Allergens" — hides items flagged as allergens
  - "Hide Disliked" — hides ingredients from the disliked list
  - "Show Safe Swaps" — shows alternative ingredient suggestions

---

## Right Panel: Item List (grouped by category)

Items are organised into collapsible sections by grocery category.

### Section Structure

Each section has:
- **Section header:** category icon + category name (e.g. "Produce", "Dairy & Alternatives", "Pantry") + item count
- Sections with allergen alerts have a distinct header treatment (warning background)

### Item Row

Each item shows:
- **Checkbox** (large, custom styled) — check to mark as collected
  - Checked items show strike-through text and reduced opacity
- **Item name** (bold text)
- **Source info** (subtitle): which recipe(s) this item is for + recipe count
- **Quantity stepper:** minus button, quantity display (supports units like "1 bag", "6", "2"), plus button

### Allergen Alert Items

Items that conflict with a family member's allergies show:
- Alert badge next to the item name (e.g. "Alert" in warning style)
- **Safe Swap suggestion inline:**
  - Swap icon + "Safe Swap" label + replacement ingredient name
  - "Apply" button to accept the swap
- Highlighted/distinct row background

---

## Key Interactions

- **Checkbox toggle:** marks items collected; updates progress chart in real-time
- **Quantity stepper:** adjust amounts up/down; supports decimal and unit values
- **Apply swap:** replaces the flagged ingredient with the safe alternative (updates the item in place)
- **"+ Add Custom":** opens inline input to add a free-text item to any category
- **Member filter:** selecting a member shows only the ingredients needed for their compatible recipes
- **Smart filter toggles:** immediately show/hide items based on criteria
- **"Export":** generates a printable or shareable version of the current list (respecting active filters)
- **"Mark Done":** batch-completes all checked items or all items (confirm dialog)
- **Section collapse:** category sections can be collapsed/expanded for easier scanning
