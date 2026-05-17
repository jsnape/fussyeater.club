<script lang="ts">
    import { BookOpenOutline } from 'flowbite-svelte-icons';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';
    import type { RecipeSort } from './+page';
    import RecipeCard from '$lib/components/recipe/RecipeCard.svelte';
    import RecipeSearchBar from '$lib/components/recipe/RecipeSearchBar.svelte';
    import RecipeFilterBar from '$lib/components/recipe/RecipeFilterBar.svelte';
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
    let hasActiveFilters = $derived(Boolean(data.q) || Boolean(data.tag) || data.sort !== 'latest');
    let activeFilterCount = $derived(
        (data.q ? 1 : 0) + (data.tag ? 1 : 0) + (data.sort !== 'latest' ? 1 : 0)
    );

    function buildUrl(
        overrides: { q?: string; sort?: RecipeSort; page?: number; tag?: string | null } = {}
    ): string {
        // eslint-disable-next-line svelte/prefer-svelte-reactivity -- non-reactive local variable
        const params = new URLSearchParams();
        const q = overrides.q ?? data.q;
        const sort = overrides.sort ?? data.sort;
        const page = overrides.page ?? 1;
        const tag = overrides.tag === null ? '' : (overrides.tag ?? data.tag);

        if (q.trim()) params.set('q', q.trim());
        if (tag) params.set('tag', tag);
        if (sort !== 'latest') params.set('sort', sort);
        if (page > 1) params.set('page', String(page));

        const qs = params.toString();
        return qs ? `${resolve('/recipes')}?${qs}` : resolve('/recipes');
    }

    function handleSearch(query: string): void {
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve used inside buildUrl
        void goto(buildUrl({ q: query }), { keepFocus: true });
    }

    function handleSortChange(sort: RecipeSort): void {
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve used inside buildUrl
        void goto(buildUrl({ sort }));
    }

    function handleClearFilters(): void {
        searchQuery = '';
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve used
        void goto(resolve('/recipes'));
    }

    function clearTag(): void {
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve used inside buildUrl
        void goto(buildUrl({ tag: null }));
    }

    function goToPage(page: number): void {
        // eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve used inside buildUrl
        void goto(buildUrl({ page }));
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
    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <!-- Page header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-slate-900">Recipes</h1>
                <p class="mt-1 text-sm text-slate-500">
                    {data.total} recipe{data.total === 1 ? '' : 's'} available
                </p>
            </div>
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() used -->
            <a
                href={resolve('/recipes/new')}
                class="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
            >
                + Add Recipe
            </a>
        </div>

        <!-- Search + Filter bar -->
        <div class="mt-5 space-y-3">
            <RecipeSearchBar bind:query={searchQuery} onSearch={handleSearch} />
            <RecipeFilterBar
                sort={data.sort}
                onSortChange={handleSortChange}
                {activeFilterCount}
                onClearFilters={handleClearFilters}
            />
            {#if data.tag}
                <div class="flex items-center gap-2">
                    <span class="text-sm text-slate-500">Tag:</span>
                    <span
                        class="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700"
                    >
                        {data.tag}
                        <button
                            onclick={clearTag}
                            class="ml-0.5 inline-flex items-center justify-center text-primary-400 hover:text-primary-600"
                            aria-label="Clear tag filter"
                        >
                            ✕
                        </button>
                    </span>
                </div>
            {/if}
        </div>

        {#if data.items.length === 0}
            <EmptyState
                heading="No recipes found"
                description={hasActiveFilters
                    ? 'No recipes match your current filters.'
                    : "Your household hasn't added any recipes yet."}
                actionLabel={hasActiveFilters ? 'Clear Filters' : 'Add Your First Recipe'}
                actionHref={hasActiveFilters ? resolve('/recipes') : resolve('/recipes/new')}
            >
                {#snippet icon()}
                    <BookOpenOutline class="h-12 w-12 text-primary-400" />
                {/snippet}
            </EmptyState>
        {:else}
            <div
                class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4"
            >
                {#each data.items as item (item.id)}
                    <RecipeCard recipe={item} />
                {/each}
            </div>

            <div class="mt-8">
                <RecipePagination
                    page={data.page}
                    {totalPages}
                    total={data.total}
                    pageSize={data.pageSize}
                    onPageChange={goToPage}
                />
            </div>
        {/if}
    </main>
{/if}
