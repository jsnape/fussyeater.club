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

    type CreateRecipeRequest = components['schemas']['CreateRecipeRequest'];
    type RecipeDetail = components['schemas']['RecipeDetail'];
    type RecipeIngredientType = components['schemas']['RecipeIngredient'];
    type RecipeSourceReference = components['schemas']['RecipeSourceReference'];

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let { data } = $props();

    // --- Form state ---
    let title = $state('');
    let description = $state('');
    let imageUrl = $state('');
    let recipeType = $state<'full' | 'reference'>('full');
    let visibility = $state<'public' | 'private'>('private');
    let servings = $state('');
    let yieldText = $state('');
    let prepMinutes = $state('');
    let cookMinutes = $state('');
    let notes = $state('');

    // Ingredients
    let ingredients = $state<RecipeIngredientType[]>([]);

    // Method steps (full recipes)
    let methodSteps = $state<string[]>([]);

    // Source reference (reference recipes)
    let sourceKind = $state<'url' | 'book'>('url');
    let sourceLabel = $state('');
    let sourceUrl = $state('');
    let sourceBookTitle = $state('');
    let sourcePageNumber = $state('');
    let sourceIsbn = $state('');

    // Tags
    let tags = $state<string[]>([]);

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

    // --- Build request body ---
    function buildRequestBody(): CreateRecipeRequest {
        const body: CreateRecipeRequest = {
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
            const result = await apiFetch<RecipeDetail>('/api/recipes', {
                method: 'POST',
                headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
                body: JSON.stringify(buildRequestBody())
            });
            await goto(resolve(`/recipes/${result.id}`));
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

<main class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
    <!-- Header -->
    <h1 class="text-2xl font-semibold text-primary-900">New Recipe</h1>

    <!-- Error message -->
    {#if submitError}
        <p class="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
            {submitError}
        </p>
    {/if}

    <!-- Basic Info -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Basic information</h2>
        <div class="mt-4">
            <RecipeBasicInfo mode="edit" bind:title bind:description />
        </div>
        <div class="mt-4">
            <RecipeHero mode="edit" bind:imageUrl {title} />
        </div>
    </section>

    <!-- Timings & Servings -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Timings &amp; servings</h2>
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
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Ingredients</h2>
        <div class="mt-1">
            <RecipeIngredients mode="edit" bind:ingredients />
        </div>
    </section>

    <!-- Method / Source Reference -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Method</h2>
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
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Tags</h2>
        <div class="mt-4">
            <RecipeTags mode="edit" bind:tags />
        </div>
    </section>

    <!-- Notes -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Notes</h2>
        <div class="mt-4">
            <RecipeNotes mode="edit" bind:notes />
        </div>
    </section>

    <!-- Visibility -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Visibility</h2>
        <div class="mt-4">
            <RecipeVisibility mode="edit" bind:visibility />
        </div>
    </section>

    <!-- Actions -->
    <div class="mt-8 flex items-center gap-4">
        <Button
            color="primary"
            onclick={() => void handleSubmit()}
            disabled={!canSubmit}
            class="min-h-[44px] min-w-[44px]"
        >
            {isSubmitting ? 'Creating recipe…' : 'Create Recipe'}
        </Button>
        <Button
            color="alternative"
            onclick={() => void goto(resolve('/recipes'))}
            class="min-h-[44px] min-w-[44px]"
        >
            Cancel
        </Button>
    </div>
</main>
