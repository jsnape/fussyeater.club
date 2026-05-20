<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { apiFetch, ApiError } from '$lib/api';
    import { getCookieValue } from '$lib/browser/cookies';
    import type { components } from '$lib/api-types';
    import RecipeHero from '$lib/components/recipe/RecipeHero.svelte';
    import RecipeBasicInfo from '$lib/components/recipe/RecipeBasicInfo.svelte';
    import RecipeMetadata from '$lib/components/recipe/RecipeMetadata.svelte';
    import RecipeTags from '$lib/components/recipe/RecipeTags.svelte';
    import RecipeIngredients from '$lib/components/recipe/RecipeIngredients.svelte';
    import RecipeMethodOrSource from '$lib/components/recipe/RecipeMethodOrSource.svelte';
    import RecipeNotes from '$lib/components/recipe/RecipeNotes.svelte';
    import RecipeVisibility from '$lib/components/recipe/RecipeVisibility.svelte';
    import { untrack } from 'svelte';

    type RecipeDetail = components['schemas']['RecipeDetail'];
    type RecipeIngredientType = components['schemas']['RecipeIngredient'];
    type RecipeSourceReference = components['schemas']['RecipeSourceReference'];

    type Props = {
        mode: 'create' | 'edit';
        recipe?: RecipeDetail;
    };

    let { mode, recipe }: Props = $props();

    // --- Form state (snapshot initial prop values) ---
    let title = $state(untrack(() => recipe?.title ?? ''));
    let description = $state(untrack(() => recipe?.description ?? ''));
    let imageUrl = $state(untrack(() => recipe?.imageUrl ?? ''));
    let recipeType = $state<'full' | 'reference'>(untrack(() => recipe?.type ?? 'full'));
    let visibility = $state<'public' | 'private'>(untrack(() => recipe?.visibility ?? 'private'));
    let servings = $state(untrack(() => recipe?.servings != null ? String(recipe.servings) : ''));
    let yieldText = $state(untrack(() => recipe?.yield ?? ''));
    let prepMinutes = $state(
        untrack(() => recipe?.timings?.prepMinutes != null ? String(recipe.timings.prepMinutes) : '')
    );
    let cookMinutes = $state(
        untrack(() => recipe?.timings?.cookMinutes != null ? String(recipe.timings.cookMinutes) : '')
    );
    let notes = $state(untrack(() => recipe?.notes ?? ''));

    // Ingredients
    let ingredients = $state<RecipeIngredientType[]>(untrack(() => recipe?.ingredients ?? []));

    // Method steps (full recipes)
    let methodSteps = $state<string[]>(untrack(() => recipe?.method ?? []));

    // Source reference (reference recipes)
    const existingSource = untrack(() => recipe?.sourceReference);
    let sourceKind = $state<'url' | 'book'>(untrack(() => existingSource?.kind ?? 'url'));
    let sourceLabel = $state(untrack(() => existingSource?.label ?? ''));
    let sourceUrl = $state(untrack(() => existingSource?.url ?? ''));
    let sourceBookTitle = $state(untrack(() => existingSource?.bookTitle ?? ''));
    let sourcePageNumber = $state(
        untrack(() => existingSource?.pageNumber != null ? String(existingSource.pageNumber) : '')
    );
    let sourceIsbn = $state(untrack(() => existingSource?.isbn ?? ''));

    // Tags
    let tags = $state<string[]>(untrack(() => recipe?.tags ?? []));

    // Submission
    let isSubmitting = $state(false);
    let submitError = $state('');

    // --- Derived state ---
    const isFullRecipe = $derived(recipeType === 'full');
    const isReferenceRecipe = $derived(recipeType === 'reference');

    const sourceReferenceValid = $derived(
        isReferenceRecipe &&
            sourceLabel.trim() !== '' &&
            (sourceKind === 'book' || sourceUrl.trim() !== '')
    );

    const canSubmit = $derived(
        title.trim() !== '' &&
            ingredients.length >= 1 &&
            (isFullRecipe ? methodSteps.length >= 1 : sourceReferenceValid) &&
            !isSubmitting
    );

    const isEdit = $derived(mode === 'edit');

    // --- Build request body ---
    function buildRequestBody(): Record<string, unknown> {
        const body: Record<string, unknown> = {
            title: title.trim(),
            type: recipeType,
            ingredients,
            visibility
        };

        if (description.trim()) body.description = description.trim();
        if (imageUrl.trim()) body.imageUrl = imageUrl.trim();
        const s = parseInt(servings, 10);
        if (!isNaN(s) && s > 0) body.servings = s;
        if (yieldText.trim()) body.yield = yieldText.trim();
        const prep = parseInt(prepMinutes, 10);
        if (!isNaN(prep) && prep >= 0) body.prepMinutes = prep;
        const cook = parseInt(cookMinutes, 10);
        if (!isNaN(cook) && cook >= 0) body.cookMinutes = cook;
        if (notes.trim()) body.notes = notes.trim();
        if (tags.length > 0) body.tags = tags;

        if (isFullRecipe && methodSteps.length > 0) {
            body.method = methodSteps;
        }

        if (isReferenceRecipe) {
            const ref: RecipeSourceReference = { kind: sourceKind, label: sourceLabel.trim() };
            if (sourceKind === 'url' && sourceUrl.trim()) ref.url = sourceUrl.trim();
            if (sourceKind === 'book') {
                if (sourceBookTitle.trim()) ref.bookTitle = sourceBookTitle.trim();
                const pn = parseInt(sourcePageNumber, 10);
                if (!isNaN(pn) && pn > 0) ref.pageNumber = pn;
                if (sourceIsbn.trim()) ref.isbn = sourceIsbn.trim();
            }
            body.sourceReference = ref;
        }

        return body;
    }

    // --- Submit ---
    async function handleSubmit(): Promise<void> {
        submitError = '';
        isSubmitting = true;
        try {
            const csrfToken = getCookieValue('csrf-token');
            const headers: Record<string, string> = {};
            if (csrfToken) headers['x-csrf-token'] = csrfToken;

            if (isEdit && recipe) {
                const result = await apiFetch<RecipeDetail>(`/api/recipes/${recipe.id}`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(buildRequestBody())
                });
                await goto(resolve(`/recipes/${result.id}`));
            } else {
                const result = await apiFetch<RecipeDetail>('/api/recipes', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(buildRequestBody())
                });
                await goto(resolve(`/recipes/${result.id}`));
            }
        } catch (error) {
            if (error instanceof ApiError) {
                submitError = error.message || `Request failed (${error.status}).`;
            } else {
                submitError = 'Network error. Please try again.';
            }
        } finally {
            isSubmitting = false;
        }
    }
</script>

<main class="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
    <!-- Header -->
    <div class="flex items-center gap-4">
        <a
            href={resolve('/recipes')}
            class="text-sm font-medium text-teal-600 hover:text-teal-700"
        >
            ← Back to Recipes
        </a>
    </div>
    <h1 class="mt-4 text-2xl font-semibold text-slate-900">
        {isEdit ? 'Edit Recipe' : 'New Recipe'}
    </h1>
    <p class="mt-1 text-sm text-slate-500">Share a meal the whole family can enjoy</p>

    <!-- Error message -->
    {#if submitError}
        <p class="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {submitError}
        </p>
    {/if}

    <!-- Basic Info -->
    <section class="mt-10">
        <h2 class="text-xl font-semibold text-slate-900">Basic information</h2>
        <div class="mt-4">
            <RecipeBasicInfo mode="edit" bind:title bind:description />
        </div>
        <div class="mt-4">
            <RecipeHero mode="edit" bind:imageUrl {title} />
        </div>
    </section>

    <!-- Timings & Servings -->
    <section class="mt-10">
        <h2 class="text-xl font-semibold text-slate-900">Timings &amp; servings</h2>
        <div class="mt-4">
            <RecipeMetadata
                mode="edit"
                bind:prepMinutes
                bind:cookMinutes
                bind:servings
                bind:yieldText
            />
        </div>
    </section>

    <!-- Ingredients -->
    <section class="mt-10">
        <h2 class="text-xl font-semibold text-slate-900">Ingredients</h2>
        <div class="mt-1">
            <RecipeIngredients mode="edit" bind:ingredients />
        </div>
    </section>

    <!-- Method / Source Reference -->
    <section class="mt-10">
        <h2 class="text-xl font-semibold text-slate-900">Method</h2>
        <div class="mt-3">
            <RecipeMethodOrSource
                mode="edit"
                bind:recipeType
                bind:steps={methodSteps}
                bind:sourceKind
                bind:sourceLabel
                bind:sourceUrl
                bind:sourceBookTitle
                bind:sourcePageNumber
                bind:sourceIsbn
            />
        </div>
    </section>

    <!-- Tags -->
    <section class="mt-10">
        <h2 class="text-xl font-semibold text-slate-900">Tags</h2>
        <div class="mt-4">
            <RecipeTags mode="edit" bind:tags />
        </div>
    </section>

    <!-- Notes -->
    <section class="mt-10">
        <h2 class="text-xl font-semibold text-slate-900">Notes</h2>
        <div class="mt-4">
            <RecipeNotes mode="edit" bind:notes />
        </div>
    </section>

    <!-- Visibility -->
    <section class="mt-10">
        <h2 class="text-xl font-semibold text-slate-900">Visibility</h2>
        <div class="mt-4">
            <RecipeVisibility mode="edit" bind:visibility />
        </div>
    </section>

    <!-- Actions -->
    <div class="mt-10 flex items-center gap-4">
        <Button
            color="primary"
            onclick={() => void handleSubmit()}
            disabled={!canSubmit}
            class="min-h-[44px] min-w-[44px]"
        >
            {#if isSubmitting}
                {isEdit ? 'Saving…' : 'Creating…'}
            {:else}
                {isEdit ? 'Save Changes' : 'Create Recipe'}
            {/if}
        </Button>
        <Button
            color="alternative"
            onclick={() => void goto(resolve(isEdit && recipe ? `/recipes/${recipe.id}` : '/recipes'))}
            class="min-h-[44px] min-w-[44px]"
        >
            Cancel
        </Button>
    </div>
</main>
