# Meal Planner

> Route: `/planner`
>
> Current status: **Not started** — entirely new feature.

## Purpose

Plan a week of meals by dragging recipes onto a calendar grid. Show per-slot household compatibility warnings, support serving adjustments and notes, track weekly progress toward meal planning goals, and enable quick generation of shopping lists from the plan.

---

## Layout

- Standard app header with navigation, notification bell, and user avatar
- Sticky utility bar below header
- **Desktop:** three-panel layout
  - Left sidebar: family info / household context
  - Centre: calendar grid
  - Right sidebar: saved recipes for dragging
- Full viewport height minus header/action bar; major panels can scroll independently
- **Mobile:** utility bar → calendar → recipe picker drawer, with a 4-tab bottom nav (Plan, Recipes, Family, List)

### Left Sidebar (desktop only)

- Family name with member count and fussy eater count
- Household context showing whose preferences are applied to the planner

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
- Clickable: opens the **Add to Meal Plan** modal
- Drop zone for dragged recipes

#### Filled Cell

- Recipe card showing:
  - Recipe title (truncated)
  - Small recipe thumbnail (if available)
  - Compatibility badge (top-right): safe or alert with conflict count
  - Family member avatar dots showing who the meal is for
- **Serving count stepper:** −/+ to adjust servings (affects shopping quantities)
- **Note input:** small inline text field for meal-specific notes (e.g. "Serve salsa on side")
- **Overflow menu** (⋮ icon): Remove, Swap recipe, Move to different slot, View recipe

### Visual Indicators

- Cells with compatibility warnings have a distinct left-edge marker / colour strip and highlighted background
- Tooltips on compatibility badges explain specific conflicts (e.g. "Contains dairy — Alex is dairy-free")
- Safe cells have a subtle positive indicator / positive-toned background

---

## Recipe Sidebar (right panel, desktop)

### Search & Filter

- Search input: "Search saved recipes..."
- Horizontal scrollable filter chips such as "All Saved", "Quick Prep", "Kid Favourites", "Safe Dinners", and dietary filters
- Active chip is emphasised

### Recipe List (draggable)

- Scrollable vertical list of recipe cards
- Each card shows:
  - Small recipe thumbnail (or icon)
  - Recipe title (truncated)
  - Metadata: total time + compatibility / safety indicator
  - Drag handle (grip icon) on hover
  - Left-edge indicator for safety status
- Cards are draggable onto calendar cells

### Custom Note Button

- "+ Add Custom Note" (dashed border style)
- Creates a text-only entry in a meal slot (not linked to a recipe — useful for "Eat out", "Leftovers", etc.)

### Household Filters

- "Household Filters" heading
- Row of family member avatars showing whose profiles are applied
- "Edit" / "Edit Selection" link to toggle members on or off

---

## Mobile Experience

- Calendar grid scrolls horizontally (shows 2–3 days at a time)
- Recipe sidebar becomes a bottom drawer / recipe picker drawer
- Tapping an empty cell opens the **Add to Meal Plan** modal
- Filled cells are tappable to view actions (no hover state)
- Modal sits above the mobile bottom nav

---

## Add to Meal Plan Modal

- Triggered by tapping an empty meal slot or the "+" button
- Fixed overlay modal with blurred, dimmed backdrop
- Large rounded container with header, scrollable content area, and footer

### Header

- Contextual heading such as "What's for Dinner?" or "Add to [Meal Type] — [Day Name]"
- Subtitle: "Adding to [Day] [Meal Type] Plan"
- Close button (X icon)

### Content Area

#### Search Bar

- Full-width rounded input with search icon
- Instant filtering
- Placeholder such as "Search family favorites..."

#### Category Chips

- Horizontal wrap of filter chips:
  - "Quick (Under 20m)"
  - "Kid Favorites"
  - "Allergy Friendly"
  - "Batch Cooking"

#### Recipe Grid

- Responsive grid (3 columns on larger screens, 2 on smaller viewports)
- Each recipe card includes:
  - Image
  - Optional **"Best Match"** badge on recommended recipes
  - Tag pills for dietary / time info
  - Recipe title
  - Short description
  - Compatibility / safety context
  - **"Add to Plan"** button

### Footer

- "View Recent Recipes" text button with history icon
- "Custom Entry" button for a free-text meal without a saved recipe
- Cancel / backdrop click dismisses without adding anything

### Key Interactions

- Search filters the recipe grid in real time
- Category chips filter results with active / inactive states
- "Add to Plan" immediately assigns the recipe to the selected slot and closes the modal
- "Custom Entry" opens a text input for a manual meal name
- "View Recent Recipes" shows previously assigned recipes for quick re-selection

---

## Weekly Progress Section (below grid)

- Rounded card showing:
  - **Weekly goal** (configurable)
  - Progress description and progress bar
  - Fraction showing progress toward the goal
- Stats can include:
  - Meals planned count
  - Meals remaining
  - Left to shop count
  - Meals with alerts
- Lightweight celebration moment when the goal is met

---

## Key Interactions

- **Drag and drop:** drag recipe cards from the sidebar onto calendar cells
- **Reposition:** drag recipes between cells to move them
- **Remove:** via overflow menu or drag back to the sidebar area
- **Serving adjustment:** stepper in each cell updates the count and affects shopping quantities
- **Notes:** inline text input per cell for custom instructions
- **Week navigation:** arrows cycle through weeks; data persists per week
- **"Repeat Last Week"** copies the previous week's plan into the current week (with confirmation)
- **"Generate Shopping List"** navigates to `/shopping` with the current week's recipes pre-loaded
- **Compatibility tooltips** appear on hover / tap of warning badges
- **"Today" button** returns focus to the current week
- **Progress bar** updates as meals are added or removed
- **Mobile drawer** slides up from the bottom and can be dismissed with its backdrop
