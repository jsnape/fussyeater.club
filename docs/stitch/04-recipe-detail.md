# Recipe Detail

> Route: `/recipes/[id]`

## Purpose

Display a complete recipe with full-bleed hero image, structured method steps, grouped ingredients, and contextual tips. Simple reading experience optimised for cooking along.

---

## Layout

- Standard app header with navigation
- Full-width hero image section
- Two-column content below hero: method/instructions (left, 8 cols) + ingredients sidebar (right, 4 cols, sticky)
- Footer

---

## Hero Section

- Full-width, tall image (fills viewport width)
- Gradient overlay at bottom (dark, for text legibility)
- Overlaid content at bottom-left:
  - Recipe title (large display heading, white text)
  - Tag pills row: dietary/category badges (e.g. "Veggie-heavy", "Quick", "Dairy-free")

---

## Metadata Bar

- Horizontal row with dividers between items:
  - Prep Time: label + value (e.g. "15m")
  - Cook Time: label + value (e.g. "20m")
  - Yield: label + value (e.g. "4 servings")
- Contained in a rounded card with border

---

## Left Column: The Method

- Section heading with icon: "The Method"
- Numbered step list:
  - Each step: large circular number badge + body paragraph text
  - Steps are vertically spaced for readability

### Tips Callout (after method)

- Highlighted card with lightbulb icon
- "Mom's Tips" label (uppercase, bold)
- Italicised tip text with practical advice (e.g. swap suggestions, serving ideas)

---

## Right Column: Ingredients (sticky sidebar)

- Card container with basket icon + heading "Ingredients"
- Grouped by sub-category (e.g. "Noodles & Sauce", "The Veggies"):
  - Subheading (uppercase label)
  - Checkbox list of ingredients:
    - Each item: checkbox + ingredient name with quantity
    - Checking marks ingredient as "prepped" (strike-through)
- **"Add to Shopping List" button** (full width, bottom of card):
  - Cart icon + text
  - Adds all ingredients to the shopping list

---

## Key Interactions

- Ingredient checkboxes toggle independently (for tracking prep)
- "Add to Shopping List" adds unchecked ingredients to the user's shopping list
- Ingredients sidebar is sticky on desktop (follows scroll)
- Tags in hero are informational (not clickable from this page)
