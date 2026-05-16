<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import { BookOpenOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';
    import RecipeCard from '$lib/components/recipe/RecipeCard.svelte';
    import RecipeSearchBar from '$lib/components/recipe/RecipeSearchBar.svelte';
    import RecipePagination from '$lib/components/recipe/RecipePagination.svelte';
    import RecipeErrorState from '$lib/components/recipe/RecipeErrorState.svelte';
    import EmptyState from '$lib/components/ui/EmptyState.svelte';

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
    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-bold text-slate-900">Recipes</h1>
            <Button href={resolve('/recipes/new')} color="primary">+ Add Recipe</Button>
        </div>

        <div class="mt-5">
            <RecipeSearchBar bind:query={searchQuery} onSearch={handleSearch} />
        </div>

        {#if data.items.length === 0}
            <EmptyState
                heading="No recipes found"
                description={data.q
                    ? `No results for "${data.q}". Try different search terms or browse all recipes.`
                    : 'There are no recipes to show yet. Add your first recipe to get started!'}
                actionLabel={data.q ? 'Browse all recipes' : 'Add a recipe'}
                actionHref={data.q ? resolve('/recipes') : resolve('/recipes/new')}
            >
                {#snippet icon()}
                    <BookOpenOutline class="h-12 w-12 text-primary-400" />
                {/snippet}
            </EmptyState>
        {:else}
            <p class="mt-4 text-sm text-slate-500">
                {data.total} recipe{data.total === 1 ? '' : 's'} found
                {#if data.q}&mdash; showing results for "<span class="font-medium">{data.q}</span
                    >"{/if}
            </p>

            <div class="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
