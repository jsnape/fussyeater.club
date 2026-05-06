<script lang="ts">
    import type { PageData } from './$types';
    import RecipeErrorState from '$lib/components/recipe/RecipeErrorState.svelte';
    import RecipeHero from '$lib/components/recipe/RecipeHero.svelte';
    import RecipeBasicInfo from '$lib/components/recipe/RecipeBasicInfo.svelte';
    import RecipeMetadata from '$lib/components/recipe/RecipeMetadata.svelte';
    import RecipeTags from '$lib/components/recipe/RecipeTags.svelte';
    import RecipeIngredients from '$lib/components/recipe/RecipeIngredients.svelte';
    import RecipeMethodOrSource from '$lib/components/recipe/RecipeMethodOrSource.svelte';
    import RecipeNotes from '$lib/components/recipe/RecipeNotes.svelte';

    let { data }: { data: PageData } = $props();

    let recipe = $derived(data.recipe);
</script>

{#if data.error === 'not-found'}
    <RecipeErrorState
        title="Recipe not found"
        message="We couldn't find the recipe you're looking for. It may have been removed or the link may be incorrect."
    />
{:else if data.error === 'forbidden'}
    <RecipeErrorState
        title="You don't have access to this recipe"
        message="This recipe belongs to a private household. Ask the owner to share it with you."
    />
{:else if data.error === 'unavailable'}
    <RecipeErrorState
        title="Something went wrong"
        message="We're having trouble loading this recipe right now. Please try again later."
    />
{:else if recipe}
    <article class="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <RecipeHero mode="view" imageUrl={recipe.imageUrl ?? ''} title={recipe.title} />

        <RecipeBasicInfo mode="view" title={recipe.title} description={recipe.description ?? ''} />

        {#if recipe.timings?.prepMinutes || recipe.timings?.cookMinutes || recipe.servings || recipe.yield || recipe.tags.length}
            <div class="mt-5">
                <RecipeMetadata
                    mode="view"
                    prepMinutes={String(recipe.timings?.prepMinutes ?? '')}
                    cookMinutes={String(recipe.timings?.cookMinutes ?? '')}
                    servings={String(recipe.servings ?? '')}
                    yieldText={recipe.yield ?? ''}
                />
            </div>
            {#if recipe.tags.length > 0}
                <div class="mt-3">
                    <RecipeTags mode="view" tags={recipe.tags} />
                </div>
            {/if}
        {/if}

        {#if recipe.ingredients.length > 0}
            <section class="mt-8">
                <h2 class="text-xl font-semibold text-primary-900">Ingredients</h2>
                <RecipeIngredients mode="view" ingredients={recipe.ingredients} />
            </section>
        {/if}

        {#if (recipe.type === 'full' && recipe.method && recipe.method.length > 0) || (recipe.type === 'reference' && recipe.sourceReference)}
            <section class="mt-8">
                <h2 class="text-xl font-semibold text-primary-900">
                    {recipe.type === 'full' ? 'Method' : 'Source'}
                </h2>
                {#if recipe.type === 'full'}
                    <div class="mt-4">
                        <RecipeMethodOrSource
                            mode="view"
                            recipeType="full"
                            steps={recipe.method ?? []}
                            sourceKind="url"
                            sourceLabel=""
                            sourceUrl=""
                            sourceBookTitle=""
                            sourcePageNumber=""
                            sourceIsbn=""
                        />
                    </div>
                {:else if recipe.sourceReference}
                    <div class="mt-2">
                        <RecipeMethodOrSource
                            mode="view"
                            recipeType="reference"
                            steps={[]}
                            sourceKind={recipe.sourceReference.kind}
                            sourceLabel={recipe.sourceReference.label}
                            sourceUrl={recipe.sourceReference.url ?? ''}
                            sourceBookTitle={recipe.sourceReference.bookTitle ?? ''}
                            sourcePageNumber={String(recipe.sourceReference.pageNumber ?? '')}
                            sourceIsbn={recipe.sourceReference.isbn ?? ''}
                        />
                    </div>
                {/if}
            </section>
        {/if}

        {#if recipe.notes}
            <section class="mt-8">
                <h2 class="text-xl font-semibold text-primary-900">Notes</h2>
                <div class="mt-3">
                    <RecipeNotes mode="view" notes={recipe.notes} />
                </div>
            </section>
        {/if}
    </article>
{/if}
