# Recipes Browse

> Route: `/recipes`

## Purpose

Discover and browse recipes filtered by the household's allergy and sensory preferences. Users can search, filter, and add recipes directly to their meal plan.

---

## Layout

- Standard app header with navigation
- Discovery header section (title, search, reassurance panel)
- Two-column layout: filter sidebar (left) + results area (right) on desktop
- On mobile: filters collapse into a toggle/drawer; results stack full-width

---

## Discovery Header

### Title Row

- **Left:** Page title "Discover Recipes" + subtitle about safe, sensory-friendly meals
- **Right:** Search input with magnifying glass icon, placeholder "Search recipes, ingredients..."

### Reassurance Panel

- Highlighted information bar below title row
- Shield icon + "Preference Sync Active" heading
- Description of currently active filters from household profiles (e.g. "Currently hiding recipes with Peanuts and Dairy. Prioritizing Crunchy textures and Kid-Accepted meals for Leo.")
- "Edit Profiles" button linking to household page

---

## Filter Sidebar (sticky on desktop)

Card container with the following filter groups:

### Sort By

- Dropdown select: "Recommended (Profile Sync)", "Highest Rated", "Quickest Prep", "Recently Added"

### Allergens to Exclude

- Checkbox list of allergens
- Profile-driven items are pre-checked and disabled (with indicator showing which profile set them, e.g. "Leo's Profile")
- Additional items available to manually check: Gluten, Eggs, etc.

### Textures

- Horizontal wrap of pill/chip buttons
- Active "include" textures: highlighted style (e.g. "Crunchy")
- Active "exclude" textures: strike-through style (e.g. "Slimy")
- Neutral unselected: default style

### Prep Time

- Radio button list: "Under 15 mins", "Under 30 mins", "Any Time"

### Kid Accepted / Difficulty

- Toggle switch: "Only show High Success Rate"

### Clear All

- "Clear All" text button in the filter header to reset all manual filters

---

## Results Area

### Curated Collections Carousel

- Section heading: "Curated for [member name]"
- Horizontally scrollable row of collection cards
- Each collection card:
  - Cover image with gradient overlay
  - Collection name overlaid at bottom (e.g. "Crispy & Safe", "Hidden Veggies", "10-Minute Snacks")
  - Subtitle below image: recipe count + texture/type descriptor

### Recipe Results Grid

- Heading with total count (e.g. "All Safe Recipes (24)")
- Responsive grid: 3 columns desktop, 2 tablet, 1 mobile
- Each recipe card:
  - **Image area:** recipe photo with hover zoom, favourite/heart button (top right), safety badge overlay (top left, e.g. "Allergy-safe for Leo")
  - **Content area:**
    - Title + star rating badge (top right)
    - Description snippet (2-line clamp)
    - Metadata pills: prep time, texture, success indicator (e.g. "High Success", "Safe Food Match")
    - **Action row** (below divider): "View Details" primary button + "Add to Meal Plan" icon button (calendar icon)

### Load More / Pagination

- "Load More Recipes" button centred below grid (or pagination controls)

---

## Key Interactions

- Search is real-time or on-submit filtering
- Filter changes immediately update the results grid
- Favourite button toggles heart state (filled/unfilled)
- "Add to Meal Plan" opens a picker or adds directly to the current week
- Clicking a recipe card navigates to Recipe Detail page
- Collection cards navigate to a filtered view of that collection
- Reassurance panel "Edit Profiles" navigates to `/household`
