# List Preferences

> Route: `/shopping/preferences` or accessible from shopping list settings

## Purpose

Configure shopping list generation preferences: which family members' dietary needs to prioritise, global substitution rules, and view current allergy profiles. Settings here affect how the shopping list is built from the meal plan.

---

## Layout

- Standard app header with back button + logo + filter/account icons
- Page header
- Two-column layout: settings (left, 7 cols) + summary/status (right, 5 cols)
- Bottom nav bar (mobile)

---

## Page Header

- Title: "List Preferences"
- Description: explains that these settings tailor the weekly shopping list and auto-swap ingredients

---

## Left Column: Settings

### Prioritize Needs For (family members)

- Card with uppercase label heading
- List of family member rows:
  - Each row: avatar (photo or initial) + name + dietary note (e.g. "Gluten-Free Priority", "Nut-Free Ingredients") + toggle switch
  - Toggle ON: this member's needs are actively applied to the shopping list
  - Toggle OFF: member's restrictions are ignored (row shows reduced opacity)

### Global Substitutions

- Card with uppercase label heading
- List of substitution settings:
  - Each setting: icon + label + toggle switch + description text
  - **Prioritize Organic:** "Always select organic options for the 'Dirty Dozen' produce items."
  - **Store Brand Preferred:** "Save on costs by automatically selecting generic equivalents where available."

---

## Right Column: Summary & Status

### Current Summary Card (prominent)

- Visually emphasised container
- Heading: "Current Summary"
- Checklist of active rules (icon + description):
  - e.g. "Lists will be strictly Gluten-Free"
  - e.g. "Nut-based ingredients are Excluded"
  - e.g. "Substitutes will be suggested for 12 items" (informational/italic)
- **"Apply to Next List" button** (full-width primary action)

### Saved Allergy Profile

- Card with warning icon + "SAVED ALLERGY PROFILE" heading
- Pill tags showing active allergens (e.g. "Peanuts", "Tree Nuts", "Wheat (Leo)")
- Note: "Allergy profiles are synced from Health Kit. Tap here to manage."

### Visual Tip Card

- Rounded image card with gradient text overlay
- "Kitchen Tip" label + heading about ingredient swaps + brief description

---

## Mobile Bottom Navigation

- Same 4-tab bar: Kitchen, Recipes, List (active), Progress

---

## Key Interactions

- Family member toggles immediately update the preview summary card
- Global substitution toggles save on change
- "Apply to Next List" regenerates the shopping list with current preferences
- Allergy profile tags link to a health/profile management page
- Back button navigates to the shopping list
