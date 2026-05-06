---
status: draft
---

# Recipe Component Decomposition

Break the monolithic recipe pages into focused, reusable components that support both view and edit modes. This enables in-place editing on the recipe detail page without a separate edit route.

## Problem

| Page                     | Lines | Concern                                                       |
| ------------------------ | ----- | ------------------------------------------------------------- |
| `/recipes` (list)        | ~209  | Search, cards, pagination all inline                          |
| `/recipes/[id]` (detail) | ~250  | Hero, metadata, ingredients, method, source, notes — one file |
| `/recipes/new` (create)  | ~669  | All form sections plus submission logic in one component      |

The detail and create pages share the same logical sections (ingredients, method, tags, etc.) but duplicate the markup in view vs form layouts. Adding in-place editing would triple the duplication.

## Design Principle: `mode` Prop

Every dual-purpose component accepts a `mode: 'view' | 'edit'` prop.

- **`view`** renders read-only presentation (text, badges, links).
- **`edit`** renders bound form controls (inputs, textareas, add/remove actions).

The parent page owns all state and passes it down. Components never fetch data or call APIs directly. This keeps the data flow unidirectional and testable.

```
┌─────────────────────────────┐
│   /recipes/[id] (page)      │  owns recipe state + edit toggle
│                             │
│  ┌───────────────────────┐  │
│  │ RecipeHero             │  │  mode="view" | "edit"
│  ├───────────────────────┤  │
│  │ RecipeMetadata         │  │  mode="view" | "edit"
│  ├───────────────────────┤  │
│  │ RecipeIngredients      │  │  mode="view" | "edit"
│  ├───────────────────────┤  │
│  │ RecipeMethodOrSource    │  │  mode="view" | "edit"
│  │  (type toggle + method  │  │  owns full ↔ reference switch
│  │   steps OR source ref)  │  │
│  ├───────────────────────┤  │
│  │ RecipeNotes            │  │  mode="view" | "edit"
│  ├───────────────────────┤  │
│  │ RecipeTags             │  │  mode="view" | "edit"
│  └───────────────────────┘  │
└─────────────────────────────┘
```

## Component Inventory

### Detail-page components (view + edit)

All live under `src/lib/components/recipe/`.

| Component              | View renders                                       | Edit renders                                                         | Key props                                                 |
| ---------------------- | -------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| `RecipeHero`           | Hero image with fallback                           | Image URL input + live preview                                       | `mode`, `imageUrl`, `title`                               |
| `RecipeBasicInfo`      | Title (h1) + description prose                     | Title input + description textarea                                   | `mode`, `title`, `description`                            |
| `RecipeMetadata`       | Timings, servings, yield in a row                  | Number/text inputs in a grid                                         | `mode`, `prepMinutes`, `cookMinutes`, `servings`, `yield` |
| `RecipeTags`           | Badge list                                         | Tag input with add/remove chips                                      | `mode`, `tags`                                            |
| `RecipeIngredients`    | Grouped bullet list                                | Add/remove form with draft row                                       | `mode`, `ingredients`                                     |
| `RecipeMethodOrSource` | Method steps (full) or source citation (reference) | Type toggle + method form or source form; clears the other on switch | `mode`, `recipeType`, `steps`, `sourceReference`          |
| `RecipeNotes`          | Prose block                                        | Textarea                                                             | `mode`, `notes`                                           |
| `RecipeVisibility`     | Badge (public/private)                             | Radio toggle                                                         | `mode`, `visibility`                                      |

### List-page components (view only)

| Component          | Purpose                                        | Key props                            |
| ------------------ | ---------------------------------------------- | ------------------------------------ |
| `RecipeSearchBar`  | Search form with query input                   | `query`, `onSearch`                  |
| `RecipeCard`       | Card with image, title, snippet, tags, timings | `recipe` (list item shape)           |
| `RecipePagination` | Previous/next with page indicator              | `page`, `totalPages`, `onPageChange` |

### Shared

| Component          | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `RecipeErrorState` | Centred error/empty message with CTA button |

## Prop Pattern

Components use Svelte 5 `$props()` with `$bindable()` for edit-mode fields.

```svelte
<!-- RecipeBasicInfo.svelte (sketch) -->
<script lang="ts">
    import { Input, Textarea } from 'flowbite-svelte';

    let {
        mode,
        title = $bindable(),
        description = $bindable()
    }: {
        mode: 'view' | 'edit';
        title: string;
        description: string;
    } = $props();
</script>

{#if mode === 'edit'}
    <Input bind:value={title} placeholder="Recipe title" />
    <Textarea bind:value={description} placeholder="A short description" rows={3} />
{:else}
    <h1 class="text-3xl font-bold text-primary-900">{title}</h1>
    {#if description}
        <p class="mt-4 text-primary-700">{description}</p>
    {/if}
{/if}
```

### RecipeMethodOrSource — combined component

The recipe type (full vs reference) determines whether the user fills in method steps or a source reference. These are mutually exclusive and switching between them clears the other's data, so they belong in one component.

**View mode** — renders the appropriate section based on `recipeType`:

- `full` → numbered method step list
- `reference` → source link/book citation card

**Edit mode** — shows a radio toggle (`full` ↔ `reference`) at the top, then renders the matching form below. Switching type clears the other section's data (existing behaviour from `/recipes/new`).

```svelte
<!-- RecipeMethodOrSource.svelte (sketch) -->
<script lang="ts">
    import type { RecipeSourceReference } from '$lib/api-types';

    let {
        mode,
        recipeType = $bindable(),
        steps = $bindable(),
        sourceReference = $bindable()
    }: {
        mode: 'view' | 'edit';
        recipeType: 'full' | 'reference';
        steps: string[];
        sourceReference: RecipeSourceReference | null;
    } = $props();

    // Clear the other section when type changes (edit mode only)
    let previousType = $state(recipeType);
    $effect(() => {
        if (mode !== 'edit' || recipeType === previousType) return;
        if (recipeType === 'full') {
            sourceReference = null;
        } else {
            steps = [];
        }
        previousType = recipeType;
    });
</script>

{#if mode === 'edit'}
    <!-- radio toggle: full ↔ reference -->
    <!-- then: method step form OR source reference form -->
{:else if recipeType === 'full' && steps.length > 0}
    <!-- numbered step list -->
{:else if recipeType === 'reference' && sourceReference}
    <!-- source citation card -->
{/if}
```

The parent page controls the mode and holds all state:

```svelte
<!-- /recipes/[id]/+page.svelte (sketch) -->
<script lang="ts">
    let editing = $state(false);
    let title = $state(data.recipe.title);
    let description = $state(data.recipe.description);
    let recipeType = $state(data.recipe.type);
    let steps = $state(data.recipe.method ?? []);
    let sourceReference = $state(data.recipe.sourceReference ?? null);
</script>

<RecipeBasicInfo mode={editing ? 'edit' : 'view'} bind:title bind:description />
<RecipeMethodOrSource
    mode={editing ? 'edit' : 'view'}
    bind:recipeType
    bind:steps
    bind:sourceReference
/>
```

## State Management for In-Place Edit

When the user clicks "Edit" on the detail page:

1. Page copies `data.recipe` fields into local `$state` variables (the edit draft).
2. All child components switch to `mode="edit"` and bind to the draft state.
3. On "Save", the page submits a PATCH request and reloads data.
4. On "Cancel", the page discards the draft state and reverts to `mode="view"`.

This means:

- **View mode** can read directly from `data.recipe` (no local state copy needed).
- **Edit mode** reads/writes local `$state` copies so changes are discardable.
- The page is the only component that calls the API.

## Migration Strategy

### Phase 1 — Extract components (no behaviour change)

Pull markup out of the existing pages into the component files. All components start as `mode="view"` for the detail page and `mode="edit"` for the create page. No edit-in-place yet.

Affected pages:

- `/recipes/[id]/+page.svelte` — use view-mode components
- `/recipes/new/+page.svelte` — use edit-mode components
- `/recipes/+page.svelte` — extract `RecipeCard`, `RecipeSearchBar`, `RecipePagination`

### Phase 2 — Add in-place editing to detail page

- Add an "Edit" button to the detail page (owner/household members only).
- Toggle `mode` on all child components.
- Wire up PATCH endpoint and save/cancel flow.

### Phase 3 — Unify create and edit

- `/recipes/new` becomes a thin wrapper that renders the same components in edit mode with empty initial state.
- The PATCH (edit) and POST (create) logic differs only in the API call; the form UI is identical.

## File Structure After Phase 1

```
src/lib/components/recipe/
├── RecipeHero.svelte
├── RecipeBasicInfo.svelte
├── RecipeMetadata.svelte
├── RecipeTags.svelte
├── RecipeIngredients.svelte
├── RecipeMethodOrSource.svelte
├── RecipeNotes.svelte
├── RecipeVisibility.svelte
├── RecipeCard.svelte
├── RecipeSearchBar.svelte
├── RecipePagination.svelte
└── RecipeErrorState.svelte
```

## Confirmed Decisions

1. **Granularity** — Keep `RecipeHero` and `RecipeBasicInfo` as separate components.
2. **Ingredient editing UX** — Add/remove pattern for now. Inline editing and drag-and-drop reordering deferred (see `/docs/ideas.md`).
3. **Method step reordering** — Add/remove first. Drag-and-drop deferred (see `/docs/ideas.md`).
4. **Save granularity** — Whole recipe via single PATCH. Section-by-section saves deferred (see `/docs/ideas.md`).
