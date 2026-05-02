<script lang="ts">
    import { Badge, Button } from 'flowbite-svelte';
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    let recipe = $derived(data.recipe);

    let totalMinutes = $derived(
        (recipe?.timings?.prepMinutes ?? 0) + (recipe?.timings?.cookMinutes ?? 0)
    );

    type IngredientGroup = {
        name: string;
        items: NonNullable<typeof recipe>['ingredients'];
    };

    let ingredientGroups = $derived.by(() => {
        if (!recipe) return [];

        const groupOrder: string[] = [];
        const groupItems: Record<string, NonNullable<typeof recipe>['ingredients']> = {};

        for (const ing of recipe.ingredients) {
            const key = ing.ingredientGroup ?? '';
            if (!(key in groupItems)) {
                groupItems[key] = [];
                groupOrder.push(key);
            }
            groupItems[key].push(ing);
        }

        const named: IngredientGroup[] = [];
        let ungrouped: IngredientGroup | null = null;

        for (const key of groupOrder) {
            const items = groupItems[key];
            if (key === '') {
                ungrouped = { name: 'Other', items };
            } else {
                named.push({ name: key, items });
            }
        }

        if (ungrouped) named.push(ungrouped);
        return named;
    });
</script>

{#snippet ingredientLine(ing: NonNullable<typeof recipe>['ingredients'][number])}
    {@const amount = ing.amount ? String(ing.amount) : ''}
    {@const unit = ing.unit ?? ''}
    {@const qty = [amount, unit].filter(Boolean).join('')}
    <span>
        {#if qty}{qty}&nbsp;{/if}{ing.ingredient}{#if ing.preparation}
            {#if ing.preparation.type === 'recipe-link' && ing.preparation.recipeId}
                &nbsp;(<a
                    href={resolve(`/recipes/${ing.preparation.recipeId}`)}
                    class="text-primary-700 underline hover:text-primary-900"
                    >{ing.preparation.recipeLabel ?? ing.preparation.text ?? 'recipe'}</a
                >)
            {:else if ing.preparation.text}
                &nbsp;({ing.preparation.text})
            {/if}
        {/if}
    </span>
{/snippet}

{#snippet errorState(title: string, message: string)}
    <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <h1 class="text-2xl font-semibold text-primary-900">{title}</h1>
        <p class="mt-3 text-primary-700">{message}</p>
        <div class="mt-6">
            <Button href="/recipes" color="primary">Browse recipes</Button>
        </div>
    </div>
{/snippet}

{#if data.error === 'not-found'}
    {@render errorState(
        'Recipe not found',
        "We couldn't find the recipe you're looking for. It may have been removed or the link may be incorrect."
    )}
{:else if data.error === 'forbidden'}
    {@render errorState(
        "You don't have access to this recipe",
        'This recipe belongs to a private household. Ask the owner to share it with you.'
    )}
{:else if data.error === 'unavailable'}
    {@render errorState(
        'Something went wrong',
        "We're having trouble loading this recipe right now. Please try again later."
    )}
{:else if recipe}
    <article class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <!-- Hero image -->
        <div class="overflow-hidden rounded-xl">
            <img
                src={recipe.imageUrl ?? '/images/recipe-no-image.jpg'}
                alt={recipe.title}
                class="aspect-video w-full object-cover"
            />
        </div>

        <!-- Title -->
        <h1 class="mt-6 text-3xl font-bold text-primary-900 sm:text-4xl">{recipe.title}</h1>

        <!-- Description -->
        {#if recipe.description}
            <div class="prose-primary prose mt-4 max-w-none">
                <p>{recipe.description}</p>
            </div>
        {/if}

        <!-- Metadata row -->
        {#if recipe.timings?.prepMinutes || recipe.timings?.cookMinutes || recipe.servings || recipe.yield || recipe.tags.length}
            <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-primary-700">
                {#if recipe.timings?.prepMinutes}
                    <span>Prep: {recipe.timings.prepMinutes} min</span>
                {/if}
                {#if recipe.timings?.cookMinutes}
                    <span
                        >{recipe.timings?.prepMinutes ? '·' : ''} Cook: {recipe.timings.cookMinutes} min</span
                    >
                {/if}
                {#if totalMinutes > 0 && recipe.timings?.prepMinutes && recipe.timings?.cookMinutes}
                    <span>· Total: {totalMinutes} min</span>
                {/if}
                {#if recipe.servings}
                    <span>· Serves {recipe.servings}</span>
                {/if}
                {#if recipe.yield}
                    <span>· {recipe.yield}</span>
                {/if}
            </div>
            {#if recipe.tags.length > 0}
                <div class="mt-3 flex flex-wrap gap-2">
                    {#each recipe.tags as tag (tag)}
                        <Badge color="primary">{tag}</Badge>
                    {/each}
                </div>
            {/if}
        {/if}

        <!-- Ingredients -->
        {#if recipe.ingredients.length > 0}
            <section class="mt-8">
                <h2 class="text-xl font-semibold text-primary-900">Ingredients</h2>

                {#each ingredientGroups as group (group.name)}
                    {#if ingredientGroups.length > 1}
                        <h3
                            class="mt-4 text-sm font-semibold tracking-wide text-primary-600 uppercase"
                        >
                            {group.name}
                        </h3>
                    {/if}
                    <ul class="mt-2 space-y-1.5">
                        {#each group.items as ing (ing.ingredient)}
                            <li class="flex items-baseline gap-2 text-primary-800">
                                <span
                                    class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-400"
                                ></span>
                                {@render ingredientLine(ing)}
                            </li>
                        {/each}
                    </ul>
                {/each}
            </section>
        {/if}

        <!-- Method steps (full recipes only) -->
        {#if recipe.type === 'full' && recipe.method && recipe.method.length > 0}
            <section class="mt-8">
                <h2 class="text-xl font-semibold text-primary-900">Method</h2>
                <ol class="mt-4 space-y-4">
                    {#each recipe.method as step, i (i)}
                        <li class="flex gap-4">
                            <span
                                class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-800"
                            >
                                {i + 1}
                            </span>
                            <div class="prose-primary prose max-w-none pt-0.5">
                                <p>{step}</p>
                            </div>
                        </li>
                    {/each}
                </ol>
            </section>
        {/if}

        <!-- Source reference (reference recipes only) -->
        {#if recipe.type === 'reference' && recipe.sourceReference}
            <section class="mt-8 rounded-lg border border-primary-200 bg-white p-5">
                <h2 class="text-lg font-semibold text-primary-900">Source</h2>

                {#if recipe.sourceReference.kind === 'url'}
                    <!-- eslint-disable svelte/no-navigation-without-resolve -->
                    <p class="mt-2 text-primary-700">
                        <a
                            href={recipe.sourceReference.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="inline-flex items-center gap-1 text-primary-700 underline hover:text-primary-900"
                        >
                            {recipe.sourceReference.label}
                            <span class="text-xs">↗</span>
                        </a>
                    </p>
                    <!-- eslint-enable svelte/no-navigation-without-resolve -->
                {:else if recipe.sourceReference.kind === 'book'}
                    <div class="mt-2 space-y-1 text-primary-700">
                        <p class="font-medium">{recipe.sourceReference.label}</p>
                        {#if recipe.sourceReference.bookTitle}
                            <p>
                                <span class="text-primary-500">Book:</span>
                                <em>{recipe.sourceReference.bookTitle}</em>
                            </p>
                        {/if}
                        {#if recipe.sourceReference.pageNumber}
                            <p>
                                <span class="text-primary-500">Page:</span>
                                {recipe.sourceReference.pageNumber}
                            </p>
                        {/if}
                        {#if recipe.sourceReference.isbn}
                            <p>
                                <span class="text-primary-500">ISBN:</span>
                                {recipe.sourceReference.isbn}
                            </p>
                        {/if}
                    </div>
                {/if}
            </section>
        {/if}

        <!-- Notes -->
        {#if recipe.notes}
            <section class="mt-8">
                <h2 class="text-xl font-semibold text-primary-900">Notes</h2>
                <div class="prose-primary prose mt-3 max-w-none">
                    <p>{recipe.notes}</p>
                </div>
            </section>
        {/if}
    </article>
{/if}
