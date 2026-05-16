# Meal Planner

> Route: `/planner`
>
> Current status: **Not started** — entirely new feature.

## Purpose

Plan a week of meals by dragging recipes onto a calendar grid. Show per-slot household compatibility warnings. Track weekly progress toward meal planning goals. Enable quick generation of shopping lists from the plan.

---

## Layout

- Standard app header with navigation
- Sticky utility bar below header
- Two-panel layout on desktop: calendar grid (main, left) + recipe sidebar (right)
- Stacks on mobile: utility bar → calendar → recipe list (collapsible drawer)

---

## Utility Bar (sticky)

### Left Side

- "Weekly Plan" heading
- Week navigation: ← previous arrow, date range label (e.g. "12 – 18 June"), next arrow →
- "Today" button — jumps to current week

### Right Side

- "Repeat Last Week" button (copies previous week's plan)
- "Print / Export" secondary button
- "Generate Shopping List" primary button — creates shopping list from current plan

---

## Calendar Grid (main panel)

### Day Headers

- 7 columns (Mon – Sun)
- Each shows: abbreviated day name + date number
- Current day subtly highlighted

### Meal Rows

3 rows spanning all 7 day columns: **Breakfast**, **Lunch**, **Dinner**

- Row label on left edge (vertical text or fixed left column)

#### Empty Cell

- Dashed border placeholder
- "+" icon on hover/focus
- Clickable: opens "Add to Meal Plan" modal (recipe picker)
- Drop zone for dragged recipes

#### Filled Cell

- Recipe card showing:
  - Recipe title (truncated)
  - Small recipe thumbnail (if available)
  - Compatibility badge (top-right): ✓ safe or ⚠ alert with conflict count
  - Family member avatar dots (bottom): small initials showing who this meal is for
- **Serving count stepper:** −/+ to adjust servings (affects shopping quantities)
- **Note input:** small inline text field for meal-specific notes (e.g. "Serve salsa on side")
- **Overflow menu** (⋮ icon): Remove, Swap recipe, Move to different slot, View recipe

### Visual Indicators

- Cells with compatibility warnings have a distinct left-edge marker
- Tooltips on compatibility badges explain specific conflicts (e.g. "Contains dairy — Alex is dairy-free")
- Safe cells have a subtle positive indicator

---

## Recipe Sidebar (right panel, desktop)

### Search & Filter

- Search input: "Search saved recipes..."
- Horizontal scrollable filter chips: "All Saved", "Quick Prep", "Kid Favourites", dietary filters
- Active chip is emphasised

### Recipe List (draggable)

- Scrollable vertical list of recipe cards
- Each card:
  - Small recipe thumbnail (or icon)
  - Recipe title (truncated)
  - Metadata: total time + compatibility indicator ("Safe" or "1 Alert")
  - Drag handle (grip icon) on hover
  - Left-edge indicator for safety status
- Cards are draggable onto calendar cells

### Custom Note Button

- "+ Add Custom Note" (dashed border style)
- Creates a text-only entry in a meal slot (not linked to a recipe — useful for "Eat out", "Leftovers", etc.)

### Household Filters

- "Household Filters" heading
- Row of family member avatars showing whose profiles are applied
- "Edit" link to toggle members on/off

---

## Mobile Experience

- Calendar grid scrolls horizontally (shows 2-3 days at a time)
- Recipe sidebar becomes a bottom drawer (swipe up to open)
- Tapping an empty cell opens the "Add to Meal Plan" modal
- Filled cells are tappable to view actions (no hover state)

---

## Add to Meal Plan Modal

- Triggered by tapping an empty meal slot (especially on mobile) or "+" button
- **Header:** "Add to [Meal Type] — [Day Name]"
- **Search input** with instant filtering
- **Recipe list:** scrollable, showing:
  - Recipe thumbnail, title, time, compatibility badge
  - Tap to select and close modal
- **"Custom Note" option** at bottom: add freeform text instead of a recipe
- **Cancel** button / click outside to dismiss

---

## Weekly Progress Section (below grid)

- Rounded card showing:
  - **Weekly goal** (configurable): e.g. "Plan 5 dinners this week"
  - Progress bar + fraction (e.g. "3 / 5 dinners planned")
  - **Stats:** Meals planned count, meals remaining, meals with alerts
- Lightweight celebration moment when goal is met (e.g. confetti icon, "🎉 Goal reached!")

---

## Key Interactions

- **Drag and drop:** drag recipe cards from sidebar onto calendar cells
- **Reposition:** drag recipes between cells to move them
- **Remove:** via overflow menu or drag back to sidebar area
- **Serving adjustment:** stepper in each cell updates the count (propagates to shopping list)
- **Notes:** inline text input per cell for custom instructions
- **Week navigation:** arrows cycle through weeks; data persists per week
- **"Repeat Last Week"** copies previous week's plan into current week (with confirmation)
- **"Generate Shopping List"** navigates to `/shopping` with current week's recipes pre-loaded
- **Compatibility tooltips** appear on hover/tap of warning badges
- **"Today" button** returns focus to current week
- **Progress bar** updates as meals are added/removed
- **Mobile drawer** slides up from bottom, backdrop dismisses it
