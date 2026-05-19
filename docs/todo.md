# Outstanding & Deferred Features

Items identified across feature specs, design docs, and merged specs that are not yet implemented. Grouped by feature area.

---

## Recipe Create & Edit

| Item | Source |
|------|--------|
| Recipe editing (load existing, populate form, PUT/PATCH update) | `requirements/06-create-edit-recipe.md` |
| Recipe deletion | `requirements/06-create-edit-recipe.md` |
| Recipe duplication / clone | `requirements/06-create-edit-recipe.md` |
| Draft / auto-save / publish distinction | `requirements/06-create-edit-recipe.md` |
| Image upload (currently URL-only) | `requirements/06-create-edit-recipe.md` |
| Markdown rendering for method steps and description | `requirements/06-create-edit-recipe.md` |
| Markdown editing toolbar | `requirements/06-create-edit-recipe.md` |
| Recipe-link preparation type for ingredients (text-only in MVP) | `requirements/06-create-edit-recipe.md` |
| Ingredient autocomplete from known-ingredients list | `requirements/06-create-edit-recipe.md` |
| Compatibility preview panel (shows family member warnings while editing) | `requirements/06-create-edit-recipe.md` |
| Drag-and-drop reordering for ingredients | `requirements/06-create-edit-recipe.md`, `ideas.md` |
| Drag-and-drop reordering for method steps | `requirements/06-create-edit-recipe.md`, `ideas.md` |
| Inline editing of individual ingredients (click to edit in-place) | `ideas.md` |
| Section-by-section PATCH saves (save individual recipe sections independently) | `ideas.md` |
| Bulk recipe import | `requirements/06-create-edit-recipe.md` |

## Recipe Detail Page

| Item | Source |
|------|--------|
| Serving size adjuster (recalculate quantities) | `requirements/05-recipe-detail.md` |
| Allergen highlighting on ingredients | `requirements/05-recipe-detail.md` |
| Ingredient swap suggestions (for dietary issues) | `requirements/05-recipe-detail.md` |
| "Add to shopping list" button from recipe detail | `requirements/05-recipe-detail.md` |
| Per-step images | `requirements/05-recipe-detail.md` |
| Nutrition summary panel (per-serving nutritional info) | `requirements/05-recipe-detail.md` |
| Dietary compatibility badge (requires profile data + calculation logic) | `requirements/05-recipe-detail.md` |

## Recipe Components (Phased Refactor)

| Item | Source |
|------|--------|
| Phase 1 — Extract shared components (no behaviour change) | `designs/recipe-components.md` |
| Phase 2 — Add in-place editing to detail page | `designs/recipe-components.md` |
| Phase 3 — Unify create and edit into shared component structure | `designs/recipe-components.md` |

## Browse & Search Recipes

| Item | Source |
|------|--------|
| Filter chips (dietary, cuisine, etc.) | `requirements/04-browse-recipes.md` |
| Dietary filtering (safe for member X) | `requirements/04-browse-recipes.md` |
| Sort options (newest, rating, etc.) | `requirements/04-browse-recipes.md` |

## Ingredient & Nutrition Ontology

| Item | Source |
|------|--------|
| Formal ingredient ontology for normalisation | `requirements/04-browse-recipes.md`, `requirements/05-recipe-detail.md` |
| Calculated nutrition from ontology-backed data | `requirements/05-recipe-detail.md` |

## Household & Profiles

| Item | Source |
|------|--------|
| Edit member roles | `requirements/03-household-profiles.md` |
| Remove members from household | `requirements/03-household-profiles.md` |
| Audit timeline UI (beyond basic invite timestamps) | `requirements/03-household-profiles.md` |
| Multi-household membership support | `requirements/03-household-profiles.md` |
| Role editing and seat limits | `requirements/03-household-profiles.md` |
| Seat-based plan limits (future monetisation hook) | `requirements/00-overview.md` |

## Authentication & Account

| Item | Source |
|------|--------|
| GitHub OAuth provider (disabled for launch) | `requirements/02-authentication.md` |
| Future OAuth providers / invite-code flows | `requirements/02-authentication.md` |
| Passwordless magic link sign-in | `requirements/02-authentication.md` |
| Multi-factor verification during password reset | `requirements/02-authentication.md` |
| Admin-triggered password resets | `requirements/02-authentication.md` |
| Custom branded email editor / localisation | `requirements/02-authentication.md` |
| Worker `waitUntil` for deferred auth background tasks | `requirements/02-authentication.md` |

## Account Settings

| Item | Source |
|------|--------|
| Notification delivery method selector (email, push, or both) | `requirements/09-account-settings.md` |

## Landing Page

| Item | Source |
|------|--------|
| Sample recipe gallery section | `requirements/01-landing-page.md` |
| Testimonials section | `requirements/01-landing-page.md` |
| Site-wide footer component | `requirements/01-landing-page.md` |

## Shopping List

| Item | Source |
|------|--------|
| Aisle-view grouping (store-specific aisle mapping) | `requirements/08-shopping-list.md` |
| Preference-based list filtering | `requirements/08-shopping-list.md` |

## Store Cupboard

| Item | Source |
|------|--------|
| Store cupboard page (`/store-cupboard`) — listed in site structure but not implemented | `requirements/00-overview.md` |

## Meal Planner

| Item | Source |
|------|--------|
| Empty cell dashed-border placeholder styling | `requirements/07-meal-planner.md` |

## Site Administration

| Item | Source |
|------|--------|
| User management panel | `requirements/10-site-administrator.md` |
| Data quality dashboards / reports | `requirements/10-site-administrator.md` |

---

_Compiled from docs/requirements/, docs/designs/, and docs/ideas.md._
