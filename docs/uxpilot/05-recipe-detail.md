# Recipe Detail

> Route: `/recipes/[id]`

## Purpose

Display a complete recipe with ingredients, step-by-step instructions, and sensory/allergy safety information. Users can add recipes to their meal plan or shopping list, and see compatibility with their household members.

---

## Layout

- Standard app header with navigation
- Hero section (image + recipe info, side by side on desktop)
- Main content split: ingredients column (left/narrow) + instructions column (right/wide)
- Stacks vertically on mobile

---

## Hero Section

### Image (left on desktop, top on mobile)

- Large rounded image container
- **Back button overlay** (top left): circular button with arrow icon, navigates to browse
- **Favourite button overlay** (top right): circular heart toggle
- **Compatibility badge overlay** (bottom left): shows match percentage for selected family member (e.g. "100% Match for Leo")

### Recipe Info (right on desktop, below image on mobile)

- Category/tag badges (e.g. "Dinner", "High Success Rate")
- **Recipe title** (large heading)
- **Metadata row:** Prep time (clock icon), Cook time (fire icon), Servings (people icon)
- **Description paragraph**
- **Action buttons row:**
  - "Add to Meal Plan" — primary button with calendar icon
  - "Add to Shopping List" — secondary button with cart icon

---

## Main Content

### Left Column: Safety & Ingredients

#### Family Compatibility Panel

- Heading with shield icon: "Family Compatibility"
- List of compatibility status items per family member:
  - **Safe match:** member name + "No [allergens] (using suggested swaps)" — positive indicator
  - **Texture alert:** description of texture concern + reference to serving tips — warning indicator

#### Ingredients List

- Heading + item count badge
- Vertical list of ingredients, each showing:
  - Small ingredient thumbnail/icon
  - Ingredient name + quantity/unit
- **Flagged ingredient with swap:**
  - Ingredient shown with strike-through and "Flagged: [allergen] ([member name])" label
  - Ingredient thumbnail shows a ban/blocked overlay
  - Indented swap suggestion below: "SWAP APPLIED" badge + replacement ingredient name + quantity

### Right Column: Instructions & Tips

#### Cooking Mode Toggle

- Segmented control bar: "Standard" | "Deconstructed View"
- Allows switching between normal instructions and a separated/deconstructed serving guide

#### Instructions

- Heading: "Instructions"
- Numbered step list:
  - Each step has a circular number indicator, a bold step title, and body paragraph text
  - **Inline sensory tips** may appear within steps: highlighted callout box with lightbulb icon and "Sensory Tip:" prefix, explaining texture/preparation guidance

#### Plating & Sensory Tips Section

- Distinct highlighted section after instructions
- Icon + heading: "Plating & Sensory Tips"
- 2-column grid of tip cards (stack on mobile):
  - Each card: bold title + descriptive text
  - Examples: "Keep it Separate" (divided plate guidance), "Safe Dips" (serving dips on the side)

---

## Key Interactions

- Back button navigates to previous page (browser history) or `/recipes`
- Favourite toggle saves/unsaves the recipe
- "Add to Meal Plan" opens day/meal picker or adds to current week
- "Add to Shopping List" adds all ingredients (with swaps applied) to the shopping list
- Cooking mode toggle switches the instruction layout between standard and deconstructed views
- Ingredient swaps can be accepted or dismissed by the user
