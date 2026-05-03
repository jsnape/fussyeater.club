<script lang="ts">
    import { Badge, Button, Input, Label, Select, Textarea, Radio } from 'flowbite-svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { apiFetch, ApiError } from '$lib/api';
    import { getCookieValue } from '$lib/browser/cookies';
    import type { components } from '$lib/api-types';

    type CreateRecipeRequest = components['schemas']['CreateRecipeRequest'];
    type RecipeDetail = components['schemas']['RecipeDetail'];
    type RecipeIngredient = components['schemas']['RecipeIngredient'];
    type RecipeSourceReference = components['schemas']['RecipeSourceReference'];

    interface IngredientDraft {
        amount: string;
        unit: string;
        ingredient: string;
        ingredientGroup: string;
        preparation: string;
    }

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
    let ingredients = $state<RecipeIngredient[]>([]);
    let ingredientDraft = $state<IngredientDraft>({
        amount: '',
        unit: '',
        ingredient: '',
        ingredientGroup: '',
        preparation: ''
    });

    // Method steps (full recipes)
    let methodSteps = $state<string[]>([]);
    let methodDraft = $state('');

    // Source reference (reference recipes)
    let sourceKind = $state<'url' | 'book'>('url');
    let sourceLabel = $state('');
    let sourceUrl = $state('');
    let sourceBookTitle = $state('');
    let sourcePageNumber = $state('');
    let sourceIsbn = $state('');

    // Tags
    let tags = $state<string[]>([]);
    let tagDraft = $state('');

    // Submission
    let isSubmitting = $state(false);
    let submitError = $state('');

    // Select component items
    const sourceKindItems = [
        { value: 'url', name: 'URL' },
        { value: 'book', name: 'Book' }
    ];

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

    // --- Clear hidden section data when type changes ---
    let previousType = $state<'full' | 'reference'>('full');
    $effect(() => {
        const current = recipeType;
        if (current !== previousType) {
            if (current === 'full') {
                // Switched to full — clear source reference
                sourceLabel = '';
                sourceUrl = '';
                sourceBookTitle = '';
                sourcePageNumber = '';
                sourceIsbn = '';
            } else {
                // Switched to reference — clear method steps
                methodSteps = [];
                methodDraft = '';
            }
            previousType = current;
        }
    });

    // --- Ingredient actions ---
    function addIngredient(): void {
        const name = ingredientDraft.ingredient.trim();
        if (!name) return;

        const entry: RecipeIngredient = { ingredient: name };
        const amt = parseFloat(ingredientDraft.amount);
        if (!isNaN(amt) && amt > 0) entry.amount = amt;
        if (ingredientDraft.unit.trim()) entry.unit = ingredientDraft.unit.trim();
        if (ingredientDraft.ingredientGroup.trim())
            entry.ingredientGroup = ingredientDraft.ingredientGroup.trim();
        if (ingredientDraft.preparation.trim())
            entry.preparation = { type: 'text', text: ingredientDraft.preparation.trim() };

        ingredients = [...ingredients, entry];
        ingredientDraft = {
            amount: '',
            unit: '',
            ingredient: '',
            ingredientGroup: '',
            preparation: ''
        };
    }

    function removeIngredient(index: number): void {
        ingredients = ingredients.filter((_, i) => i !== index);
    }

    // --- Method step actions ---
    function addMethodStep(): void {
        const step = methodDraft.trim();
        if (!step) return;
        methodSteps = [...methodSteps, step];
        methodDraft = '';
    }

    function removeMethodStep(index: number): void {
        methodSteps = methodSteps.filter((_, i) => i !== index);
    }

    // --- Tag actions ---
    function addTag(): void {
        const tag = tagDraft.trim().toLowerCase();
        if (!tag || tags.includes(tag)) {
            tagDraft = '';
            return;
        }
        tags = [...tags, tag];
        tagDraft = '';
    }

    function removeTag(tag: string): void {
        tags = tags.filter((t) => t !== tag);
    }

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
            <Label for="title" class="mb-1 text-sm font-medium text-primary-700">Title</Label>
            <Input
                id="title"
                type="text"
                bind:value={title}
                placeholder="Recipe title"
                aria-required="true"
                maxlength={200}
            />
        </div>

        <div class="mt-4">
            <Label for="description" class="mb-1 text-sm font-medium text-primary-700"
                >Description</Label
            >
            <Textarea
                id="description"
                bind:value={description}
                placeholder="A short description of the recipe"
                rows={3}
                maxlength={2000}
                class="w-full"
            />
        </div>

        <div class="mt-4">
            <Label for="image-url" class="mb-1 text-sm font-medium text-primary-700"
                >Image URL</Label
            >
            <Input
                id="image-url"
                type="url"
                bind:value={imageUrl}
                placeholder="https://example.com/image.jpg"
            />
        </div>
    </section>

    <!-- Timings & Servings -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Timings &amp; servings</h2>

        <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
                <Label for="prep-minutes" class="mb-1 text-sm font-medium text-primary-700"
                    >Prep (minutes)</Label
                >
                <Input id="prep-minutes" type="number" bind:value={prepMinutes} min="0" />
            </div>
            <div>
                <Label for="cook-minutes" class="mb-1 text-sm font-medium text-primary-700"
                    >Cook (minutes)</Label
                >
                <Input id="cook-minutes" type="number" bind:value={cookMinutes} min="0" />
            </div>
            <div>
                <Label for="servings" class="mb-1 text-sm font-medium text-primary-700"
                    >Servings</Label
                >
                <Input id="servings" type="number" bind:value={servings} min="1" />
            </div>
            <div>
                <Label for="yield-text" class="mb-1 text-sm font-medium text-primary-700"
                    >Yield</Label
                >
                <Input
                    id="yield-text"
                    type="text"
                    bind:value={yieldText}
                    placeholder="e.g. 12 muffins"
                    maxlength={100}
                />
            </div>
        </div>
    </section>

    <!-- Ingredients -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Ingredients</h2>
        <p class="mt-1 text-sm text-primary-700">Add at least one ingredient.</p>

        <div class="mt-4 rounded-lg border border-primary-200 bg-white p-5">
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                    <Label for="ing-group" class="mb-1 text-sm font-medium text-primary-700"
                        >Group (optional)</Label
                    >
                    <Input
                        id="ing-group"
                        type="text"
                        bind:value={ingredientDraft.ingredientGroup}
                        placeholder="e.g. Sauce"
                    />
                </div>
                <div>
                    <Label for="ing-amount" class="mb-1 text-sm font-medium text-primary-700"
                        >Amount (optional)</Label
                    >
                    <Input
                        id="ing-amount"
                        type="number"
                        bind:value={ingredientDraft.amount}
                        placeholder="e.g. 2"
                        min="0"
                        step="any"
                    />
                </div>
                <div>
                    <Label for="ing-unit" class="mb-1 text-sm font-medium text-primary-700"
                        >Unit (optional)</Label
                    >
                    <Input
                        id="ing-unit"
                        type="text"
                        bind:value={ingredientDraft.unit}
                        placeholder="e.g. cups"
                    />
                </div>
                <div>
                    <Label for="ing-name" class="mb-1 text-sm font-medium text-primary-700"
                        >Ingredient</Label
                    >
                    <Input
                        id="ing-name"
                        type="text"
                        bind:value={ingredientDraft.ingredient}
                        placeholder="Ingredient name"
                        aria-required="true"
                    />
                </div>
            </div>
            <div class="mt-3">
                <Label for="ing-prep" class="mb-1 text-sm font-medium text-primary-700"
                    >Preparation (optional)</Label
                >
                <Input
                    id="ing-prep"
                    type="text"
                    bind:value={ingredientDraft.preparation}
                    placeholder="e.g. finely chopped"
                />
            </div>
            <div class="mt-4">
                <Button
                    color="alternative"
                    onclick={addIngredient}
                    disabled={!ingredientDraft.ingredient.trim()}
                    class="min-h-[44px] min-w-[44px]"
                >
                    + Add ingredient
                </Button>
            </div>
        </div>

        {#if ingredients.length > 0}
            <ul class="mt-4 space-y-2">
                {#each ingredients as ing, i (i)}
                    <li
                        class="flex items-center justify-between rounded-md border border-primary-200 bg-white px-4 py-3"
                    >
                        <span class="text-sm text-primary-900">
                            {#if ing.ingredientGroup}<span class="font-medium"
                                    >[{ing.ingredientGroup}]</span
                                >&nbsp;{/if}
                            {#if ing.amount}{ing.amount}{/if}
                            {#if ing.unit}&nbsp;{ing.unit}{/if}
                            {ing.ingredient}
                            {#if ing.preparation?.text}
                                <span class="text-primary-600">— {ing.preparation.text}</span>
                            {/if}
                        </span>
                        <Button
                            color="red"
                            size="xs"
                            onclick={() => removeIngredient(i)}
                            aria-label={`Remove ingredient ${ing.ingredient}`}
                            class="min-h-[44px] min-w-[44px]"
                        >
                            Remove
                        </Button>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <!-- Method / Source Reference -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Method</h2>
        <div class="mt-3 flex gap-6">
            <Radio name="recipe-type" value="full" bind:group={recipeType}>
                <span class="text-sm">Write method steps</span>
            </Radio>
            <Radio name="recipe-type" value="reference" bind:group={recipeType}>
                <span class="text-sm">Link to source</span>
            </Radio>
        </div>

    {#if isFullRecipe}
        <div class="mt-4">
            <p class="text-sm text-primary-700">Add at least one step.</p>

            <div class="mt-4 rounded-lg border border-primary-200 bg-white p-5">
                <Label for="method-step" class="mb-1 text-sm font-medium text-primary-700"
                    >Step description</Label
                >
                <Textarea
                    id="method-step"
                    bind:value={methodDraft}
                    placeholder="Describe this step"
                    rows={2}
                    aria-required="true"
                    class="w-full"
                />
                <div class="mt-4">
                    <Button
                        color="alternative"
                        onclick={addMethodStep}
                        disabled={!methodDraft.trim()}
                        class="min-h-[44px] min-w-[44px]"
                    >
                        + Add step
                    </Button>
                </div>
            </div>

            {#if methodSteps.length > 0}
                <ol class="mt-4 list-inside list-decimal space-y-2">
                    {#each methodSteps as step, i (i)}
                        <li
                            class="flex items-start justify-between rounded-md border border-primary-200 bg-white px-4 py-3"
                        >
                            <span class="text-sm text-primary-900">
                                <span class="font-semibold">{i + 1}.</span>
                                {step}
                            </span>
                            <Button
                                color="red"
                                size="xs"
                                onclick={() => removeMethodStep(i)}
                                aria-label={`Remove step ${i + 1}`}
                                class="ml-3 min-h-[44px] min-w-[44px] shrink-0"
                            >
                                Remove
                            </Button>
                        </li>
                    {/each}
                </ol>
            {/if}
        </div>
    {:else}
        <div class="mt-4">
            <div class="rounded-lg border border-primary-200 bg-white p-5">
                <div>
                    <Label for="source-kind" class="mb-1 text-sm font-medium text-primary-700"
                        >Source type</Label
                    >
                    <Select id="source-kind" items={sourceKindItems} bind:value={sourceKind} />
                </div>

                <div class="mt-4">
                    <Label for="source-label" class="mb-1 text-sm font-medium text-primary-700"
                        >Label</Label
                    >
                    <Input
                        id="source-label"
                        type="text"
                        bind:value={sourceLabel}
                        placeholder="Name or description of the source"
                        aria-required="true"
                    />
                </div>

                {#if sourceKind === 'url'}
                    <div class="mt-4">
                        <Label for="source-url" class="mb-1 text-sm font-medium text-primary-700"
                            >URL</Label
                        >
                        <Input
                            id="source-url"
                            type="url"
                            bind:value={sourceUrl}
                            placeholder="https://example.com/recipe"
                            aria-required="true"
                        />
                    </div>
                {:else}
                    <div class="mt-4">
                        <Label
                            for="source-book-title"
                            class="mb-1 text-sm font-medium text-primary-700">Book title</Label
                        >
                        <Input
                            id="source-book-title"
                            type="text"
                            bind:value={sourceBookTitle}
                            placeholder="Title of the book"
                        />
                    </div>
                    <div class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <Label
                                for="source-page"
                                class="mb-1 text-sm font-medium text-primary-700">Page number</Label
                            >
                            <Input
                                id="source-page"
                                type="number"
                                bind:value={sourcePageNumber}
                                min="1"
                            />
                        </div>
                        <div>
                            <Label
                                for="source-isbn"
                                class="mb-1 text-sm font-medium text-primary-700">ISBN</Label
                            >
                            <Input
                                id="source-isbn"
                                type="text"
                                bind:value={sourceIsbn}
                                placeholder="e.g. 978-0-13-468599-1"
                            />
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {/if}
    </section>

    <!-- Tags -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Tags</h2>

        <div class="mt-4 flex gap-2">
            <Input
                id="tag-input"
                type="text"
                bind:value={tagDraft}
                placeholder="Add a tag"
                class="flex-1"
                onkeydown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                    }
                }}
            />
            <Button
                color="alternative"
                onclick={addTag}
                disabled={!tagDraft.trim()}
                class="min-h-[44px] min-w-[44px]"
            >
                Add
            </Button>
        </div>

        {#if tags.length > 0}
            <div class="mt-3 flex flex-wrap gap-2">
                {#each tags as tag (tag)}
                    <Badge color="primary" class="flex items-center gap-1 text-sm">
                        {tag}
                        <button
                            type="button"
                            class="ml-1 inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-xs hover:text-red-600"
                            onclick={() => removeTag(tag)}
                            aria-label={`Remove tag ${tag}`}
                        >
                            ✕
                        </button>
                    </Badge>
                {/each}
            </div>
        {/if}
    </section>

    <!-- Notes -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Notes</h2>
        <div class="mt-4">
            <Textarea
                id="notes"
                bind:value={notes}
                placeholder="Any additional notes"
                rows={3}
                maxlength={2000}
                class="w-full"
            />
        </div>
    </section>

    <!-- Visibility -->
    <section class="mt-8">
        <h2 class="text-xl font-semibold text-primary-900">Visibility</h2>
        <div class="mt-4 flex gap-6">
            <Radio name="visibility" value="private" bind:group={visibility}>
                Household
            </Radio>
            <Radio name="visibility" value="public" bind:group={visibility}>
                Everyone
            </Radio>
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
