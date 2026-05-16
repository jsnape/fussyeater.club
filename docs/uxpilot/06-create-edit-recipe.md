# Create / Edit Recipe

> Route: `/recipes/new` (create) and `/recipes/[id]/edit` (edit)

## Purpose

Allow users to author new recipes or edit existing ones. Provides structured input for all recipe data including ingredients, method steps, sensory metadata, and allergen tagging.

---

## Layout

- Standard app header with navigation
- Sticky editor header (title input + action buttons)
- Two-column layout: metadata sidebar (left) + content builder (right)
- Stacks vertically on mobile (metadata on top, content below)

---

## Sticky Editor Header

- **Recipe title input:** large inline editable text field with placeholder "Recipe Title..."
- **Autosave indicator:** text showing "Autosaved just now" with cloud upload icon
- **Action buttons (right-aligned):**
  - "Save Draft" — secondary button
  - "Preview Draft" — secondary/outlined button
  - "Publish" — primary action button

---

## Left Column: Metadata & Setup

### Cover Photo

- Card with "Cover Photo" heading
- Drop zone / upload area:
  - If no image: dashed border area with camera icon + "Upload Photo" text
  - If image exists: shows thumbnail with overlay "Change Photo" on hover
- Supports click-to-upload or drag-and-drop

### Core Details

- Card with "Core Details" heading
- **Summary / Description** — textarea (3 rows), placeholder text
- **Metadata grid** (2×2):
  - Prep Time (minutes) — number input with clock icon
  - Cook Time (minutes) — number input with fire icon
  - Servings — number input with people icon
  - (Optional 4th field for yield if needed)

### Sensory Profile

- Card with "Sensory Profile" heading
- **Dominant Textures** — label + horizontal wrap of toggle pill buttons:
  - Options: Crunchy, Smooth, Soft, Chewy, Mixed
  - Selected textures are visually highlighted
  - Multiple selection allowed
- **Contains Allergens (Tags)** — tag input field:
  - Shows existing allergen tags as removable chips (e.g. "Dairy", "Gluten")
  - Inline text input to type and add new tags
  - Removing a tag: click X on the chip

---

## Right Column: Content Builder

### Ingredients Builder

- Card with heading "Ingredients" + "+ Add Item" button (top right)
- List of ingredient rows, each containing:
  - Drag handle (grip icon, left side)
  - **Quantity** — small text input
  - **Unit** — dropdown select (lb, cup, tbsp, oz, etc.)
  - **Ingredient name** — text input (widest field)
  - **Delete button** — trash icon, appears on hover
- Rows are reorderable via drag-and-drop
- "+ Add Item" appends a new empty row at the bottom

### Step-by-Step Instructions Builder

- Card with heading "Step-by-Step Instructions" + "+ Add Step" button (top right)
- List of step blocks, each containing:
  - **Step number** — circular badge (auto-increments)
  - **Step title** — optional inline text input (bold, acts as heading)
  - **Step description** — textarea for the instruction body
  - **Sensory note sub-field** — highlighted area with lightbulb icon and text input for sensory-friendly tips (e.g. "Ensure the coating is even"). Optional per step.
  - **Reorder controls** — up/down arrow buttons, visible on hover
  - **Delete button** — trash icon, visible on hover
- Steps are reorderable (drag or arrow buttons)
- "+ Add Step" appends a new empty step block

---

## Key Interactions

- Title field is always visible (sticky header) — changes are saved on blur or autosave interval
- Autosave triggers periodically and shows confirmation indicator
- "Save Draft" explicitly saves without publishing
- "Preview Draft" navigates to a read-only preview (see Recipe Preview spec)
- "Publish" makes the recipe visible to household/public depending on visibility setting
- Ingredient rows and steps can be reordered via drag-and-drop or up/down controls
- Allergen tags and texture selections are multi-select toggles
- Cover photo upload shows progress indicator during upload
