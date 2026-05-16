# Recipe Preview (Draft)

> Route: `/recipes/[id]/preview`

## Purpose

Show a read-only preview of a recipe before publishing. Allows the author to verify how the recipe will appear to household members, check compatibility flags, and decide whether to publish or continue editing.

---

## Layout

- Standard app header (navigation is present but visually disabled/dimmed — user is in preview mode)
- Sticky draft action bar below header
- Recipe content rendered identically to the published Recipe Detail view
- Visual border/frame indicator showing "this is a preview, not live"

---

## Draft Action Bar (sticky below header)

- **Draft badge:** "Draft Preview" pill/label
- **Last saved timestamp:** "Last saved: Today at 2:14 PM" with clock icon
- **Action buttons (right side):**
  - "Share Link" — secondary button with link icon (generates a shareable preview URL)
  - "Back to Edit" — outlined button with edit icon (returns to create/edit form)
  - "Publish Recipe" — primary action button

---

## Preview Content

Mirrors the Recipe Detail page structure (see `05-recipe-detail.md`) with these additions:

### Hero Section

- Recipe cover image (full rendering)
- Sensory badges overlaid on image (e.g. "Crunchy", "Smooth")
- Recipe title, description, metadata row (prep time, cook time, servings)

### Household Compatibility Grid

- Shows compatibility status per family member in a card grid:
  - **Flagged member:** avatar, name, warning text (e.g. "Contains Dairy")
  - **Safe member:** avatar, name, safe confirmation (e.g. "Safe Match")
- Helps author verify the recipe works for their household before publishing

### Ingredients & Instructions

- Rendered exactly as they would appear in the published view
- All content is non-interactive (read-only)

---

## Key Interactions

- All recipe content is read-only — no editing possible from this view
- "Back to Edit" returns to the create/edit form with all data preserved
- "Publish Recipe" transitions the recipe from draft to published state
- "Share Link" generates/copies a preview URL that others can view (without editing capability)
- Navigation links in the header are visually dimmed to indicate preview mode context
- A visible border/frame around the viewport reinforces that this is not the live published view
