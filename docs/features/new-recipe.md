---
status: design-review
---

# New Recipe

Allow authenticated users to create new recipes. The form supports both content types (`full` and `reference`) on a single page with dynamic sections that adapt to the chosen type.

Newly created recipes default to `private` visibility (household-scoped), with an option to set `public` at creation time.

---

## Route

| Path           | Purpose             |
| -------------- | ------------------- |
| `/recipes/new` | Create a new recipe |

---

## Source Scope

This feature extends the recipe lifecycle defined in:

- [Recipe Detail](./recipe-detail.md) — read/display path for created recipes.
- [Recipes Browse And Search](./recipes.md) — listing path where new recipes appear.

This feature must also conform to shared baselines:

- [Security Baseline](../designs/security.md)
- [Scalability Baseline](../designs/scalability.md)
- [Reliability Baseline](../designs/reliability.md)
- [Observability Baseline](../designs/observability.md)
- [Maintainability Baseline](../designs/maintainability.md)

---

## User Flows

### Create A Full Recipe

```
/recipes/new
  -> user selects type "Full recipe"
  -> form shows: title, description, image URL, servings, yield, prep time, cook time
  -> form shows: ingredients section with add/remove/reorder
  -> form shows: method steps section with add/remove/reorder
  -> form shows: tags input, notes, visibility toggle (default "Household")
  -> user fills required fields (title, at least one ingredient, at least one method step)
  -> submit
  -> server validates, generates slug, persists recipe
  -> redirect to /recipes/[generated-slug]
```

### Create A Reference Recipe

```
/recipes/new
  -> user selects type "Reference recipe"
  -> form shows: title, description, image URL, servings, yield, prep time, cook time
  -> form shows: ingredients section with add/remove/reorder
  -> form hides: method steps section
  -> form shows: source reference section (book or URL citation)
  -> form shows: tags input, notes, visibility toggle (default "Household")
  -> user fills required fields (title, at least one ingredient, source reference)
  -> submit
  -> server validates, generates slug, persists recipe
  -> redirect to /recipes/[generated-slug]
```

### Navigate To Create

```
/recipes
  -> click "Add Recipe" button/CTA
  -> navigate to /recipes/new
```

### Slug Collision

```
/recipes/new
  -> user submits recipe with title that generates a duplicate slug
  -> server appends numeric suffix (-2, -3, etc.)
  -> recipe is created with the suffixed slug
  -> redirect to /recipes/[suffixed-slug]
```

### Validation Failure

```
/recipes/new
  -> user submits incomplete or invalid form
  -> server returns field-level errors
  -> form redisplays with error messages and preserved input
  -> user corrects and resubmits
```

---

## Page Design (MVP)

Single-page form with dynamic sections based on recipe type selection.

### Form Layout

```
┌─────────────────────────────────────────────────────────────┐
│ New Recipe                                                  │
├─────────────────────────────────────────────────────────────┤
│ Recipe Type: [Full recipe ▼]                                │
│                                                             │
│ Title*: [________________________]                          │
│ Description: [________________________]                     │
│              [________________________]                     │
│ Image URL: [________________________]                       │
│                                                             │
│ ┌─ Timings & Servings ────────────────────────────────────┐ │
│ │ Prep (mins): [___]   Cook (mins): [___]                 │ │
│ │ Servings:    [___]   Yield:       [___________]         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Ingredients* ──────────────────────────────────────────┐ │
│ │ Group: [___________]                                    │ │
│ │ Amount: [__] Unit: [__] Ingredient: [________]          │ │
│ │ Preparation: [____________]                             │ │
│ │ [+ Add ingredient]                                      │ │
│ │                                                         │ │
│ │ • 400g spaghetti                              [× Remove]│ │
│ │ • 150g pancetta (diced)                       [× Remove]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Method Steps (full only)* ─────────────────────────────┐ │
│ │ Step: [________________________________]                 │ │
│ │ [+ Add step]                                            │ │
│ │                                                         │ │
│ │ 1. Cook spaghetti until al dente.             [× Remove]│ │
│ │ 2. Crisp pancetta in a pan.                   [× Remove]│ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─ Source Reference (reference only)* ────────────────────┐ │
│ │ Kind: [Book ▼]                                          │ │
│ │ Label*: [________________________]                      │ │
│ │ Book Title: [________________________]                  │ │
│ │ Page: [___]  ISBN: [_______________]                     │ │
│ │                                                         │ │
│ │ --- OR ---                                              │ │
│ │ Kind: [URL ▼]                                           │ │
│ │ Label*: [________________________]                      │ │
│ │ URL*: [________________________]                        │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Tags: [italian] [quick] [+ Add tag]                         │
│ Notes: [________________________]                           │
│                                                             │
│ Visibility: (•) Household  ( ) Everyone                     │
│                                                             │
│ [Cancel]                               [Create Recipe]      │
└─────────────────────────────────────────────────────────────┘
```

### Dynamic Section Rules

- **Full recipe**: show Method Steps section, hide Source Reference section.
- **Reference recipe**: show Source Reference section, hide Method Steps section.
- Changing recipe type clears the hidden section's data and shows the appropriate section.

### Ingredient Entry

- Each ingredient row includes: amount (optional decimal), unit (optional), ingredient name (required), group (optional), preparation (optional text).
- Ingredients are added one at a time via the input row and an "Add" button.
- Added ingredients appear in a list below with a remove button on each row.
- Recipe-link preparation type is deferred to a future iteration; only text preparation is supported in MVP.
- Ingredient order is preserved as entered by the user.

### Method Step Entry

- Each step is a single text input.
- Steps are added one at a time and displayed as an ordered list.
- Each step has a remove button.
- Step order is preserved as entered.
- Method step text supports plain text only in MVP (Markdown rendering deferred).

### Source Reference Entry

- Kind selector: `book` or `url`.
- Book fields: label (required), book title (optional), page number (optional), ISBN (optional).
- URL fields: label (required), URL (required).
- Kind change clears the other kind's fields.

### Tags Entry

- Free-text tag input with an add button.
- Tags appear as removable chips.
- Tags are lowercased and trimmed on entry.
- Duplicate tags are silently ignored.

### Visibility Control

- Radio button or toggle with user-friendly labels: "Household" (maps to `private`, default) or "Everyone" (maps to `public`).
- "Household" requires the user to have a household; if the user has no household, show guidance to create or join one first.

### Cancel Behavior

- Cancel navigates back to `/recipes` without saving.
- If form has unsaved changes, show a confirmation prompt before discarding.

---

## API Dependencies

### POST `/api/recipes`

Purpose:

- Create a new recipe and return the created record.

Request body:

- `title`: required string, minimum 1 character, maximum 200 characters.
- `description`: optional string, maximum 2000 characters.
- `imageUrl`: optional string, valid URL format.
- `type`: required, one of `full` or `reference`.
- `visibility`: optional, one of `public` or `private`, default `private`.
- `servings`: optional integer, minimum 1.
- `yield`: optional string, maximum 100 characters.
- `prepMinutes`: optional integer, minimum 0.
- `cookMinutes`: optional integer, minimum 0.
- `ingredients`: required array of `RecipeIngredient`, minimum 1 item.
- `method`: required array of strings when `type` is `full`, minimum 1 item. Must be omitted or empty when `type` is `reference`.
- `sourceReference`: required `RecipeSourceReference` when `type` is `reference`. Optional when `type` is `full`.
- `tags`: optional array of strings.
- `notes`: optional string, maximum 2000 characters.

Response:

- `201` with `RecipeDetail` body including the generated `id` (slug).

Slug generation:

- Server generates slug from `title` using the rules defined in [recipe-detail.md](./recipe-detail.md#id-format-and-uniqueness).
- On collision, append numeric suffix (`-2`, `-3`, ...).
- Slug generation and uniqueness check must be atomic.

Error responses:

- `400` validation errors with field-level detail.
- `401` unauthenticated.
- `403` user cannot create private recipes without household membership.
- `409` slug collision could not be resolved (unlikely but defensive).
- `503` transient backend/database issue.

Contract notes:

- Define this endpoint in TypeSpec (`specs/api/routes/recipes.tsp`) before implementation.
- Recompile TypeSpec and regenerate frontend types after contract changes.

---

## Validation And Rules

### Client-Side Validation

- Title is required and must be 1–200 characters.
- At least one ingredient is required.
- For `full` recipes, at least one method step is required.
- For `reference` recipes, source reference label is required; URL is required when kind is `url`.
- Disable submit button until required fields are populated.
- Show inline validation messages on blur for required fields.

### Server-Side Validation

- All client-side rules are re-validated server-side.
- Title is trimmed and must be non-empty after trimming.
- Slug is generated and uniqueness is enforced.
- `type` must be `full` or `reference`.
- `visibility` must be `public` or `private`.
- When `visibility` is `private`, the user must belong to a household. The recipe's `household_id` is set to the user's household.
- When `visibility` is `public`, `household_id` may be set to the user's household or left null.
- `imageUrl` is validated as a well-formed URL when present.
- `ingredients` array must have at least one item; each item must have a non-empty `ingredient` field.
- `method` array must have at least one item for `full` recipes; each step must be non-empty.
- `sourceReference` is required for `reference` recipes and must have `kind` and `label`.
- Tags are trimmed, lowercased, and deduplicated server-side.
- `amount` values in ingredients are stored as decimal (float64).

### Type-Specific Rules

- `full` recipe: `method` is required, `sourceReference` is optional.
- `reference` recipe: `sourceReference` is required, `method` must be omitted or empty.
- Server rejects `reference` recipes that include `method` steps (copyright protection).

---

## Persistence Rules

- Insert into the `recipes` table defined in `migrations/0003_recipes.sql`.
- `id` is the generated slug (primary key).
- `title` is the original title text.
- `ingredients` is serialized as JSON text array of `RecipeIngredient` objects.
- `method` is serialized as JSON text array of step strings (null for reference recipes).
- `source_reference` is serialized as JSON text object (null for full recipes without a source).
- `tags` is serialized as JSON text array of strings.
- `household_id` is set from the authenticated user's household when visibility is `private`.
- `created_at` and `updated_at` are set to current timestamp at insert time.
- No new migration is required; the existing `recipes` table schema supports all fields.

---

## Access Rules

- Any authenticated user can create a recipe.
- Creating a `private` recipe requires the user to belong to a household; the recipe is scoped to that household.
- Creating a `public` recipe does not require household membership.
- Unauthenticated users receive `401`.

---

## Copyright Rules

- `reference` recipes must not include method steps.
- Server enforces this by rejecting `reference` recipes with non-empty `method` arrays.
- The source reference section guides the user to cite the original source rather than copy content.

---

## Observability

Emit structured JSON logs and metrics for:

- Recipe creation attempted.
- Recipe creation succeeded (include generated slug and recipe type).
- Validation failures (field names and error types, no user content).
- Slug collision and suffix assignment.

Suggested dimensions:

- `requestId`
- `route` (`/api/recipes`)
- `recipeType` (`full` or `reference`)
- `visibility` (`public` or `private`)
- `result` (`created`, `validation_error`, `auth_error`, `server_error`)
- `slugCollision` (`true` or `false`)
- `durationMs`

---

## Accessibility

- All form fields have associated labels.
- Required fields are marked with `aria-required="true"` and visible asterisk indicators.
- Validation errors are associated via `aria-describedby` and announced with `aria-live="polite"`.
- Ingredient and method step lists are keyboard-navigable with clear add/remove affordances.
- Remove buttons have descriptive labels (for example, "Remove ingredient: 400g spaghetti").
- Minimum touch target size of 44x44 for all interactive controls.
- Focus moves to the first error field after a failed submission.

---

## Test Scenarios

1. Authenticated user can create a `full` recipe with valid data and is redirected to the new recipe detail page.
2. Authenticated user can create a `reference` recipe with source citation and is redirected to the new recipe detail page.
3. Title is required; submission without title returns `400`.
4. At least one ingredient is required; submission without ingredients returns `400`.
5. `full` recipe requires at least one method step; submission without steps returns `400`.
6. `reference` recipe requires source reference; submission without it returns `400`.
7. `reference` recipe with method steps is rejected by the server.
8. Slug is generated from title following documented slug rules.
9. Duplicate title generates a suffixed slug (`-2`, `-3`, etc.).
10. Private recipe sets `household_id` from the authenticated user's household.
11. User without a household cannot create a private recipe; receives `403`.
12. User without a household can create a public recipe.
13. Unauthenticated user receives `401`.
14. Tags are trimmed, lowercased, and deduplicated.
15. `imageUrl` must be a valid URL when provided; invalid URL returns `400`.
16. Ingredient `amount` decimal values are preserved in the created recipe.
17. Method step order and ingredient order match submission order.
18. Cancel with unsaved changes shows confirmation prompt.
19. Cancel without changes navigates to `/recipes` without prompt.
20. Form sections update dynamically when recipe type is changed.
21. Source reference kind change clears the other kind's fields.
22. Created recipe appears in the `/recipes` browse listing.

---

## MVP Out Of Scope

- Image upload (URL-only for now).
- Recipe-link preparation type for ingredients (text preparation only).
- Markdown editing toolbar for description and method steps.
- Ingredient reordering via drag-and-drop (add/remove only in MVP).
- Method step reordering via drag-and-drop (add/remove only in MVP).
- Recipe editing (update/patch) — separate feature.
- Recipe deletion — separate feature.
- Draft/auto-save functionality.
- Bulk recipe import.
- Recipe duplication/clone.
