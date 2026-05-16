# Browse Recipes

> Route: `/recipes`

## Purpose

Discover and browse recipes using search and category filters. Simple, visual-first layout focused on recipe imagery and quick scanning.

---

## Layout

- Standard app header with navigation (includes "Add Recipe" button)
- Centred hero search section
- Horizontal scrollable filter chips
- Responsive recipe grid
- Footer

---

## Hero Search Section

- Centred layout (max-width constrained)
- Large heading: "Find family favorites"
- Subtitle: "Nourishing recipes designed for tiny critics and busy parents."
- Full-width search input (rounded pill shape):
  - Search icon (left)
  - Placeholder text: "Search for ingredients, meals, or tags..."

---

## Filter Chips (horizontally scrollable)

- Row of pill-shaped filter buttons:
  - "All Recipes" — active/filled state (primary)
  - "Quick (<30m)" — inactive/container state
  - "Kid Favorites" — inactive
  - "Allergy Friendly" — inactive
  - "Newest" — inactive
- Divider line after filter chips
- "More Filters" text button with tune/settings icon (opens advanced filters)

---

## Recipe Grid

- 3-column responsive grid (2-col tablet, 1-col mobile)
- Each recipe card:
  - **Image area** (fixed height):
    - Recipe photo with hover scale-up effect
    - Badge overlay (top-left): "Full Recipe" label
    - Favourite button (top-right): heart icon in frosted circle, toggles filled/unfilled
  - **Content area:**
    - Title (heading style) + time badge (top-right, clock icon + duration)
    - Description text (2-line clamp)
    - Tag pills at bottom: dietary/allergen labels (e.g. "Nut-free", "Vegetarian", "Gluten Free")

---

## Key Interactions

- Search filters results in real-time or on submit
- Filter chips toggle active state; only one primary filter active at a time
- "More Filters" opens an expanded filter panel or drawer
- Favourite button toggles heart state
- Clicking a card navigates to the recipe detail page
- Cards have subtle lift/scale on hover
