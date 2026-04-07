---
status: design-review
---

# Recipe Detail

Show full recipe instructions and metadata for a single recipe identified by a human-readable unique id.

This feature supports two recipe content types:

- `full`: first-party recipe content with ingredients and method steps.
- `reference`: external-source recipe metadata only, with source reference instead of method steps.

Recipes also have visibility:

- `public`: visible to everyone.
- `private`: visible only to members of the owning household.

---

## Route

| Path | Purpose |
| --- | --- |
| `/recipe/[id]` | Display one recipe by unique title-based id |

---

## ID Format And Uniqueness

The route parameter `id` is a slug derived from the recipe title.

Slug generation rules:

1. Convert title to lowercase.
2. Trim leading/trailing whitespace.
3. Replace internal whitespace runs with `-`.
4. Remove or normalize punctuation and symbols not suitable for URL slugs.
5. Keep letters, numbers, and `-` in final slug.

Examples:

- `Spaghetti Carbbonara` -> `spaghetti-carbbonara`
- Duplicate title collision -> append numeric suffix starting at `-2`
- `Spaghetti Carbbonara` second duplicate -> `spaghetti-carbbonara-2`
- Third duplicate -> `spaghetti-carbbonara-3`

Uniqueness rules:

- Slug uniqueness is enforced globally for recipe records.
- Suffix allocation is deterministic and conflict-safe.
- Once assigned, slug should remain stable unless an explicit slug-migration flow is implemented.

---

## Source Scope

This feature pairs with listing/search behavior in [docs/features/recipes.md](./recipes.md).

This feature must also conform to shared baselines:

- [Security Baseline](../designs/security.md)
- [Scalability Baseline](../designs/scalability.md)
- [Reliability Baseline](../designs/reliability.md)
- [Observability Baseline](../designs/observability.md)
- [Maintainability Baseline](../designs/maintainability.md)

---

## User Flows

### Open Recipe Detail

```
/recipe/[id]
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

```
/recipe/[id]
  -> user expands or requests nutrition panel
  -> client calls secondary API for nutrition data
  -> render nutrition values if returned
  -> keep recipe page usable if nutrition request fails
```

### Navigate From Listing

```
/recipes
  -> select recipe card
  -> navigate to /recipe/[id]
  -> detail page renders corresponding recipe
```

---

## Page Design (MVP)

Single-column readable layout optimized for kitchen use.

Display sections:

- Title and description (Markdown).
- Hero/image area (recipe image URL when provided, fallback no-image asset when absent).
- Metadata row (timings, servings, yield, dietary tags).
- Ingredients list.
- Ordered method for `full` recipes only.
- Source reference block for `reference` recipes only.
- Optional nutrition panel loaded on demand.
- Optional notes/tips.

Example full recipe detail text:

```text
Title: Spaghetti Carbbonara
ID: spaghetti-carbbonara
Type: full
Visibility: public
Description: Creamy weeknight pasta with **pancetta** and black pepper.
Image: https://cdn.example.com/recipes/spaghetti-carbbonara.jpg
Timings: prep 10 minutes, cook 15 minutes
Servings: 4
Yield: 1 large bowl
Ingredients:
  - 400 g spaghetti
  - 150 g pancetta (diced)
  - 3 large eggs
  - 60 g pecorino romano (finely grated)
  - 1 tsp black pepper (freshly ground)
Method:
  1. Cook spaghetti in salted water until al dente.
  2. Crisp pancetta in a pan.
  3. Whisk eggs, cheese, and pepper.
  4. Toss hot pasta with pancetta, then egg mixture off heat.
  5. Serve immediately with extra cheese and pepper.
```

Example reference recipe detail text:

```text
Title: Classic Beef Bourguignon
ID: classic-beef-bourguignon
Type: reference
Visibility: private
Description: A traditional slow-cooked French stew from a trusted cookbook source.
Image: https://cdn.example.com/recipes/classic-beef-bourguignon.jpg
Timings: prep 30 minutes, cook 180 minutes
Servings: 6
Yield: 6 pints
Ingredients:
  - 1.5 kg beef chuck (cut into chunks)
  - 200 g smoked bacon (diced)
  - 12 small onions (peeled)
  - 250 g mushrooms (quartered)
Source Reference (book):
  - Book: Mastering French Cooking
  - Page: 315
  - ISBN: 978-0375413407
```

Reference recipe source block:

- Supports either book citation (for example: `bookTitle` + `pageNumber` + `isbn`) or external URL.
- If URL is present, show an outbound arrow indicator (for example: `↗`) and open in a new tab/page.
- For external URLs use safe link attributes (`target="_blank"` + `rel="noopener noreferrer"`).
- Do not render copied method text for `reference` recipes.

Not found state:

- Show clear message when slug does not resolve.
- Include CTA back to `/recipes`.

---

## API Dependencies

### GET `/api/recipes/{id}`

Purpose:

- Return detail payload for one recipe by slug id.

Path param:

- `id`: required recipe slug.

Response shape:

- `{ id, title, description, imageUrl?, type, visibility, timings?, servings?, yield?, tags[], ingredients[], method?, sourceReference?, notes? }`

Description and method markdown rules:

- `description` contains Markdown.
- `method[]` is an ordered array of step strings, and each step string contains Markdown.

Nutrition note:

- Nutrition is intentionally excluded from the primary recipe detail response.
- Nutrition is fetched via a secondary API only when explicitly requested.

`timings` shape:

- `{ prepMinutes?, cookMinutes? }`

Ingredient entity (JSON, API contract):

- `ingredients[]` is an array of `RecipeIngredient` entities.
- `RecipeIngredient` shape:
  - `amount` (optional decimal)
  - `unit` (optional)
  - `ingredient` (required)
  - `ingredientGroup` (optional)
  - `preparation` (optional)

`preparation` supports two forms:

- text form (for example: `chopped`)
- recipe link form (link to another recipe)

`preparation` JSON shape:

- `{ type, text?, recipeId?, recipeLabel? }`
- `type` is one of `text` or `recipe-link`.
- when `type = text`, `text` is required.
- when `type = recipe-link`, `recipeId` is required and should reference `/recipe/[id]`.

Ingredient display rules:

- Group ingredients by `ingredientGroup` when present.
- Ingredients without `ingredientGroup` are shown at the end under an ungrouped section.
- Do not sort ingredients during display; preserve source list order within each displayed section.

Image display rules:

- Both `full` and `reference` recipe types may provide `imageUrl`.
- If `imageUrl` is missing or empty, UI must display a generic fallback image.
- Fallback asset should be a local static image path (for example: `/images/recipe-no-image.jpg`).

Type-specific payload rules:

- `full`: `method[]` is required; `sourceReference` is optional.
- `reference`: `method[]` is omitted; `sourceReference` is required.

`sourceReference` shape:

- `{ kind, label, url?, bookTitle?, pageNumber?, isbn? }`
- `kind` is one of `url` or `book`.

Error responses:

- `404` unknown recipe id.
- `403` recipe exists but caller is not allowed to view private content.
- `400` invalid id format.
- `503` transient backend/database issue.

### GET `/api/recipes/{id}/nutrition`

Purpose:

- Return optional nutrition information for a recipe when requested by the UI.

Path param:

- `id`: required recipe slug.

Response shape:

- `{ recipeId, nutrition? }`
- `nutrition` example shape:
  - `{ calories?, proteinGrams?, carbsGrams?, fatGrams?, fiberGrams?, sugarGrams?, sodiumMg? }`

Behavior:

- Endpoint is optional best-effort data source.
- If nutrition is unavailable, return success with empty/omitted `nutrition` payload (or a documented not-available status).
- Nutrition retrieval must not block base recipe rendering.

Error responses:

- `404` unknown recipe id.
- `403` unauthorized access to private recipe nutrition.
- `503` nutrition provider/service unavailable.

---

## Persistence Rules

- Persist `id` (slug) as a unique indexed column.
- Persist original title separately from slug.
- Generate slug at create-time.
- On slug collision, append incremental numeric suffix (`-2`, `-3`, ...).
- Slug generation and uniqueness check must be atomic at write time to avoid race collisions.
- Persist `type` as required (`full` or `reference`).
- Persist `sourceReference` fields for `reference` recipes.
- Do not persist copied copyrighted method text for `reference` recipes.
- Persist `visibility` as required (`public` or `private`).
- Persist ingredients in a text column as a JSON array of `RecipeIngredient` objects.
- Suggested column name: `ingredients` (type: `TEXT`) containing serialized JSON.
- Store `amount` as decimal values in the API model and inside the serialized JSON ingredient objects in the database.
- Example `ingredients` column value:
  - `[{"amount":400.0,"unit":"g","ingredient":"spaghetti","ingredientGroup":"Pasta"},{"amount":1.0,"unit":null,"ingredient":"onion","ingredientGroup":"Sauce","preparation":{"type":"text","text":"finely chopped"}},{"amount":1.0,"unit":null,"ingredient":"stock base","preparation":{"type":"recipe-link","recipeId":"vegetable-stock-base","recipeLabel":"Vegetable Stock Base"}}]`
- Persist `yield` as recipe output text/number as defined by the API contract.
- Persist `servings` as portion count.
- Persist `yield` as actual output amount/description (for example: `6 pints`).
- Persist `timings` as structured recipe timing data (`prepMinutes`, `cookMinutes`).
- Persist `imageUrl` as optional URL text field.

---

## Copyright Rules

- Recipes marked as `reference` must not display full copied method steps from external copyrighted sources.
- UI for `reference` recipes must show citation/reference metadata only.
- If a source URL is available, users are directed to the original source via an outbound link.

---

## Access Rules

- `public` recipes are readable by everyone.
- `private` recipes are readable only by authenticated members of the owning household.
- Unauthorized access to private recipes returns `403`.

---

## Observability

Emit structured JSON logs and metrics for:

- Recipe detail viewed.
- Not-found slug requests.
- Slug creation collisions and suffix assignment at write time.

Suggested dimensions:

- `requestId`
- `route` (`/recipe/[id]`)
- `recipeId`
- `result` (`found|not_found`)
- `durationMs`

---

## Future Direction

- At a later stage, introduce a formal ontology for ingredients and nutrition data.
- The ontology will support consistent ingredient normalization and calculated nutrition for recipes.
- Current implementation keeps nutrition as optional secondary API data and does not require ontology-backed computation.

---

## Test Scenarios

1. Slug generation converts title to lowercase hyphenated id.
2. Duplicate title creates `-2`, `-3`, etc.
3. `/recipe/[id]` returns correct recipe for existing id.
4. Unknown id returns `404` and not-found UI state.
5. Invalid id format returns `400`.
6. Slug uniqueness remains safe under concurrent create requests.
7. `full` recipe renders ordered method steps.
8. `reference` recipe hides steps and shows source citation only.
9. External source URL renders with outbound indicator and opens in a new tab/page.
10. `private` recipe returns `403` for non-household users.
11. `private` recipe loads successfully for household members.
12. Ingredient decimal amounts are preserved in API payload and database JSON.
13. Ingredients are grouped by `ingredientGroup` with ungrouped items shown last.
14. Ingredient order is preserved (no sorting) during display.
15. `method[]` is returned for `full` recipes and omitted for `reference` recipes.
16. Base recipe detail loads without nutrition by default.
17. Nutrition is fetched only after explicit request via secondary API.
18. Nutrition API failure does not break base recipe detail rendering.
