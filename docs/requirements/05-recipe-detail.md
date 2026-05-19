# Recipe Detail

> Route: `/recipes/[id]`
>
> Current status: **Implemented** — full recipe view with hero, ingredients, method, tags, notes. Needs compatibility indicators.

## Purpose

Display a complete recipe with all information needed to cook it, including a full-bleed hero image, grouped ingredients, structured method steps, contextual tips, and household compatibility guidance. Users can add recipes to their meal plan or shopping list, and request nutrition data without blocking the base recipe view.

---

## Content Types And Visibility

This feature supports two recipe content types:

- `full`: first-party recipe content with ingredients and ordered method steps.
- `reference`: external-source recipe metadata with a source reference instead of copied method steps.

Recipes also have visibility:

- `public`: visible to everyone.
- `private`: visible only to members of the owning household.

---

## Route And Identifier

| Path            | Purpose                                     |
| --------------- | ------------------------------------------- |
| `/recipes/[id]` | Display one recipe by unique title-based id |

The route parameter `id` is a slug derived from the recipe title.

Slug generation rules:

1. Convert title to lowercase.
2. Trim leading and trailing whitespace.
3. Replace internal whitespace runs with `-`.
4. Remove or normalize punctuation and symbols not suitable for URL slugs.
5. Keep letters, numbers, and `-` in the final slug.

Examples:

- `Spaghetti Carbbonara` -> `spaghetti-carbbonara`
- Duplicate title collision -> append numeric suffix starting at `-2`
- Second duplicate -> `spaghetti-carbbonara-2`
- Third duplicate -> `spaghetti-carbbonara-3`

Uniqueness rules:

- Slug uniqueness is enforced globally for recipe records.
- Suffix allocation is deterministic and conflict-safe.
- Once assigned, the slug should remain stable unless an explicit slug-migration flow is implemented.

---

## User Flows

### Open Recipe Detail

```text
/recipes/[id]
  -> server resolves id to recipe record
  -> enforce visibility access before rendering
  -> render recipe based on content type
  -> if type is `full`, show normal method steps
  -> if type is `reference`, hide method steps and show source reference only
  -> nutrition is not loaded by default
  -> if user requests nutrition, fetch from a second nutrition API
  -> show not found state for unknown id
```

### Request Nutrition (Optional)

```text
/recipes/[id]
  -> user expands or requests nutrition panel
  -> client calls secondary API for nutrition data
  -> render nutrition values if returned
  -> keep recipe page usable if nutrition request fails
```

### Navigate From Listing

```text
/recipes
  -> select recipe card
  -> navigate to /recipes/[id]
  -> detail page renders corresponding recipe
```

---

## Layout

- Standard app header with navigation
- Full-bleed hero image section with overlaid recipe context
- Two-column content on desktop: main content left, sticky sidebar right
- Stacks vertically on mobile
- Sticky action bar at the bottom on mobile
- Footer

---

## Hero Section

- Full-width, tall image area using the recipe image when available, with `/images/recipe-no-image.jpg` as the fallback placeholder
- Gradient overlay at the bottom for text legibility
- Back navigation to recipes
- Recipe type badge when the recipe is a `reference` recipe
- Match-percent compatibility badge overlay for the selected family member (for example, `100% Match for Leo`)
- Recipe title as the main heading
- Description paragraph
- Metadata row in a rounded card with dividers between items:
  - Prep time
  - Cook time
  - Total time
  - Servings
  - Yield
- Author or source attribution
- Tag pills for dietary, category, texture, or meal-type tags
- Action buttons:
  - `Add to Meal Plan`
  - `Add to Shopping List`

---

## Main Content (left column)

### Household Compatibility Panel

- Expandable panel showing compatibility per family member
- Each member row includes avatar or name plus a status such as:
  - `Safe ✓`
  - `Warning ⚠`
  - `Not Safe ✗`
- Warning or unsafe rows list specific conflicts
- Swap suggestions can be shown inline for flagged ingredients
- Collapsed summary shows either `Safe for everyone ✓` or a summary such as `Safe for 3 of 4 members`

### The Method (`full` recipes)

- Section heading with icon
- Numbered step list
- Each step uses a circular number badge and body text
- Method content is optimized for cooking along
- `method[]` steps are ordered and each step string supports Markdown

### Source Reference (`reference` recipes)

- Hide copied method steps
- Show source citation or external source reference only
- Source reference supports either:
  - book citation metadata
  - external URL
- If a URL is present, show an outbound indicator and open it with safe link attributes: `target="_blank"` and `rel="noopener noreferrer"`

### Mom's Tips / Notes

- Highlighted callout after the method or source block
- `Mom's Tips` label with practical serving or swap advice
- Notes content supports Markdown-formatted content

### Tags

- Horizontal wrap of tag pills
- Tag pills navigate to `/recipes?tag=X`

---

## Sidebar (right column, desktop only)

### Ingredients Card

- Sticky sidebar card with heading and icon
- Serving adjuster: `Serves [N]` with `+/-` controls to scale quantities proportionally
- Ingredients are grouped by `ingredientGroup` when present
- Ingredients without `ingredientGroup` are shown last in an ungrouped section
- Preserve source list order within each displayed section
- Each ingredient row shows quantity, unit, ingredient name, and optional preparation detail
- Preparation supports two forms:
  - text form (for example, `chopped`)
  - recipe link form that points to another `/recipes/[id]`
- Preparation JSON shape:
  - `{ type, text?, recipeId?, recipeLabel? }`
  - `type` is `text` or `recipe-link`
  - when `type = text`, `text` is required
  - when `type = recipe-link`, `recipeId` is required
- Ingredients can be shown with prep checkboxes for cooking progress
- Flagged ingredient rows are highlighted with warning treatment
- Swap UX for flagged ingredients:
  - original ingredient can appear struck through with a conflict label
  - show the replacement inline beneath the flagged ingredient
  - clearly indicate when a swap is applied
- `Add to Shopping List` button adds ingredients to the active shopping list

### Quick Actions Card

- `Add to Meal Plan` button that opens a day and meal picker
- `Add to Shopping List` button
- `Print Recipe` button
- `Share` button

### Nutrition Panel

- Nutrition is optional and loaded on demand
- Base recipe rendering must not wait for nutrition
- Show returned nutrition values when available
- Keep the page usable if nutrition is unavailable or the request fails

### Related Recipes

- `You might also like` section with 2-3 related recipe links

---

## Mobile Sticky Action Bar

- Fixed at the bottom of the viewport on mobile
- Includes `Add to Plan` and `Add to List`
- Can collapse on scroll down and reappear on scroll up

---

## Error States

- **404:** Recipe not found, with a clear message and CTA back to `/recipes`
- **403:** Recipe is private and the user does not have access
- **400:** Invalid recipe id format
- **503:** Transient backend, database, or nutrition provider issue
- **Generic:** Something went wrong, with a retry action

---

## Key Interactions

- Back navigation returns to `/recipes` or browser history
- Serving stepper scales ingredient quantities proportionally
- Compatibility highlighting is derived from active household profiles when available
- `Add to Meal Plan` opens a picker for day and meal slot
- `Add to Shopping List` adds ingredients to the active weekly list and can respect applied swaps
- Tag pills navigate to filtered recipe browse
- Print view hides navigation, sidebar chrome, and action controls
- Base recipe detail loads without nutrition by default
- Nutrition is fetched only after explicit user request
- Nutrition API failure must not break the base recipe detail experience

---

## API Dependencies

### GET `/api/recipes/{id}`

Purpose:

- Return detail payload for one recipe by slug id.

Path param:

- `id`: required recipe slug.

Response shape:

```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "imageUrl": "string",
  "type": "full | reference",
  "visibility": "public | private",
  "timings": {
    "prepMinutes": 10,
    "cookMinutes": 15
  },
  "servings": 4,
  "yield": "1 large bowl",
  "tags": [],
  "ingredients": [],
  "method": [],
  "sourceReference": {},
  "notes": "string"
}
```

Rules:

- `description` contains Markdown.
- `ingredients[]` is an array of `RecipeIngredient` entities.
- `RecipeIngredient` shape:
  - `amount` (optional decimal)
  - `unit` (optional)
  - `ingredient` (required)
  - `ingredientGroup` (optional)
  - `preparation` (optional)
- `timings` shape:
  - `{ prepMinutes?, cookMinutes? }`
- `full` recipes require `method[]`; `sourceReference` is optional.
- `reference` recipes omit `method[]` and require `sourceReference`.
- Nutrition is intentionally excluded from the primary recipe detail response.

`sourceReference` shape:

- `{ kind, label, url?, bookTitle?, pageNumber?, isbn? }`
- `kind` is `url` or `book`

Error responses:

- `404` unknown recipe id
- `403` recipe exists but caller is not allowed to view private content
- `400` invalid id format
- `503` transient backend or database issue

### GET `/api/recipes/{id}/nutrition`

Purpose:

- Return optional nutrition information for a recipe when requested by the UI.

Path param:

- `id`: required recipe slug.

Response shape:

```json
{
  "recipeId": "string",
  "nutrition": {
    "calories": 0,
    "proteinGrams": 0,
    "carbsGrams": 0,
    "fatGrams": 0,
    "fiberGrams": 0,
    "sugarGrams": 0,
    "sodiumMg": 0
  }
}
```

Behavior:

- This endpoint is an optional best-effort data source.
- If nutrition is unavailable, return success with empty or omitted `nutrition` payload, or a documented not-available status.
- Nutrition retrieval must not block base recipe rendering.

Error responses:

- `404` unknown recipe id
- `403` unauthorized access to private recipe nutrition
- `503` nutrition provider or service unavailable

---

## Persistence Rules

- Persist `id` (slug) as a unique indexed column.
- Persist the original title separately from the slug.
- Generate the slug at create time.
- On slug collision, append incremental numeric suffixes (`-2`, `-3`, ...).
- Slug generation and uniqueness checks must be atomic at write time to avoid race collisions.
- Persist `type` as required: `full` or `reference`.
- Persist `visibility` as required: `public` or `private`.
- Persist `sourceReference` fields for `reference` recipes.
- Do not persist copied copyrighted method text for `reference` recipes.
- Persist ingredients in a text column as a JSON array of `RecipeIngredient` objects.
- Store `amount` as decimal values in the API model and inside the serialized ingredient JSON.
- Persist `servings` as a portion count.
- Persist `yield` as output amount or description.
- Persist `timings` as structured timing data.
- Persist `imageUrl` as an optional URL text field.

Example serialized `ingredients` value:

```json
[
  {
    "amount": 400.0,
    "unit": "g",
    "ingredient": "spaghetti",
    "ingredientGroup": "Pasta"
  },
  {
    "amount": 1.0,
    "unit": null,
    "ingredient": "onion",
    "ingredientGroup": "Sauce",
    "preparation": {
      "type": "text",
      "text": "finely chopped"
    }
  },
  {
    "amount": 1.0,
    "unit": null,
    "ingredient": "stock base",
    "preparation": {
      "type": "recipe-link",
      "recipeId": "vegetable-stock-base",
      "recipeLabel": "Vegetable Stock Base"
    }
  }
]
```

---

## Copyright Rules

- `reference` recipes must not display full copied method steps from external copyrighted sources.
- UI for `reference` recipes must show citation or reference metadata only.
- If a source URL is available, direct users to the original source via an outbound link.

---

## Access Rules

- `public` recipes are readable by everyone.
- `private` recipes are readable only by authenticated members of the owning household.
- Unauthorized access to private recipes returns `403`.

---

## Observability

Emit structured JSON logs and metrics for:

- recipe detail viewed
- not-found slug requests
- slug creation collisions and suffix assignment at write time

Suggested dimensions:

- `requestId`
- `route` (`/recipes/[id]`)
- `recipeId`
- `result` (`found|not_found`)
- `durationMs`

---

## Test Scenarios

1. Slug generation converts a title to a lowercase hyphenated id.
2. Duplicate titles create `-2`, `-3`, and so on.
3. `/recipes/[id]` returns the correct recipe for an existing id.
4. Unknown id returns `404` and the not-found UI state.
5. Invalid id format returns `400`.
6. Slug uniqueness remains safe under concurrent create requests.
7. `full` recipes render ordered method steps.
8. `reference` recipes hide steps and show source citation only.
9. External source URLs render with an outbound indicator and open in a new tab.
10. `private` recipes return `403` for non-household users.
11. `private` recipes load successfully for household members.
12. Ingredient decimal amounts are preserved in the API payload and database JSON.
13. Ingredients are grouped by `ingredientGroup`, with ungrouped items shown last.
14. Ingredient order is preserved during display.
15. `method[]` is returned for `full` recipes and omitted for `reference` recipes.
16. Base recipe detail loads without nutrition by default.
17. Nutrition is fetched only after explicit request via the secondary API.
18. Nutrition API failure does not break base recipe detail rendering.
19. Match-percent compatibility badge and household compatibility states render when compatibility data is available.
20. Flagged ingredients show swap treatment and the shopping-list action uses applied swaps.
21. The ingredients sidebar remains sticky on desktop layouts.
22. `Mom's Tips` or notes render when note content is present.
