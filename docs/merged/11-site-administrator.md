# Site Administrator

> Route: `/admin/*`
>
> Current status: **Not implemented**

## Purpose

Provide site-level administration capabilities for curating the ingredient database, managing users, and maintaining data quality. Admin access is restricted to users flagged as administrators in the database **and** authenticated via a Cloudflare Access admin group (defence in depth).

The primary near-term use case is managing the **canonical ingredient database** — the structured metadata layer that powers allergen detection, dietary compatibility checking, and the plant-variety colour tracker.

---

## Admin Role Model

### Access Control

- **Two-layer authorisation:**
  1. **Cloudflare Access group** — a dedicated admin group in Cloudflare Access; requests without a matching group claim are rejected before reaching application code
  2. **Database flag** — `users.is_admin` boolean column; application code checks this after CF Access passes
- Both layers must pass for admin access to be granted
- **Promotion:** only an existing admin can flag another user as admin
- **Demotion:** an admin can remove admin status from another admin (but not themselves, to prevent lockout)

### Admin Navigation

- A subtle "Admin" link appears in the site header/nav for admin users only
- Links to `/admin` dashboard
- Non-admin users who navigate to `/admin/*` routes see a 403 page

---

## Admin Layout

- Standard app header with navigation (same as rest of site)
- Admin sidebar navigation on desktop, collapsible on mobile
- Sidebar sections:
  - **Ingredients** — canonical ingredient database
  - **Users** — user management (future)
  - **Reports** — data quality dashboards (future)

---

## Ingredient Database (`/admin/ingredients`)

### Purpose

Maintain a canonical list of ingredients with structured metadata. Recipes use free-text ingredient names; admins map these to canonical entries over time. This hybrid approach means:

- Recipes can always be created with any ingredient text
- Canonical entries enrich ingredients with allergen flags, food groups, plant colours, and aliases
- Compatibility checking uses canonical data when a mapping exists, falls back to free-text matching otherwise
- Over time, unmapped ingredients are surfaced to admins for curation

### Canonical Ingredient Properties

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `name` | string | Canonical display name (e.g. "Aubergine") |
| `food_group` | enum | Category: `dairy`, `meat`, `poultry`, `fish`, `shellfish`, `grain`, `fruit`, `vegetable`, `herb`, `spice`, `legume`, `nut`, `seed`, `oil`, `condiment`, `sweetener`, `other` |
| `allergens` | string[] | Allergen flags from standard set (see below) |
| `plant_colour` | enum \| null | For plant products only: `red`, `orange`, `yellow`, `green`, `blue-purple`, `white-brown`. Null for non-plant ingredients |
| `aliases` | string[] | Alternative names (e.g. "eggplant", "brinjal" for Aubergine) used for fuzzy matching |
| `description` | string \| null | Optional notes for admin reference |
| `created_at` | timestamp | Auto-set |
| `updated_at` | timestamp | Auto-set |

### Standard Allergen Set

The allergen flags are drawn from the UK Food Standards Agency's 14 major allergens plus buckwheat (a common cross-reactive allergen):

| Allergen | Key |
|----------|-----|
| Celery | `celery` |
| Cereals containing gluten | `gluten` |
| Crustaceans | `crustaceans` |
| Eggs | `eggs` |
| Fish | `fish` |
| Lupin | `lupin` |
| Milk (dairy) | `dairy` |
| Molluscs | `molluscs` |
| Mustard | `mustard` |
| Tree nuts | `tree-nuts` |
| Peanuts | `peanuts` |
| Sesame | `sesame` |
| Soybeans | `soya` |
| Sulphur dioxide / sulphites | `sulphites` |
| Buckwheat | `buckwheat` |

The standard allergen set is defined as a **fixed enum in code**, not in the database. These values rarely change (they follow food-safety regulations). Adding a new standard allergen requires a code change.

#### Interaction with Profile Allergens

Household member profiles store allergies as free-text ingredient names (e.g. "peanuts", "dairy", "wheat") with a severity level. The compatibility checker matches profile allergens against recipe ingredients using two strategies:

1. **Canonical allergen flags** — if a profile allergy text matches a standard allergen key (e.g. "dairy"), any canonical ingredient tagged with that allergen flag is flagged as incompatible
2. **Ingredient name/alias matching** — if a profile allergy text matches a canonical ingredient name or alias (e.g. "peanuts" matches the "Peanut" ingredient), that ingredient and its allergen flags are used for compatibility
3. **Free-text fallback** — if no canonical match exists, the current substring matching continues to work

The profile allergen input should offer **autocomplete suggestions** from the standard allergen set and canonical ingredient names, but always allow custom free-text values for edge cases not yet in the database.

### Plant Colour Categories

Used to track the "30 plants per week in as many colours as possible" goal:

| Colour | Examples |
|--------|----------|
| Red | Tomato, red pepper, strawberry, raspberry, red onion |
| Orange | Carrot, sweet potato, orange, butternut squash, apricot |
| Yellow | Sweetcorn, yellow pepper, banana, lemon, pineapple |
| Green | Broccoli, spinach, peas, courgette, kiwi, avocado |
| Blue/Purple | Aubergine, blueberry, beetroot, red cabbage, plum |
| White/Brown | Mushroom, cauliflower, garlic, onion, potato, ginger |

---

### Ingredient List View (`/admin/ingredients`)

#### Layout

- Page title: "Ingredient Database"
- Stats bar: total ingredients, unmapped recipe ingredients count, recently added
- Search + filter toolbar
- Paginated table of canonical ingredients

#### Toolbar

- **Search:** text input filtering by name or aliases
- **Food group filter:** dropdown/multi-select of food group values
- **Allergen filter:** multi-select of allergen flags
- **Plant colour filter:** colour category chips
- **Sort:** name (A-Z, Z-A), recently updated, food group

#### Table Columns

| Column | Content |
|--------|---------|
| Name | Canonical name with alias count badge |
| Food Group | Badge with group name |
| Allergens | Allergen flag badges (coloured) |
| Plant Colour | Colour dot indicator (for plant groups only) |
| Mapped Recipes | Count of recipes using this ingredient |
| Actions | Edit, Delete |

#### Bulk Actions

- **Import:** CSV upload for seeding the database (name, food_group, allergens, plant_colour, aliases)
- **Export:** CSV download of current database

---

### Ingredient Create/Edit (`/admin/ingredients/new`, `/admin/ingredients/[id]/edit`)

#### Form Fields

- **Name** — text input, required, unique
- **Food group** — select dropdown, required
- **Allergens** — multi-select checkboxes from the standard allergen set
- **Plant colour** — radio buttons (only enabled when food_group is a plant type: `fruit`, `vegetable`, `herb`, `spice`, `legume`)
- **Aliases** — tag input (add/remove alternative names)
- **Description** — optional textarea

#### Validation

- Name must be unique (case-insensitive)
- At least one food group must be selected
- Plant colour is required when food group is a plant type
- Plant colour must be null when food group is not a plant type

---

### Unmapped Ingredients View (`/admin/ingredients/unmapped`)

#### Purpose

Surface free-text ingredient names from recipes that don't yet match any canonical ingredient (by name or alias). This helps admins prioritise curation.

#### Layout

- Table of unique unmapped ingredient names
- Count of recipes using each
- Quick actions:
  - **Create** — pre-fills a new canonical ingredient form with the name
  - **Map** — opens a picker to map to an existing canonical ingredient (adds as alias)
  - **Ignore** — marks as intentionally unmapped (e.g. "a pinch of love")

---

## Inline Admin Affordances

For authenticated admin users, contextual edit capabilities appear throughout the regular site:

### Recipe Detail Page

- Ingredient list items show a small link/icon next to unmapped ingredients
- Clicking opens a quick-map modal: search canonical ingredients or create new
- Mapped ingredients show their canonical metadata (allergen badges, colour dot)

### Browse Recipes

- Admin users see an "Unmapped ingredients" badge on recipe cards that have ingredients without canonical mappings

---

## Future Admin Sections (out of scope for now)

- **User management** — view users, promote/demote admins, disable accounts
- **Recipe moderation** — review public recipes, flag inappropriate content
- **Data quality reports** — ingredient coverage stats, allergen completeness, orphaned data
- **Shopping list categories** — manage how ingredients are grouped in shopping lists
- **Site settings** — global configuration (e.g. default servings, supported locales)
