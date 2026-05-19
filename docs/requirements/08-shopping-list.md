# Shopping List

> Route: `/shopping`
>
> Current status: **Not started** — entirely new feature.

## Purpose

Display a consolidated, categorised grocery list generated from the weekly meal plan. Support checking off items while shopping, adjusting quantities, applying allergen-safe swaps, filtering by household member, and switching between list and aisle views.

---

## Layout

- Standard app header with navigation
- Sticky utility bar below header
- Two-panel layout on desktop: sidebar (left) + item list (right)
- Stacks on mobile: utility bar → filters (collapsible) → list
- Bottom nav bar on mobile
- Floating action button (mobile)

---

## Utility Bar (sticky)

### Left Side

- "Shopping List" heading
- Week label (e.g. "For week of 12 – 18 June")
- Total item count badge (e.g. "42 items")

### Right Side

- View toggle: "List" | "Aisle"
- "+ Add Item" button for manual, non-recipe items
- "Share" button
- "Print" button

---

## Floating Action Buttons

- **Quick-add FAB:** fixed bottom-right, above the bottom nav, with a plus icon that opens a quick-add input for manual items
- **Checkout FAB (aisle view):** fixed bottom-right, above the bottom nav, with a cart/checkout icon that proceeds to checkout or a sharing/completion flow

---

## Left Sidebar: Filters, Progress, and Preferences

### Progress Widget

- Circular/donut progress indicator showing completion percentage
- Large percentage number in the centre
- Subtitle: "X of Y items collected"

### Household Member Filter

- "Household" heading
- Pill-shaped member buttons:
  - "Everyone" (default, active)
  - Individual members with avatar + name + dietary note
- Selecting a member filters the list to show only items relevant to their recipes

### Smart Filters

- "Exclude Allergens" — hides items that conflict with allergies
- "Hide Disliked" — hides ingredients on dislikes lists
- "Show Safe Swaps" — shows alternative ingredient suggestions inline

### Shopping Preferences

Accessible from shopping list settings or `/shopping/preferences`.

- **Prioritize needs for:** family member rows with avatar or initial, name, dietary note, and a toggle to apply or ignore that member's needs
- **Global substitutions:** toggle-based rules such as "Prioritize Organic" and "Store Brand Preferred"
- **Current summary:** active rule checklist plus an "Apply to Next List" action
- **Saved allergy profile:** warning-styled card with allergen pill tags and a note that profiles sync from Health Kit
- **Kitchen tip cards:** rounded visual cards with ingredient-swap advice

### Tip of the Week / Kitchen Tip (desktop only)

- Decorative card with a brief shopping or cooking tip
- Visual treatment may use a rounded image card with gradient overlay text

---

## Main Area: List View (default)

### Category Sections

Items are grouped into collapsible grocery categories.

#### Section Header

- Category icon + name + item count
- Categories include examples such as Produce, Dairy & Alternatives, and Pantry
- Sections with allergen alerts have a distinct header indicator or treatment

#### Item Row

- Large accessible checkbox to mark an item as collected
- Bold item name
- Recipe source tags below the name, shown as pills like `For: [Recipe Name]`; multiple tags may appear
- Quantity display with amount + unit (e.g. "6 units", "2 bags", "500g")
- Quantity stepper with minus/plus controls for adjusting amounts

#### Allergen Alert Item

Items conflicting with a household allergy show:

- Warning icon or alert badge next to the item name
- Highlighted row background
- Inline safe-swap suggestion with replacement ingredient
- "Apply" action to accept the swap in place

### Checked Items Section

- Collapsible container at the bottom labelled "Checked Items (N)"
- Expanded state shows collected items with filled checkbox, strikethrough name, and reduced opacity
- "Clear checked" action removes collected items from the list

---

## Main Area: Aisle View (alternative)

Switched via the utility bar view toggle. This mode organises items by store aisle/category with a card-based layout.

### Aisle Navigation Tabs

- Horizontal, scrollable pill-shaped aisle tabs
- Active tab uses a filled container treatment; inactive tabs use surface styling
- Selecting a tab filters the visible category immediately

### Quick Add Panel

- Rounded "Quick Add" card with a short description
- Text input with inline add button
- Quick-add suggestion chips for common staples such as milk, bread, eggs, and butter
- Decorative inspiration image card below on desktop only

### Category Checklist

- Category heading with remaining item count
- Progress bar showing completion for the current aisle/category

### Item Cards Grid

- Responsive card grid: 3 columns desktop, 2 tablet, 1 mobile
- Unchecked cards show icon, item name, quantity/detail, and an empty circular checkbox
- Checked cards use reduced opacity, confirmed styling, strikethrough text, and a filled check control

### Picky Eater Tip

- Highlighted callout card below the grid
- Lightbulb icon, "Picky Eater Tip" heading, and brief advice text

---

## Empty State

When no meals are planned for the current week:

- Friendly illustrated empty state with soft gradient blobs and a rounded illustration container
- Heading: "Your basket is waiting"
- Body: "It looks like you haven't planned any meals for the week yet. Let's find something your little one will love."
- Primary CTA: "Go to Meal Planner" with icon, linking to `/planner`

### Syncing / Loading Overlay

When the shopping list is being generated from the meal plan, show a full-screen overlay with:

- Blurred, high-opacity backdrop
- Centred card containing:
  - Circular spinner/progress indicator with sync icon
  - Heading: "Gathering your ingredients..."
  - Description: "We're double-checking your meal plan for allergies and dietary needs."
  - Horizontal progress bar
  - Status text: "Almost ready to shop!"

---

## Mobile Experience

- Filters collapse into a horizontal scrollable chip bar
- Household member filter becomes a horizontal pill row
- Bottom nav uses 4 tabs: Kitchen, Recipes, List (active), Progress
- Floating quick-add FAB uses a plus icon and sits bottom-right above the bottom nav
- Swipe-right on an item marks it as collected
- View toggle remains in the utility bar

---

## Key Interactions

- Checkbox toggle marks items collected, moves them to "Checked Items", and updates progress in real time
- Quantity stepper adjusts amounts, including fractional and unit values
- Safe swap apply action replaces flagged ingredients inline
- Add-item actions open quick-add or inline manual item entry
- Member filter shows only items for the selected household member
- Smart filters immediately show or hide matching items
- View toggle switches between list and aisle modes while preserving checked state
- Share generates a shareable link or opens the system share sheet
- Print opens a print-optimised view respecting current filters
- Category sections can collapse or expand
- Clear checked removes collected items with confirmation
- The list auto-refreshes if the meal plan changes while the shopping list is open
- The syncing overlay appears automatically while the list is being generated and dismisses once generation completes
