# Browse Recipes

> Route: `/recipes`
>
> Current status: **Implemented** — search, pagination, and card grid work. Needs dietary filtering and richer cards.

## Purpose

Discover recipes that are safe and appealing for the household's fussy eaters. Filter by dietary needs, textures, time, and tags. Show per-recipe compatibility indicators.

---

## Layout

- Standard app header with navigation
- Page header with title + action button
- Filter/sort bar (sticky below header on scroll)
- Responsive card grid (main content)
- Pagination at bottom

---

## Page Header

- **Title:** "Recipes"
- **Subtitle:** item count (e.g. "127 recipes available")
- **"+ Add Recipe"** primary button (right-aligned, navigates to `/recipes/new`)

---

## Filter & Sort Bar (sticky on scroll)

### Search

- Search input with magnifying glass icon
- Placeholder: "Search recipes..."
- Debounced — filters as user types

### Filter Chips (horizontal scroll)

- **Household filter chip** (primary): shows active member filter (e.g. "Safe for: Alex") with dropdown to select member(s) or "Everyone"
- **Dietary chips:** "Dairy-Free", "Gluten-Free", "Nut-Free", "Vegetarian", "Vegan" (toggle on/off)
- **Texture chips:** "No Mushy", "No Slimy", "Smooth Only" — derived from household profiles when sync is enabled
- **Time chip:** dropdown with "Under 15 min", "Under 30 min", "Under 1 hour"
- **"More Filters"** button: opens a dropdown/panel with additional options:
  - Meal type: Breakfast, Lunch, Dinner, Snack
  - Recipe type: Full recipe, Reference (link-only)
  - Visibility: My recipes, Public recipes, All

### Sort Dropdown

- Options: "Latest", "Most Popular", "Quickest", "Alphabetical"
- Default: "Latest"

### Active Filters Summary

- When filters are active: show count badge + "Clear all" link

### Current implementation

Search and pagination work. Filter chips, dietary filtering, and sort options are not yet built.

---

## Recipe Card Grid

- Responsive grid: 4 columns (desktop), 3 columns (tablet), 2 columns (mobile)
- Cards are clickable (navigate to `/recipes/[id]`)

### Card Structure

- **Image area:**
  - Recipe hero image (or fallback placeholder image)
  - Time badge overlay (top-right): clock icon + total time
  - Compatibility indicator (top-left): ✓ "Safe" badge or ⚠ "1 Alert" badge
- **Content area:**
  - Recipe title (truncated at 2 lines)
  - Brief description (1-2 lines, truncated)
  - Tag row: dietary/texture pills (max 3 visible + "+N more")
- **Footer:**
  - Author/source info (small text)
  - Recipe type indicator for reference recipes (link icon)

### Current implementation

`RecipeCard` component exists with image, title, and description. Needs: compatibility badges, time overlay, tag pills, richer layout.

---

## Empty State

- Friendly illustration
- Heading: "No recipes found"
- Body: contextual message depending on filters:
  - No filters: "Your household hasn't added any recipes yet."
  - With filters: "No recipes match your current filters."
- CTA: "Add Your First Recipe" or "Clear Filters"

### Current implementation

Basic empty state exists in `RecipeErrorState`. Needs enhancement with contextual messaging.

---

## Pagination

- Page numbers with prev/next arrows
- "Showing X-Y of Z recipes" text
- Jump to page input (for large collections)

### Current implementation

`RecipePagination` component exists and is functional.

---

## Key Interactions

- Search is debounced (300ms) and updates URL params
- Filter chips toggle on/off; multiple can be active simultaneously
- Household member filter applies profile-based exclusions when Sync Preferences is enabled
- Compatibility badges are calculated from active profiles
- Cards navigate to recipe detail on click
- "Add Recipe" navigates to `/recipes/new`
- All filter state is reflected in URL (shareable, back-button friendly)
- Empty state CTA adapts based on context
