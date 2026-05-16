# Weekly Meal Planner

> Route: `/planner`

## Purpose

Plan a week of meals using a calendar grid. Drag saved recipes from a sidebar onto specific day/meal slots. Track weekly progress and family member assignments per meal.

---

## Layout

- Fixed top navigation bar (compact)
- Three-panel layout:
  - Left sidebar: family info + navigation (desktop only, fixed)
  - Centre: main calendar grid (scrollable)
  - Right sidebar: saved recipes for dragging (desktop only, fixed)
- Bottom nav bar (mobile only)

---

## Top Navigation Bar (fixed)

- Logo/wordmark (left)
- Desktop nav links: Weekly Plan (active), Recipes, Family Library
- Right side: family icon, notification bell, user avatar

---

## Left Sidebar (fixed, desktop only)

### Family Info

- Rounded icon container + family name (e.g. "The Miller Family")
- Subtitle: member count + fussy eater count (e.g. "4 Members • 2 Fussy Eaters")

### Navigation Links

- Vertical nav list with icons:
  - Weekly Plan (active, highlighted with left border indicator)
  - Recipes
  - Family Library
  - Grocery List
- "New Recipe" primary button (bottom of sidebar)
- Settings + Support links (bottom)

---

## Main Content Area (centre)

### Page Header

- Title: "Weekly Meal Planner"
- Subtitle: date range (e.g. "Planning for June 12th — June 18th")
- Week navigation: prev arrow, "Today" button, next arrow

### Calendar Grid

- 7-column grid (one column per day, Mon–Sun)
- **Day header per column:** abbreviated day name (uppercase, small) + date number

- **Meal slot rows** (3 per day column: Breakfast, Lunch, Dinner):
  - **Empty slot:** dashed border, add-circle icon + meal type label (e.g. "Breakfast"), subdued opacity. Clickable to open "Add to Meal Plan" modal.
  - **Filled slot:** solid card with:
    - Meal type label (small, coloured by type)
    - Recipe title (bold, truncated)
    - Family member avatars (small circular initials showing who this meal is assigned to, e.g. "M", "D", "L")

- Unfilled days (Thu–Sun) show dashed placeholder columns at reduced opacity

### Weekly Goal / Stats Section (below grid)

- Rounded card with two areas:
  - **Left (goal):** heading (e.g. "Weekly Goal: Trying New Things") + progress description + progress bar
  - **Right (stats):** two stat columns with divider:
    - Meals Planned count
    - Left to Shop count

---

## Right Sidebar (fixed, desktop only)

### Saved Recipes Panel

- Heading: "Saved Recipes"
- Search input (rounded, with icon)
- Scrollable vertical list of recipe cards (draggable):
  - Recipe thumbnail image
  - Recipe title
  - Metadata row: time (clock icon + duration) + tag pill
  - Cards show grab cursor on hover, grabbing cursor while dragging

---

## Mobile Bottom Navigation

- 4-tab bar: Plan (active), Recipes, Family, List
- Active tab has filled container treatment

---

## Key Interactions

- **Drag and drop:** drag recipe cards from right sidebar onto empty calendar slots
- **Click empty slot:** opens "Add to Meal Plan" modal
- **Week navigation:** arrows cycle through weeks
- **"Today" button:** jumps to current week
- **Filled meal slots:** clickable to view recipe detail or remove
- **Family member avatars on slots:** indicate which household members will eat this meal
- **Progress bar:** updates automatically as meals are planned
- **"New Recipe" button** in sidebar navigates to `/recipes/new`
