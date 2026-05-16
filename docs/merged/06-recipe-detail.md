# Recipe Detail

> Route: `/recipes/[id]`
>
> Current status: **Implemented** — full recipe view with hero, ingredients, method, tags, notes. Needs compatibility indicators.

## Purpose

Display a complete recipe with all information needed to cook it. Show per-family-member compatibility warnings. Provide quick actions to add to meal plan or shopping list.

---

## Layout

- Standard app header with navigation
- Hero image (full-width or constrained)
- Two-column content on desktop (main content left, sidebar right); stacks on mobile
- Sticky action bar at bottom on mobile

---

## Hero Section

- Full-width or max-width hero image (or fallback placeholder)
- Gradient overlay at bottom for readability
- Back navigation breadcrumb: "← Recipes" link
- Recipe type badge (if reference recipe: "External Recipe" with link icon)

### Current implementation

`RecipeHero` component exists and displays the image with fallback.

---

## Main Content (left column)

### Title & Metadata

- Recipe title (h1)
- Description paragraph
- Metadata row: prep time, cook time, total time, servings
- Author/source attribution

### Household Compatibility Panel

- Expandable panel showing compatibility status per family member:
  - Member avatar + name
  - Status: "Safe ✓", "Warning ⚠", or "Not Safe ✗"
  - If warning/unsafe: list specific conflicts (e.g. "Contains dairy — Alex is dairy-free")
  - Suggested swaps inline (e.g. "Swap butter → dairy-free spread")
- Collapsed state shows summary: "Safe for 3 of 4 members" or "Safe for everyone ✓"

### Current implementation

**Not built.** Requires dietary profile data and compatibility calculation logic.

---

### Ingredients

- Section heading with icon
- Serving adjuster: "Serves [N]" with +/- stepper (scales quantities)
- Ingredient list:
  - Each row: quantity + unit + ingredient name
  - Items with allergen conflicts highlighted with warning icon + tooltip
  - Suggested swap shown inline for flagged items
- "Add All to Shopping List" button (bottom of section)

### Current implementation

`RecipeIngredients` component exists with basic list. Needs: serving adjuster, allergen highlighting, swap suggestions, shopping list button.

---

### Method Steps (for full recipes)

- Numbered step list
- Each step: step number badge + instruction text
- Optional: image per step (future enhancement)

### Source Reference (for reference recipes)

- External link card: source name, URL, description of what's at the link
- "Open Recipe →" button

### Current implementation

`RecipeMethodOrSource` component handles both modes.

---

### Tags

- Horizontal wrap of tag pills
- Dietary tags, texture tags, meal type tags
- Clickable: navigates to `/recipes?tag=X` (pre-filtered browse)

### Current implementation

`RecipeTags` component exists. Needs: clickable navigation to filtered browse.

---

### Notes

- Section with user/author notes
- Markdown-formatted content

### Current implementation

`RecipeNotes` component exists.

---

## Sidebar (right column, desktop only)

### Quick Actions Card

- "Add to Meal Plan" button → opens day/meal picker (inline dropdown or modal)
- "Add to Shopping List" button → adds all ingredients to current list
- "Print Recipe" button
- "Share" button (copy link)

### Nutrition Summary (future)

- Placeholder for per-serving nutritional info
- "Coming soon" or hidden until data available

### Related Recipes

- "You might also like" heading
- 2-3 small recipe cards based on similar tags/ingredients
- Links to their detail pages

---

## Mobile Sticky Action Bar

- Fixed at bottom of viewport on mobile
- Two buttons: "Add to Plan" + "Add to List"
- Collapses on scroll down, reappears on scroll up

---

## Error States

- **404:** Recipe not found — friendly message + "Browse Recipes" link
- **403:** Recipe is private and user doesn't have access — message + "Browse Recipes" link
- **Generic:** "Something went wrong" + retry button

### Current implementation

`RecipeErrorState` handles 404, 403, and generic errors.

---

## Key Interactions

- Serving stepper scales ingredient quantities proportionally
- Allergen highlights are derived from active household profiles (when sync enabled)
- "Add to Meal Plan" opens a picker to select day + meal slot
- "Add to Shopping List" adds ingredients to the active weekly list (with toast confirmation)
- Tag pills navigate to pre-filtered recipe browse
- Print formats the recipe for clean printing (hides nav, sidebar, actions)
- Back breadcrumb returns to `/recipes` (preserving previous filter state if possible)
