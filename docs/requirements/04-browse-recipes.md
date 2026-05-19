# Browse Recipes

> Route: `/recipes`
>
> Current status: **Implemented** — search, pagination, and card grid work. Needs dietary filtering and richer cards.

## Purpose

Discover recipes that are safe and appealing for the household's fussy eaters. Users can browse, search, filter, and add recipes to a meal plan while seeing household-relevant allergy, sensory, and safety cues.

---

## Layout

- Standard app header with navigation
- Page header / discovery section with title, count, search, and reassurance panel
- Sticky filter and sort controls below the header
- Curated collections carousel above the main results grid
- Responsive recipe card grid (main content)
- Pagination at bottom

---

## Page Header

### Title Row

- **Title:** "Recipes"
- **Subtitle:** item count (for example: "127 recipes available")
- **Primary action:** "+ Add Recipe" button linking to `/recipes/new`
- Search input with magnifying glass icon

### Reassurance Panel

- Highlighted information bar shown below the title row when household preference sync is active
- Shield icon + "Preference Sync Active" heading
- Explains which household profile rules are currently shaping results, including active allergen exclusions and prioritized textures or kid-accepted meals
- "Edit Profiles" button linking to `/household`

---

## Filter & Sort Bar (sticky on scroll)

### Search

- Debounced search (300ms) that filters recipes as the user types
- Search state updates URL params so the view is shareable and back-button friendly
- Search can also be submitted directly

### Household-Synced Filters

- **Household filter chip** (primary): shows the active member filter (for example: "Safe for: Alex") with dropdown selection for member(s) or "Everyone"
- Household sync can pre-apply profile-based exclusions and texture preferences
- Profile-driven allergen exclusions appear pre-checked and disabled when they come from a household profile

### Quick Filter Chips

- **Dietary chips:** "Dairy-Free", "Gluten-Free", "Nut-Free", "Vegetarian", "Vegan"
- **Texture chips:** "No Mushy", "No Slimy", "Smooth Only" and other include/exclude texture states derived from household profiles when sync is enabled
- **Time chip:** options such as "Under 15 min", "Under 30 min", and "Under 1 hour"
- Quick filters can include states such as "All Recipes", "Quick (<30m)", "Kid Favorites", "Allergy Friendly", and "Newest"

### More Filters

- Opens an expanded panel or drawer for additional filters:
  - Meal type: Breakfast, Lunch, Dinner, Snack
  - Recipe type: `full` or `reference`
  - Visibility: `public`, `private`, or `all` when authorized
  - Difficulty
  - Maximum prep time
  - Dietary tags
  - Kid-accepted / high success rate toggle

### Sort

- Sort options include examples such as `relevance`, `latest`, `quickest`, `most popular`, `highest rated`, `alphabetical`, and profile-sync recommendations
- Default browse sort can prioritize relevance / popularity or profile-sync recommendations

### Active Filters Summary

- Show active filter count and a "Clear all" action when filters are applied
- Manual filters can be reset without removing profile-driven household sync rules

### Current implementation

Search and pagination work. Filter chips, dietary filtering, and sort options are not yet built.

---

## Recipe Card Grid

### Curated Collections Carousel

- Section heading: "Curated for [member name]"
- Horizontally scrollable row of collection cards
- Each collection card includes:
  - Cover image with gradient overlay
  - Collection name overlaid at the bottom
  - Subtitle with recipe count and texture/type descriptor
- Selecting a collection opens a filtered recipe view for that collection

### Grid Layout

- Responsive grid for recipe cards
- Cards navigate to `/recipes/[id]`

### Card Structure

- **Image area:**
  - Recipe hero image or fallback placeholder image
  - Hover lift / scale treatment for quick visual scanning
  - Top-left badges for compatibility, safety, or recipe type (for example: safe/allergy-safe, alert, `full`, or `reference`)
  - Top-right favourite heart button in a frosted circle that toggles filled/unfilled
- **Content area:**
  - Recipe title
  - Brief description snippet (1-2 lines, truncated)
  - Time badge / duration metadata
  - Tag or metadata pills for dietary labels, allergens, textures, and success indicators
- **Footer / actions:**
  - Author or source information
  - Visibility label (`public` or `private`) when relevant
  - Source citation hint for `reference` recipes
  - Optional action row including "View Details" and "Add to Meal Plan"

### Current implementation

`RecipeCard` component exists with image, title, and description. Needs compatibility badges, favourite toggle, richer visual treatment, and expanded metadata.

---

## Empty State

- Friendly illustration
- Heading: "No recipes found"
- Contextual body copy:
  - No filters: "Your household hasn't added any recipes yet."
  - With filters: "No recipes match your current filters."
- CTA adapts to context:
  - "Add Your First Recipe"
  - "Clear Filters"

### Current implementation

Basic empty state exists in `RecipeErrorState`. Needs enhancement with contextual messaging.

---

## Pagination

- Previous/next controls and page numbers
- "Showing X-Y of Z recipes" text
- Jump-to-page input for large collections
- Preserve query and filter state across pages

### Current implementation

`RecipePagination` component exists and is functional.

---

## API Contract

### GET `/api/recipes`

**Purpose**

- Return paged recipe results for browse, search, and filter experiences

**Query params**

- `q`: optional string keyword
- `page`: optional integer, default `1`
- `pageSize`: optional integer, default `24`, max `100`
- `sort`: optional string (for example: `relevance`, `latest`, `quickest`)
- `visibility`: optional string (`public`, `private`, or `all` when authorized)
- Optional filter params including `difficulty`, `maxPrepMinutes`, dietary tags, and `type`

**Response shape**

- `items[]`: `{ id, title, description, imageUrl?, type, visibility, timings?, servings?, yield?, tags[], sourceReference? }`
- `page`
- `pageSize`
- `total`

**Browse payload rules**

- Browse responses are summary-only and do not include full `ingredients[]`
- Full ingredient data comes from `GET /api/recipes/{id}`
- Nutrition data is not included in browse payloads
- `description` is Markdown in storage, but cards render a safe plain-text snippet
- `reference` results include source clarity through `sourceReference` and must not expose copied method-step content in the list payload

**Visibility behavior**

- Anonymous users receive only `public` recipes
- Authenticated users receive `public` recipes plus `private` recipes for their household
- Private recipes from other households are never returned

**Image behavior**

- Both recipe types may include `imageUrl`
- If `imageUrl` is missing, cards show a generic no-image fallback asset

**Errors**

- `400` for invalid query or filter values
- `503` for transient backend or database issues

---

## Validation, Search, And Filter Rules

- Trim keyword input before request
- Search is case-insensitive
- Ignore punctuation differences where practical
- Combine query and filters server-side
- Filters are additive unless explicitly documented otherwise
- Support filtering by `type` (`full` or `reference`)
- Support filtering by `visibility` (`public` or `private`) when authorized
- Enforce server-side page size limits

---

## Key Interactions

- Search is debounced and reflected in URL params
- Filter chips toggle on/off; multiple can be active simultaneously unless a filter is documented as a single-choice option
- Household member filtering applies profile-based exclusions when sync is enabled
- Compatibility and safety badges are calculated from active profiles
- Favourite button toggles heart state
- Cards navigate to recipe detail on click
- "Add Recipe" navigates to `/recipes/new`
- Collection cards open filtered recipe views
- Reassurance panel "Edit Profiles" action navigates to `/household`
- Empty-state CTA adapts based on context

---

## Test Scenarios

1. Browse without a query returns paged recipes.
2. Search returns case-insensitive matches.
3. Combined filters narrow results correctly.
4. Invalid `page` or `pageSize` returns `400`.
5. Empty results show the empty state without crashing.
6. Card navigation opens the matching `/recipes/[id]` detail route.
7. Type filtering returns only matching recipe types.
8. `reference` result cards show citation hints without method-step content.
9. Anonymous users receive only `public` recipes.
10. Household members receive `public` plus own-household `private` recipes.
