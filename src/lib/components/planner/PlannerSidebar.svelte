<script lang="ts">
	import type { components } from '$lib/api-types';
	import { SearchOutline } from 'flowbite-svelte-icons';

	type RecipeSummary = components['schemas']['RecipeSummary'];

	let {
		recipes,
		loading = false,
		onSearch,
		onSelectRecipe
	}: {
		recipes: RecipeSummary[];
		loading?: boolean;
		onSearch: (query: string) => void;
		onSelectRecipe: (recipeId: string, date: string, mealType: string) => void;
	} = $props();

	let searchQuery = $state('');

	function handleSearch() {
		onSearch(searchQuery);
	}

	function totalTime(recipe: RecipeSummary): number | null {
		const prep = recipe.timings?.prepMinutes ?? 0;
		const cook = recipe.timings?.cookMinutes ?? 0;
		return prep + cook > 0 ? prep + cook : null;
	}
</script>

<aside class="w-72 flex-shrink-0 rounded-2xl bg-white p-4 shadow-sm">
	<h2 class="mb-3 text-sm font-semibold text-slate-700">Recipes</h2>

	<!-- Search -->
	<div class="relative mb-3">
		<SearchOutline class="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
		<input
			type="text"
			placeholder="Search saved recipes..."
			bind:value={searchQuery}
			oninput={handleSearch}
			class="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-xs focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
		/>
	</div>

	<!-- Recipe list -->
	<div class="max-h-[calc(100vh-280px)] overflow-y-auto">
		{#if loading}
			<div class="py-6 text-center text-xs text-slate-400">Loading…</div>
		{:else if recipes.length === 0}
			<div class="py-6 text-center text-xs text-slate-400">No recipes found</div>
		{:else}
			<div class="space-y-1">
				{#each recipes as recipe}
					<div
						class="group flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-primary-50"
						title="Click '+' on the calendar to add this recipe"
					>
						{#if recipe.imageUrl}
							<img
								src={recipe.imageUrl}
								alt=""
								class="h-8 w-8 flex-shrink-0 rounded-lg object-cover"
							/>
						{:else}
							<div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">
								🍽️
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="truncate text-xs font-medium text-slate-800">{recipe.title}</div>
							<div class="text-[10px] text-slate-400">
								{#if totalTime(recipe)}
									{totalTime(recipe)} min
								{/if}
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</aside>
