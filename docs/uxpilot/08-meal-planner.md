# Meal Planner

> Route: `/planner`

## Purpose

Plan a week of meals by dragging recipes from a sidebar onto a calendar grid. Shows household compatibility alerts and allows notes, serving count adjustments, and quick actions per slot.

---

## Layout

- Standard app header with navigation (includes notification bell + user avatar)
- Sticky utility action bar below header
- Two-panel layout: recipe sidebar (left) + calendar grid (right)
- Full viewport height (minus header/action bar); both panels independently scrollable

---

## Utility Action Bar (sticky)

- **Left side:**
  - "Weekly Plan" heading
  - Week navigation: left/right arrows + date range label (e.g. "Oct 9 – Oct 15")
  - "Repeat Last Week" button (desktop only)
- **Right side:**
  - "Print / Export" secondary button with print icon
  - "Generate List" primary button with shopping basket icon — generates shopping list from the current week's plan

---

## Left Panel: Recipe Sidebar

### Search & Filter

- Card with search input (magnifying glass icon) + placeholder "Search saved recipes..."
- Horizontal scrollable filter chips below: "All Saved", "Safe Dinners", "Quick Prep", etc.
- Active chip is filled/emphasised

### Recipe List (draggable)

- Scrollable vertical list of recipe cards
- Each card shows:
  - Small recipe thumbnail image (or icon placeholder)
  - Recipe title (truncated if long)
  - Metadata: time + safety indicator (e.g. "35m" + "Safe Match" or "1 Alert")
  - Drag handle (grip icon) — appears on hover
  - Left-edge colour strip indicating safety status (safe = positive, alert = warning)
- Cards are draggable onto the calendar grid

### Custom Note Button

- "+ Add Custom Note" button at bottom of list (dashed border style)
- Creates a text-only slot on the calendar (not linked to a recipe)

### Household Filters Panel

- "Household Filters" heading
- Row of family member avatars + "Edit Selection" link
- Shows which members' preferences are being applied to the planner

---

## Right Panel: Calendar Grid

### Day Headers (7 columns)

- Row of 7 day columns: Mon–Sun
- Each shows abbreviated day name + date number
- Current/today column is subtly highlighted

### Meal Rows

The grid has 3 meal rows (Breakfast, Lunch, Dinner), each spanning all 7 day columns:

- **Row label:** vertically oriented text on the left edge (e.g. "Breakfast", "Lunch", "Dinner")
- **Cells (7 per row):** drop zones for recipes

#### Empty Cell

- Dashed border placeholder
- Shows a "+" icon on hover to indicate it accepts drops
- Clicking also allows recipe selection from a picker

#### Filled Cell (recipe assigned)

- Recipe card thumbnail within the cell
- Recipe title (truncated)
- Safety indicator badge (top right): checkmark (safe) or warning triangle (alert with tooltip showing the issue)
- **Serving count control:** minus/plus stepper to adjust servings
- **Note input:** small text input below recipe title for meal-specific notes
- **Overflow menu** (ellipsis icon): options to remove, swap, or move the recipe

### Visual Indicators

- Cells with compatibility warnings have a coloured left-edge strip and highlighted background
- Tooltips on safety badges explain the specific alert (e.g. "Contains Dairy (Alex's profile alert)")
- Safe cells use a subtle positive-toned background

---

## Key Interactions

- **Drag and drop:** drag recipe cards from sidebar onto calendar cells
- **Reposition:** drag recipes between cells to move them
- **Remove:** via overflow menu or dragging back to sidebar area
- **Serving adjustment:** stepper in each cell updates the count (affects shopping list generation)
- **Notes:** inline text input per cell for custom instructions (e.g. "Serve salsa on the side")
- **Week navigation:** arrows cycle through weeks; data persists per week
- **"Repeat Last Week"** copies the previous week's plan into the current week
- **"Generate List"** navigates to Shopping List page with the current week's recipes pre-loaded
- **Compatibility tooltips** appear on hover/tap of warning badges
