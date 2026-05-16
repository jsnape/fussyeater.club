# Create / Edit Recipe

> Routes: `/recipes/new` (create) and `/recipes/[id]/edit` (edit)
>
> Current status: **Implemented** (create only) — multi-section form with ingredients, method, tags, visibility. Edit mode not yet wired.

## Purpose

Author a new recipe or edit an existing one. Supports two recipe types: "full" recipes (with method steps) and "reference" recipes (link to external source). Shows real-time compatibility preview against household profiles.

---

## Layout

- Standard app header with navigation
- Centred form container (max-width constrained)
- Section-by-section vertical form
- Sticky footer bar with save/cancel actions

---

## Page Header

- **Title:** "Add New Recipe" (create) or "Edit Recipe" (edit)
- **Subtitle:** "Share a meal the whole family can enjoy"
- Back link: "← Back to Recipes"

---

## Recipe Type Selector

- Toggle or radio group at top of form:
  - **"Full Recipe"** — includes ingredients and method steps
  - **"Reference"** — links to an external recipe with notes
- Switching type shows/hides relevant sections

### Current implementation

Implemented with radio buttons for type selection.

---

## Form Sections

### 1. Basic Info

- Recipe title (required, text input)
- Description (optional, textarea, 2-3 lines)

### 2. Hero Image

- Image upload area (drag-and-drop or click to browse)
- Preview thumbnail after upload
- "Remove" button to clear
- Fallback: shows placeholder if no image set

### 3. Timings & Servings

- Prep time (minutes input)
- Cook time (minutes input)
- Total time (auto-calculated or manual override)
- Servings/yield (number input + optional unit, e.g. "4 servings" or "12 muffins")

### 4. Ingredients (full recipe only)

- Dynamic list of ingredient rows:
  - Quantity input (number/fraction)
  - Unit dropdown (g, kg, ml, L, tsp, tbsp, cups, items, pinch, etc.)
  - Ingredient name input (with autocomplete from known ingredients)
  - Remove button (×)
- "+ Add Ingredient" button (appends new row)
- Drag handles for reordering
- **Compatibility indicator per ingredient:** if the ingredient conflicts with a household member's profile, show inline warning icon + member name

### 5. Method Steps (full recipe only)

- Dynamic list of numbered steps:
  - Step number (auto-incremented)
  - Instruction textarea
  - Remove button (×)
- "+ Add Step" button
- Drag handles for reordering

### 6. Source Reference (reference recipe only)

- Source name (text input, e.g. "BBC Good Food")
- URL (required, validated)
- Notes about the recipe (textarea)

### 7. Tags

- Tag input field with autocomplete from existing tags
- Shows selected tags as removable chips below input
- Suggested tag categories: dietary (dairy-free, gluten-free, etc.), meal type (breakfast, lunch, dinner, snack), texture (smooth, crunchy, etc.), other (quick, freezable, batch-cook, etc.)

### 8. Notes

- Freeform textarea for additional notes (storage tips, variations, kid-friendly tweaks)

### 9. Visibility

- Radio group:
  - **"My household only"** — private to household members
  - **"Public"** — visible to all users in recipe browse

---

## Compatibility Preview Panel (sidebar or expandable)

- Shows real-time compatibility against household profiles as ingredients are added
- Per-member indicator: safe/warning/conflict
- Lists specific conflicts with suggested swaps
- Only visible when household profiles exist and sync is enabled

### Current implementation

**Not built.** Requires profile data + client-side compatibility checking.

---

## Sticky Footer Bar

- **Left:** "Cancel" text button (navigates back with unsaved-changes confirmation if dirty)
- **Right:** "Save as Draft" secondary button + "Publish Recipe" primary button
- Edit mode: "Save Changes" replaces "Publish"

### Current implementation

Submit and cancel buttons exist. Draft concept is not yet implemented.

---

## Validation

- Title: required, min 3 characters
- Ingredients: at least 1 required (full recipe)
- Method: at least 1 step required (full recipe)
- Source URL: required and valid URL format (reference recipe)
- Image: optional, max file size (e.g. 5MB), accepted formats (jpg, png, webp)

---

## Error States

- Field-level inline validation errors (shown on blur and on submit)
- API error: toast notification with retry option
- Network error: form preserved, retry prompt

---

## Current Implementation Notes

The create form is functional with all sections (basic info, image, metadata, ingredients, method/source, tags, notes, visibility). POST to `/api/recipes` works. What's missing:
- Edit mode (GET existing recipe, populate form, PUT/PATCH to update)
- Draft/publish distinction
- Compatibility preview panel
- Ingredient autocomplete from a known-ingredients list
- Drag-to-reorder on ingredients and steps

---

## Key Interactions

- Recipe type toggle shows/hides relevant sections with smooth transition
- Ingredient rows are addable, removable, and reorderable
- Method steps are addable, removable, and reorderable
- Tag input has autocomplete with debounced search
- Unsaved changes trigger confirmation dialog on navigation away
- Image upload shows progress indicator
- "Publish" submits and redirects to the new recipe's detail page
- Compatibility preview updates in real-time as ingredients change
