<script lang="ts">
    type RecipeSort = 'latest' | 'quickest' | 'alphabetical';

    let {
        sort,
        onSortChange,
        activeFilterCount,
        onClearFilters
    }: {
        sort: RecipeSort;
        onSortChange: (sort: RecipeSort) => void;
        activeFilterCount: number;
        onClearFilters: () => void;
    } = $props();

    function handleSortChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        onSortChange(target.value as RecipeSort);
    }
</script>

<div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
        <label for="recipe-sort" class="text-sm text-slate-500">Sort by:</label>
        <select
            id="recipe-sort"
            value={sort}
            onchange={handleSortChange}
            class="min-w-[8rem] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
        >
            <option value="latest">Latest</option>
            <option value="quickest">Quickest</option>
            <option value="alphabetical">A–Z</option>
        </select>
    </div>

    {#if activeFilterCount > 0}
        <div class="flex items-center gap-2">
            <span class="text-sm text-slate-500">
                {activeFilterCount} {activeFilterCount === 1 ? 'filter' : 'filters'} active
            </span>
            <button
                type="button"
                onclick={onClearFilters}
                class="text-sm text-primary-600 hover:text-primary-700"
            >
                Clear all
            </button>
        </div>
    {/if}
</div>
