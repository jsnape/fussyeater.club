<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';
    import RecipeCard from '$lib/components/recipe/RecipeCard.svelte';
    import RecipeSearchBar from '$lib/components/recipe/RecipeSearchBar.svelte';
    import RecipePagination from '$lib/components/recipe/RecipePagination.svelte';
    import RecipeErrorState from '$lib/components/recipe/RecipeErrorState.svelte';

    let { data }: { data: PageData } = $props();

    // eslint-disable-next-line svelte/prefer-writable-derived -- searchQuery must be writable for bind:value
    let searchQuery = $state('');
    $effect(() => {
        searchQuery = data.q;
    });

    let totalPages = $derived(Math.max(1, Math.ceil(data.total / data.pageSize)));

    function handleSearch(query: string): void {
        // eslint-disable-next-line svelte/prefer-svelte-reactivity -- non-reactive local variable
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve used, query params appended
        void goto(`${resolve('/recipes')}?${params.toString()}`, { keepFocus: true });
    }

    function goToPage(page: number): void {
        // eslint-disable-next-line svelte/prefer-svelte-reactivity -- non-reactive local variable
        const params = new URLSearchParams();
        if (data.q) params.set('q', data.q);
        if (page > 1) params.set('page', String(page));
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve used, query params appended
        void goto(`${resolve('/recipes')}?${params.toString()}`);
    }
</script>

{#if data.error === 'unavailable'}
    <RecipeErrorState
        title="Something went wrong"
        message="We're having trouble loading recipes right now. Please try again later."
        actionLabel="Try again"
        actionHref={resolve('/recipes')}
    />
{:else}
    <main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold text-primary-900">Recipes</h1>
            <Button href={resolve('/recipes/new')} color="primary">+ Add Recipe</Button>
        </div>

        <div class="mt-5">
            <RecipeSearchBar bind:query={searchQuery} onSearch={handleSearch} />
        </div>

        {#if data.items.length === 0}
            <div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
                <h2 class="text-xl font-semibold text-primary-900">No recipes found</h2>
                <p class="mt-3 text-primary-700">
                    {#if data.q}
                        No results for "<span class="font-medium">{data.q}</span>". Try different
                        search terms or browse all recipes.
                    {:else}
                        There are no recipes to show yet.
                    {/if}
                </p>
                {#if data.q}
                    <div class="mt-6">
                        <Button href={resolve('/recipes')} color="primary"
                            >Browse all recipes</Button
                        >
                    </div>
                {/if}
            </div>
        {:else}
            <p class="mt-4 text-sm text-primary-600">
                {data.total} recipe{data.total === 1 ? '' : 's'} found
                {#if data.q}&mdash; showing results for "<span class="font-medium">{data.q}</span
                    >"{/if}
            </p>

            <div class="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {#each data.items as item (item.id)}
                    <RecipeCard recipe={item} />
                {/each}
            </div>

            <div class="mt-8">
                <RecipePagination page={data.page} {totalPages} onPageChange={goToPage} />
            </div>
        {/if}
    </main>
{/if}
