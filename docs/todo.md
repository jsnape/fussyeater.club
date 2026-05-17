# Outstanding & Deferred Features

Items identified across feature specs, design docs, and merged specs that are not yet implemented. Grouped by feature area.

---

## Recipe Create & Edit

| Item | Source |
|------|--------|
| Recipe editing (load existing, populate form, PUT/PATCH update) | `features/new-recipe.md`, `merged/07-create-edit-recipe.md` |
| Recipe deletion | `features/new-recipe.md` |
| Recipe duplication / clone | `features/new-recipe.md` |
| Draft / auto-save / publish distinction | `features/new-recipe.md`, `merged/07-create-edit-recipe.md` |
| Image upload (currently URL-only) | `features/new-recipe.md` |
| Markdown rendering for method steps and description | `features/new-recipe.md` |
| Markdown editing toolbar | `features/new-recipe.md` |
| Recipe-link preparation type for ingredients (text-only in MVP) | `features/new-recipe.md` |
| Ingredient autocomplete from known-ingredients list | `merged/07-create-edit-recipe.md` |
| Compatibility preview panel (shows family member warnings while editing) | `merged/07-create-edit-recipe.md` |
| Drag-and-drop reordering for ingredients | `features/new-recipe.md`, `ideas.md` |
| Drag-and-drop reordering for method steps | `features/new-recipe.md`, `ideas.md` |
| Inline editing of individual ingredients (click to edit in-place) | `ideas.md` |
| Section-by-section PATCH saves (save individual recipe sections independently) | `ideas.md` |
| Bulk recipe import | `features/new-recipe.md` |

## Recipe Detail Page

| Item | Source |
|------|--------|
| Serving size adjuster (recalculate quantities) | `merged/06-recipe-detail.md` |
| Allergen highlighting on ingredients | `merged/06-recipe-detail.md` |
| Ingredient swap suggestions (for dietary issues) | `merged/06-recipe-detail.md` |
| "Add to shopping list" button from recipe detail | `merged/06-recipe-detail.md` |
| Per-step images | `merged/06-recipe-detail.md` |
| Nutrition summary panel (per-serving nutritional info) | `merged/06-recipe-detail.md` |
| Dietary compatibility badge (requires profile data + calculation logic) | `merged/06-recipe-detail.md` |

## Recipe Components (Phased Refactor)

| Item | Source |
|------|--------|
| Phase 1 — Extract shared components (no behaviour change) | `designs/recipe-components.md` |
| Phase 2 — Add in-place editing to detail page | `designs/recipe-components.md` |
| Phase 3 — Unify create and edit into shared component structure | `designs/recipe-components.md` |

## Browse & Search Recipes

| Item | Source |
|------|--------|
| Filter chips (dietary, cuisine, etc.) | `merged/05-browse-recipes.md` |
| Dietary filtering (safe for member X) | `merged/05-browse-recipes.md` |
| Sort options (newest, rating, etc.) | `merged/05-browse-recipes.md` |

## Ingredient & Nutrition Ontology

| Item | Source |
|------|--------|
| Formal ingredient ontology for normalisation | `features/recipes.md`, `features/recipe-detail.md` |
| Calculated nutrition from ontology-backed data | `features/recipe-detail.md` |

## Household & Profiles

| Item | Source |
|------|--------|
| Edit member roles | `features/household.md` |
| Remove members from household | `features/household.md` |
| Audit timeline UI (beyond basic invite timestamps) | `features/household.md` |
| Multi-household membership support | `features/household.md` |
| Role editing and seat limits | `merged/04-household-profiles.md` |
| Seat-based plan limits (future monetisation hook) | `merged/00-overview.md` |

## Authentication & Account

| Item | Source |
|------|--------|
| GitHub OAuth provider (disabled for launch) | `features/registration.md` |
| Future OAuth providers / invite-code flows | `merged/02-login.md` |
| Passwordless magic link sign-in | `features/password-reset.md` |
| Multi-factor verification during password reset | `features/password-reset.md` |
| Admin-triggered password resets | `features/password-reset.md` |
| Custom branded email editor / localisation | `features/password-reset.md` |
| Worker `waitUntil` for deferred auth background tasks | `features/registration.md` |

## Account Settings

| Item | Source |
|------|--------|
| Notification delivery method selector (email, push, or both) | `merged/10-account-settings.md` |

## Landing Page

| Item | Source |
|------|--------|
| Sample recipe gallery section | `merged/01-landing-page.md` |
| Testimonials section | `merged/01-landing-page.md` |
| Site-wide footer component | `merged/01-landing-page.md` |

## Shopping List

| Item | Source |
|------|--------|
| Aisle-view grouping (store-specific aisle mapping) | `stitch/11-shopping-aisle-view.md` |
| Preference-based list filtering | `stitch/10-list-preferences.md` |

## Store Cupboard

| Item | Source |
|------|--------|
| Store cupboard page (`/store-cupboard`) — listed in site structure but not implemented | `features/site-structure.md` |

## Meal Planner

| Item | Source |
|------|--------|
| Empty cell dashed-border placeholder styling | `merged/08-meal-planner.md` |

## Site Administration

| Item | Source |
|------|--------|
| User management panel | `merged/11-site-administrator.md` |
| Data quality dashboards / reports | `merged/11-site-administrator.md` |

---

_Compiled from docs/features/, docs/merged/, docs/designs/, docs/stitch/, and docs/ideas.md._
