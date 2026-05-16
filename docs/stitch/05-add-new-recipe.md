# Add New Recipe

> Route: `/recipes/new`

## Purpose

Allow users to create a new recipe with structured input for basic info, timings, ingredients, method steps, dietary tags, and visibility settings.

---

## Layout

- Standard app header with navigation
- Page header (centred or left-aligned): title + encouraging subtitle
- Single-column form layout (max-width constrained, ~4xl)
- Sections as distinct cards stacked vertically
- Action buttons at bottom
- Footer

---

## Page Header

- Title: "Create New Recipe"
- Subtitle: "Don't worry, you can always edit this later. Let's start with the basics."

---

## Form Sections

### 1. Basic Information

- Section card with icon + heading
- Fields:
  - **Recipe Title** — text input (full width), placeholder "e.g., Hidden Veggie Pasta Sauce"
  - **Description** — textarea (3 rows), placeholder "Tell us why your family loves this dish..."
  - **Recipe Photo** — drop zone / upload area:
    - Dashed border container with camera icon + "Click to upload or drag and drop" + file type/size hint
    - Shows preview image if uploaded (with change option)

### 2. Timings & Servings

- Section card with clock icon + heading
- 3-column grid:
  - **Prep Time (mins)** — number input
  - **Cook Time (mins)** — number input
  - **Servings** — number input

### 3. Ingredients

- Section card with grocery icon + heading
- List of ingredient rows:
  - Each row: Amount input (1/3 width) + Ingredient name input (2/3 width) + delete button (trash icon)
  - Delete button appears on hover/focus
- **"+ Add Row" button** (full width, dashed border, primary text) — appends new empty row

### 4. Method

- Section card with receipt icon + heading
- List of step blocks:
  - Each step: circular number badge + textarea for instructions
- **"+ Add Step" button** (full width, dashed border, primary text) — appends new step

### 5. Tags & Visibility

- Section card with label icon + heading
- **Dietary Requirements** — horizontal wrap of toggle pill buttons:
  - Options: Dairy Free, Gluten Free, Nut Free, Vegetarian, No Sugar
  - Selected state shows filled container style
  - Multiple selection allowed
- **Private Recipe toggle:**
  - Row with label "Private Recipe" + subtitle "Only you and your household can see this."
  - Toggle switch (on/off)

---

## Form Actions (bottom)

- Divider line above
- Right-aligned button row:
  - "Cancel" — text button (navigates back without saving)
  - "Save Recipe" — primary pill button (submits the form)

---

## Key Interactions

- Photo upload accepts click or drag-and-drop
- Ingredient rows and steps can be added dynamically
- Dietary tag buttons toggle on/off independently (multi-select)
- Privacy toggle saves immediately or with form submission
- Cancel navigates back without saving (confirm if form is dirty)
- Save validates required fields (title, at least one ingredient, at least one step)
