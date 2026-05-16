# Shopping List — Aisle View

> Route: `/shopping` (alternative view mode)

## Purpose

An alternative shopping list view organised by store aisle/category with a card-based layout. Allows checking items by visual cards rather than a text list. Includes a "Quick Add" panel for manual items.

---

## Layout

- Standard app header with navigation (filter + account)
- Horizontal scrollable aisle tabs (top)
- Two-column layout: Quick Add panel (left, 3-4 cols) + checklist grid (right, 8-9 cols)
- Bottom nav bar (mobile)
- Floating action button (FAB)

---

## Aisle Navigation Tabs (horizontal scroll)

- Row of pill-shaped category buttons:
  - Active tab: filled container style (e.g. "Dairy & Eggs" with filled icon)
  - Inactive tabs: surface container style (e.g. "Bakery", "Produce", "Frozen")
- Selecting a tab filters the main content to show only that category

---

## Left Panel: Quick Add

### Quick Add Card

- Rounded card with heading "Quick Add"
- Description: "Forgot something? Add staples to your list instantly."
- **Text input** with inline add button (plus icon, right side)
- **Quick-add suggestion chips** below input:
  - Pre-defined common items as pill buttons (e.g. "+ Milk", "+ Bread", "+ Eggs", "+ Butter")
  - Clicking a chip immediately adds that item to the list

### Inspiration Image (below, desktop only)

- Decorative rounded image card with gradient overlay text

---

## Right Panel: Aisle Checklist

### Category Header

- Category name heading + item count remaining (e.g. "Dairy & Eggs (4 items left)")
- Progress bar showing completion (fraction filled)

### Item Cards Grid

- Responsive grid (3 columns desktop, 2 tablet, 1 mobile)
- Each item card:
  - **Unchecked state:**
    - Rounded card with subtle border
    - Left: icon in coloured rounded square container
    - Centre: item name (bold) + quantity/detail (small text below)
    - Right: empty circular checkbox (outline only)
    - Hover: border highlight + revealed checkmark
  - **Checked state:**
    - Reduced opacity + filled container border
    - Icon container filled with confirmation colour
    - Item name with strike-through
    - Circular checkbox filled with checkmark

### Picky Eater Tip (below grid)

- Highlighted callout card with lightbulb icon
- "Picky Eater Tip" heading + advice text (e.g. tips about buying full-fat dairy)

---

## Floating Action Button (FAB)

- Fixed bottom-right, above bottom nav
- Cart/checkout icon — navigates to checkout or marks list complete

---

## Mobile Bottom Navigation

- Same 4-tab bar: Kitchen, Recipes, List (active), Progress

---

## Key Interactions

- **Aisle tabs:** switch the visible category; grid updates immediately
- **Item card click:** toggles checked/unchecked state
- **Quick add input:** type + click add button to add custom item to current category
- **Quick add chips:** single-tap to add common staple items
- **Progress bar:** updates in real-time as items are checked
- **FAB:** proceeds to checkout or sharing workflow
