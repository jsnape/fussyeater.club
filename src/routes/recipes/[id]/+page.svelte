<script lang="ts">
    import type { PageData } from './$types';
    import { resolve } from '$app/paths';
    import RecipeErrorState from '$lib/components/recipe/RecipeErrorState.svelte';
    import RecipeHero from '$lib/components/recipe/RecipeHero.svelte';
    import RecipeBasicInfo from '$lib/components/recipe/RecipeBasicInfo.svelte';
    import RecipeMetadata from '$lib/components/recipe/RecipeMetadata.svelte';
    import RecipeTags from '$lib/components/recipe/RecipeTags.svelte';
    import RecipeIngredients from '$lib/components/recipe/RecipeIngredients.svelte';
    import RecipeMethodOrSource from '$lib/components/recipe/RecipeMethodOrSource.svelte';
    import RecipeNotes from '$lib/components/recipe/RecipeNotes.svelte';
    import RecipeSidebar from '$lib/components/recipe/RecipeSidebar.svelte';

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
    <article class="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <RecipeHero mode="view" imageUrl={recipe.imageUrl ?? ''} title={recipe.title} recipeType={recipe.type} />

        {#if recipe.canEdit}
            <div class="mt-4 flex justify-end">
                <a
                    href={resolve(`/recipes/${recipe.id}/edit`)}
                    class="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700"
                >
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    Edit Recipe
                </a>
            </div>
        {/if}

        <!-- Two-column layout: main content + sidebar -->
        <div class="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_280px]">
            <!-- Main content -->
            <div>
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
                        <div class="mt-4">
                            <RecipeTags mode="view" tags={recipe.tags} />
                        </div>
                    {/if}
                {/if}

                {#if recipe.ingredients.length > 0}
                    <section class="mt-10">
                        <h2 class="text-xl font-semibold text-slate-900">Ingredients</h2>
                        <div class="mt-4">
                            <RecipeIngredients mode="view" ingredients={recipe.ingredients} servings={recipe.servings ?? 0} />
                        </div>
                    </section>
                {/if}

                {#if (recipe.type === 'full' && recipe.method && recipe.method.length > 0) || (recipe.type === 'reference' && recipe.sourceReference)}
                    <section class="mt-10">
                        <h2 class="text-xl font-semibold text-slate-900">
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
                            <div class="mt-4">
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
                    <section class="mt-10">
                        <h2 class="text-xl font-semibold text-slate-900">Notes</h2>
                        <div class="mt-3">
                            <RecipeNotes mode="view" notes={recipe.notes} />
                        </div>
                    </section>
                {/if}
            </div>

            <!-- Sidebar (desktop) -->
            <aside class="hidden lg:block">
                <div class="sticky top-24">
                    <RecipeSidebar recipeTitle={recipe.title} />
                </div>
            </aside>
        </div>
    </article>

    <!-- Mobile sticky action bar -->
    <div class="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden">
        <div class="mx-auto flex max-w-lg gap-3">
            <button
                type="button"
                disabled
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400"
            >
                Add to Plan
            </button>
            <button
                type="button"
                disabled
                class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-400"
            >
                Add to List
            </button>
        </div>
    </div>

    <!-- Spacer for mobile sticky bar -->
    <div class="h-16 lg:hidden"></div>
{/if}
