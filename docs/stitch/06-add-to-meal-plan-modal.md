# Add to Meal Plan (Modal)

> Appears as: overlay modal on top of the meal planner

## Purpose

Recipe selection interface for adding a recipe to a specific meal slot. Triggered when clicking an empty slot in the weekly meal planner. Provides search, category filtering, and quick selection.

---

## Layout

- Fixed modal overlay with backdrop (blurred, dimmed background)
- Large rounded container (max-width ~5xl, fixed height with internal scroll)
- Three zones: modal header, scrollable content area, modal footer

---

## Modal Header

- Left side:
  - Heading: "What's for Dinner?" (or contextual question based on meal type)
  - Subtitle: "Adding to [Day] [Meal Type] Plan" (e.g. "Adding to Wednesday Night Plan")
- Right side: close button (X icon)

---

## Content Area (scrollable)

### Search Bar

- Full-width rounded input with search icon
- Placeholder: "Search family favorites..."

### Category Chips

- Horizontal wrap of filter chip buttons:
  - "Quick (Under 20m)" — icon + text, active/filled state
  - "Kid Favorites" — icon + text
  - "Allergy Friendly" — icon + text
  - "Batch Cooking" — icon + text

### Recipe Grid

- 3-column responsive grid (2-col on smaller viewports)
- Each recipe card:
  - Image (fixed height)
  - **"Best Match" badge** (top-left overlay on recommended recipes): star icon + text
  - Content below image:
    - Tag pills (dietary/time info)
    - Recipe title
    - Description (2-line)
    - **"Add to Plan" button** (full width):
      - Recommended recipes: primary filled button style
      - Other recipes: outlined/secondary button style
      - Plus-circle icon + text

---

## Modal Footer

- Left side: "View Recent Recipes" text button with history icon
- Right side: "Custom Entry" button (allows free-text meal without a saved recipe)

---

## Mobile Navigation

- Bottom nav bar visible beneath modal (Plan, Recipes, Family, List)
- Modal sits above the bottom nav

---

## Key Interactions

- Search filters the recipe grid in real-time
- Category chips filter results (toggle active/inactive)
- "Add to Plan" immediately assigns the recipe to the selected meal slot and closes the modal
- "Custom Entry" opens a text input for a manual meal name (no linked recipe)
- "View Recent Recipes" shows previously assigned recipes for quick re-selection
- Close button (X) or backdrop click dismisses the modal without adding anything
