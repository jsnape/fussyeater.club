# Create / Edit Recipe

> Routes: `/recipes/new` (create) and `/recipes/[id]/edit` (edit)
>
> Current status: **Implemented** (create only) — multi-section form with ingredients, method, tags, visibility. Edit mode not yet wired.

## Purpose

Author a new recipe or edit an existing one. Supports two recipe types: `full` recipes (with method steps) and `reference` recipes (link to an external source). Supports draft workflows, preview before publish, sensory metadata, and real-time compatibility checking against household profiles.

---

## Layout

- Standard app header with navigation
- Page header with title, subtitle, and back link
- Single-column form layout (max-width constrained, ~4xl)
- Section-by-section vertical form with distinct cards stacked vertically
- Sticky footer bar with save/cancel actions

---

## Page Header

- **Title:** "Add New Recipe" (create) or "Edit Recipe" (edit)
- **Subtitle:** "Share a meal the whole family can enjoy"
- Back link: "← Back to Recipes"

---

## Recipe Type Selector

- Toggle or radio group at the top of the form:
  - **Full Recipe** — includes ingredients and method steps
  - **Reference Recipe** — links to an external recipe with source citation
- Switching type shows or hides the relevant sections
- Changing recipe type clears the hidden section's data and shows the appropriate section

### Current implementation

Implemented with radio buttons for type selection.

---

## Form Sections

### 1. Basic Info

- Recipe title (required, text input)
- Description (optional, textarea, 2–3 lines)

### 2. Hero Image

- Image upload area (drag-and-drop or click to browse)
- Preview thumbnail after upload
- "Remove" button to clear
- Fallback placeholder if no image is set

### 3. Timings & Servings

- Prep time (minutes input)
- Cook time (minutes input)
- Total time (auto-calculated or manual override)
- Servings/yield (number input plus optional unit, for example `4 servings` or `12 muffins`)

### 4. Sensory Profile

- **Dominant Textures** — horizontal wrap of toggle pill buttons:
  - Crunchy
  - Smooth
  - Soft
  - Chewy
  - Mixed
- **Contains Allergens (Tags)** — tag input field with removable chips and inline text input
- Multiple texture selections and allergen tags are allowed

### 5. Ingredients

- Required for both `full` and `reference` recipes
- Dynamic list of ingredient rows or builder items
- Each ingredient row includes:
  - Optional group
  - Optional amount input (decimal supported)
  - Optional unit dropdown
  - Required ingredient name input
  - Optional preparation text
  - Remove button
  - Drag handle for reordering
- "+ Add Ingredient" or "+ Add Item" appends a new row at the bottom
- Ingredient order is preserved as entered or reordered
- Ingredient name input can use autocomplete from known ingredients
- Inline compatibility indicator per ingredient can show warning icon plus member name when the ingredient conflicts with a household profile

### 6. Method Steps (full recipe only)

- Dynamic list of numbered steps or step blocks
- Each step can include:
  - Auto-incremented step number
  - Optional step title
  - Instruction textarea
  - Optional sensory note sub-field for sensory-friendly tips
  - Remove button
  - Drag handle or reorder controls
- "+ Add Step" appends a new step
- Method step order is preserved as entered or reordered

### 7. Source Reference (reference recipe only)

- Source reference section is shown for reference recipes and method steps are hidden
- Kind selector: `book` or `url`
- Label/source name is required
- Book fields:
  - Book title (optional)
  - Page number (optional)
  - ISBN (optional)
- URL fields:
  - URL (required, validated)
- Kind change clears the other kind's fields
- Reference recipes use source citation rather than copied method content

### 8. Tags

- Tag input field with autocomplete from existing tags
- Selected tags appear as removable chips below the input
- Suggested tag categories:
  - dietary (`dairy-free`, `gluten-free`, etc.)
  - meal type (`breakfast`, `lunch`, `dinner`, `snack`)
  - texture (`smooth`, `crunchy`, etc.)
  - other (`quick`, `freezable`, `batch-cook`, etc.)
- Tags are trimmed, lowercased, and duplicate tags are ignored

### 9. Notes

- Freeform textarea for additional notes such as storage tips, variations, or kid-friendly tweaks

### 10. Visibility

- Radio group or toggle:
  - **Household** / **My household only** — maps to `private` and is the default
  - **Everyone** / **Public** — maps to `public`
- Private recipes require household membership
- If the user has no household, show guidance to create or join one first

---

## Compatibility Preview Panel

- Shows real-time compatibility against household profiles as ingredients are added
- Per-member indicator: safe, warning, or conflict
- Lists specific conflicts with suggested swaps
- Only visible when household profiles exist and sync is enabled

### Current implementation

**Not built.** Requires profile data and client-side compatibility checking.

---

## Sticky Footer Bar

- **Left:** "Cancel" text button (navigates back with unsaved-changes confirmation if dirty)
- **Right:** "Save as Draft" secondary button, "Preview Draft" secondary button, and "Publish Recipe" primary button
- Edit mode: "Save Changes" replaces "Publish"
- Autosave indicator can show status such as "Autosaved just now"

### Current implementation

Submit and cancel buttons exist. Draft concept is not yet implemented.

---

## Draft Preview

### Route

- `/recipes/[id]/preview`

### Purpose

- Show a read-only preview of a recipe before publishing
- Allow the author to verify how the recipe will appear to household members, check compatibility flags, and decide whether to publish or continue editing

### Draft Action Bar

- **Draft badge:** "Draft Preview"
- **Last saved timestamp:** shows the last saved time with a clock icon
- **Action buttons:**
  - "Share Link"
  - "Back to Edit"
  - "Publish Recipe"

### Preview Content

- Recipe content is rendered identically to the published Recipe Detail view
- Visual border or frame indicates the recipe is in preview mode and not live
- Hero section can show cover image, sensory badges, title, description, and metadata
- Household compatibility grid shows safe and flagged family members
- Ingredients and instructions are read-only and non-interactive

### Key interactions

- All recipe content is read-only in preview mode
- "Back to Edit" returns to the create/edit form with data preserved
- "Publish Recipe" transitions the recipe from draft to published state
- "Share Link" generates or copies a preview URL

---

## API Contract

### POST `/api/recipes`

Purpose:

- Create a new recipe and return the created record

#### Request body

- `title`: required string, minimum 1 character, maximum 200 characters
- `description`: optional string, maximum 2000 characters
- `imageUrl`: optional string, valid URL format
- `type`: required, one of `full` or `reference`
- `visibility`: optional, one of `public` or `private`, default `private`
- `servings`: optional integer, minimum 1
- `yield`: optional string, maximum 100 characters
- `prepMinutes`: optional integer, minimum 0
- `cookMinutes`: optional integer, minimum 0
- `ingredients`: required array of `RecipeIngredient`, minimum 1 item
- `method`: required array of strings when `type` is `full`, minimum 1 item; must be omitted or empty when `type` is `reference`
- `sourceReference`: required `RecipeSourceReference` when `type` is `reference`; optional when `type` is `full`
- `tags`: optional array of strings
- `notes`: optional string, maximum 2000 characters

#### Response

- `201` with `RecipeDetail` body including the generated `id` (slug)

#### Slug generation

- Server generates the slug from `title`
- On collision, append a numeric suffix (`-2`, `-3`, and so on)
- Slug generation and uniqueness check must be atomic

#### Error responses

- `400` validation errors with field-level detail
- `401` unauthenticated
- `403` user cannot create private recipes without household membership
- `409` slug collision could not be resolved
- `503` transient backend or database issue

#### Contract notes

- Define this endpoint in TypeSpec (`specs/api/routes/recipes.tsp`) before implementation
- Recompile TypeSpec and regenerate frontend types after contract changes

---

## Validation

### Client-side validation

- Title is required and must be 1–200 characters
- At least one ingredient is required
- For `full` recipes, at least one method step is required
- For `reference` recipes, a source reference label is required; URL is required when kind is `url`
- Disable submit until required fields are populated
- Show inline validation messages on blur for required fields
- Image is optional, with max file size limits (for example `5MB`) and accepted formats such as `jpg`, `png`, and `webp`

### Server-side validation

- All client-side rules are re-validated server-side
- Title is trimmed and must be non-empty after trimming
- `type` must be `full` or `reference`
- `visibility` must be `public` or `private`
- When `visibility` is `private`, the user must belong to a household and the recipe `household_id` is set to that household
- When `visibility` is `public`, `household_id` may be set to the user's household or left null
- `imageUrl` is validated as a well-formed URL when present
- `ingredients` must contain at least one item, and each item must have a non-empty ingredient field
- `method` must contain at least one non-empty step for `full` recipes
- `sourceReference` is required for `reference` recipes and must have `kind` and `label`
- Tags are trimmed, lowercased, and deduplicated server-side
- Ingredient `amount` values are stored as decimal (`float64`)
- Server generates the slug and enforces uniqueness

### Type-specific rules

- `full` recipe: `method` is required, `sourceReference` is optional
- `reference` recipe: `sourceReference` is required, `method` must be omitted or empty
- Server rejects `reference` recipes that include method steps

---

## Persistence Rules

- Insert into the `recipes` table defined in `migrations/0003_recipes.sql`
- `id` is the generated slug and primary key
- `title` is stored as the original title text
- `ingredients` is serialized as a JSON text array of `RecipeIngredient` objects
- `method` is serialized as a JSON text array of step strings, or `null` for reference recipes
- `source_reference` is serialized as a JSON text object, or `null` for full recipes without a source
- `tags` is serialized as a JSON text array of strings
- `household_id` is set from the authenticated user's household when visibility is `private`
- `created_at` and `updated_at` are set to the current timestamp at insert time
- No new migration is required; the existing `recipes` table schema supports all fields

---

## Access Rules

- Any authenticated user can create a recipe
- Creating a `private` recipe requires household membership and scopes the recipe to that household
- Creating a `public` recipe does not require household membership
- Unauthenticated users receive `401`

---

## Copyright Rules

- `reference` recipes must not include method steps
- Server enforces this by rejecting `reference` recipes with non-empty `method` arrays
- The source reference section guides the user to cite the original source rather than copy content

---

## Observability

Emit structured JSON logs and metrics for:

- Recipe creation attempted
- Recipe creation succeeded, including generated slug and recipe type
- Validation failures, including field names and error types but not user content
- Slug collision and suffix assignment

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

- All form fields have associated labels
- Required fields are marked with visible asterisks and `aria-required="true"`
- Validation errors are associated with fields via `aria-describedby` and announced with `aria-live="polite"`
- Ingredient and method lists are keyboard navigable with clear add/remove affordances
- Remove buttons have descriptive labels
- Minimum touch target size of `44x44` for interactive controls
- Focus moves to the first error field after a failed submission

---

## Error States

- Field-level inline validation errors shown on blur and on submit
- API error toast notification with retry option
- Network error preserves the form and offers a retry prompt

---

## Current Implementation Notes

The create form is functional with sections for basic info, image, metadata, ingredients, method or source, tags, notes, and visibility. `POST /api/recipes` works. What's missing:

- Edit mode (load existing recipe, populate form, update it)
- Draft and publish distinction
- Compatibility preview panel
- Ingredient autocomplete from a known-ingredients list
- Drag-to-reorder on ingredients and steps

---

## Key Interactions

- Recipe type toggle shows or hides relevant sections with a smooth transition
- Ingredient rows are addable, removable, and reorderable
- Method steps are addable, removable, and reorderable
- Tag input supports autocomplete with debounced search
- Allergen tags and texture selections are multi-select controls
- Unsaved changes trigger a confirmation dialog on navigation away
- Image upload supports click or drag-and-drop and can show progress
- Autosave triggers periodically and shows a confirmation indicator
- "Preview Draft" opens a read-only preview before publish
- "Publish" submits and redirects to the recipe detail page
- Compatibility preview updates in real time as ingredients change

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
9. Duplicate title generates a suffixed slug (`-2`, `-3`, and so on).
10. Private recipe sets `household_id` from the authenticated user's household.
11. User without a household cannot create a private recipe and receives `403`.
12. User without a household can create a public recipe.
13. Unauthenticated user receives `401`.
14. Tags are trimmed, lowercased, and deduplicated.
15. `imageUrl` must be a valid URL when provided; invalid URL returns `400`.
16. Ingredient `amount` decimal values are preserved in the created recipe.
17. Method step order and ingredient order match submission order.
18. Cancel with unsaved changes shows a confirmation prompt.
19. Cancel without changes navigates to `/recipes` without a prompt.
20. Form sections update dynamically when recipe type is changed.
21. Source reference kind change clears the other kind's fields.
22. Created recipe appears in the `/recipes` browse listing.
