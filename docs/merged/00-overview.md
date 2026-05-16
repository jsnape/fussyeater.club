# Merged Design Specification — Overview

> This specification merges the best elements from the UX Pilot and Stitch design explorations, grounded in the current site implementation.

## Design Philosophy

Combine UX Pilot's **dietary-safety-first data model** (the app's USP) with Stitch's **warm tone, mobile-first navigation, and engagement features**. Every screen should make family mealtime planning feel achievable, not overwhelming.

---

## Visual Design Principles

### Palette

| Token | Colour | Usage |
|-------|--------|-------|
| Primary | Teal `#0D9488` | Brand, interactive elements, CTAs, links |
| Secondary | Coral `#F97316` | Accents, highlights, warm CTAs |
| Accent | Violet `#8B5CF6` | Badges, special indicators |
| Success | Green `#22C55E` | Safe/compatible states |
| Warning | Amber `#F59E0B` | Alerts, compatibility warnings |
| Danger | Red `#EF4444` | Errors, allergen conflicts |
| Surface | Slate `#F8FAFC` | Page background (near-white, cool neutral) |
| Text | Slate `#1E293B` | Primary body text |
| Text Muted | Slate `#64748B` | Secondary/descriptive text |

### Typography

- **Headings:** Quicksand (700 weight, tight line-height 1.2, slight negative letter-spacing)
- **Body:** Nunito Sans (400/500/600 weight, relaxed line-height 1.6)
- **Base size:** 16px; body text uses `text-base`, descriptions use `text-lg`, headings step up aggressively (`text-xl` → `text-5xl`)

### Spacing

- Generous whitespace throughout; prefer `p-6`/`p-8` over `p-2`/`p-3`
- Section spacing: `mt-10`/`mt-12`/`mt-16` between major sections
- Card padding: minimum `p-6`, prefer `p-8` for primary cards
- Grid gaps: `gap-6` standard, `gap-8` for major grids

### Elevation & Borders

- **Prefer shadows over borders** for card separation
- Cards use `shadow-sm` (resting) → `shadow-md` (hover/primary)
- Borders only where structurally needed (inputs, dividers) — use `border-slate-200`
- **Never** nest bordered boxes inside bordered containers
- Neutral shadow tint (black-based, not colour-tinted)

### Border Radius

- Cards: `rounded-2xl`
- Inputs/buttons: `rounded-xl`
- Badges/pills: `rounded-full`
- Smaller UI elements: `rounded-lg`

### Interactions

- Cards: `hover:shadow-md transition-shadow` for lift effect
- Links: `text-primary-600 hover:text-primary-800`
- Buttons: Flowbite `color="primary"` (teal) for primary, `color="light"` for secondary

---

## Pages

| # | Page | Route | Status |
|---|------|-------|--------|
| 01 | [Landing Page](01-landing-page.md) | `/` | Implemented (basic) |
| 02 | [Login](02-login.md) | `/login` | Implemented |
| 03 | [Register](03-register.md) | `/register` | Implemented |
| 04 | [Household & Profiles](04-household-profiles.md) | `/household` | Partially implemented (invites only) |
| 05 | [Browse Recipes](05-browse-recipes.md) | `/recipes` | Implemented (basic) |
| 06 | [Recipe Detail](06-recipe-detail.md) | `/recipes/[id]` | Implemented |
| 07 | [Create / Edit Recipe](07-create-edit-recipe.md) | `/recipes/new`, `/recipes/[id]/edit` | Implemented (create only) |
| 08 | [Meal Planner](08-meal-planner.md) | `/planner` | Not started |
| 09 | [Shopping List](09-shopping-list.md) | `/shopping` | Not started |
| 10 | [Account Settings](10-account-settings.md) | `/account` | Not started |

---

## Navigation Model

- **Desktop:** Sticky top navbar with logo, primary nav links, and user menu (current implementation preserved)
- **Mobile:** Compact top bar + bottom tab bar (4 tabs: Home, Recipes, Planner, Shopping)
- **Signed-out users** see: Landing, Login, Register, public recipe browse
- **Signed-in users** see: Recipes, Planner, Shopping, Household, Account

---

## Cross-Cutting Concerns

### Dietary Profile Data (from UX Pilot)

The household profiles system is the **core differentiator**. Profile data drives:
- Recipe browse filtering (hide incompatible recipes)
- Meal planner safety badges (per-slot compatibility warnings)
- Shopping list allergen alerts + safe swap suggestions
- Per-member filtering on all list views

### Empty States (from Stitch)

Every list/collection view must define an empty state with:
- Friendly illustration or icon
- Explanatory heading
- Clear CTA to populate the view

### Progress & Engagement (from Stitch)

- Weekly meal planning goal with progress indicator
- "Wins" concept — celebrate when fussy eaters try new foods
- Streak or consistency indicators (lightweight, not gamified to excess)

### Household Collaboration (from Stitch)

- Role-based access: Owner, Admin, Member, Viewer
- Invite via access code with expiry
- Seat-based plan limits (future monetisation hook)

### Current Implementation Preserved

- Auth via Cloudflare Access + local sessions
- CSRF protection on mutations
- Idempotent POST handling
- Recipe types: "full" (with method) and "reference" (external link)
- Recipe visibility: private (household) or public
- Existing API contract and DB schema carry forward
