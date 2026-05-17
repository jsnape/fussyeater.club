<script lang="ts">
	import type { components } from '$lib/api-types';
	import { Modal, Button } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';

	type RecipeSummary = components['schemas']['RecipeSummary'];

	let {
		open = $bindable(false),
		date,
		mealType,
		recipes,
		loading = false,
		onSelect,
		onCustomNote,
		onSearch
	}: {
		open: boolean;
		date: string;
		mealType: string;
		recipes: RecipeSummary[];
		loading?: boolean;
		onSelect: (recipeId: string) => void;
		onCustomNote: (note: string) => void;
		onSearch: (query: string) => void;
	} = $props();

	let searchQuery = $state('');
	let showCustomNote = $state(false);
	let customNoteText = $state('');

	let dayLabel = $derived.by(() => {
		const d = new Date(date + 'T00:00:00Z');
		return d.toLocaleDateString('en-GB', { weekday: 'long', timeZone: 'UTC' });
	});

	let mealLabel = $derived(mealType.charAt(0).toUpperCase() + mealType.slice(1));

	function handleSearch() {
		onSearch(searchQuery);
	}

	function handleSelectRecipe(recipeId: string) {
		open = false;
		searchQuery = '';
		showCustomNote = false;
		onSelect(recipeId);
	}

	function handleCustomNote() {
		if (customNoteText.trim()) {
			open = false;
			onCustomNote(customNoteText.trim());
			customNoteText = '';
			showCustomNote = false;
			searchQuery = '';
		}
	}

	// Reset state when modal closes (e.g. outsideclose)
	$effect(() => {
		if (!open) {
			searchQuery = '';
			showCustomNote = false;
			customNoteText = '';
		}
	});

	function totalTime(recipe: RecipeSummary): number | null {
		const prep = recipe.timings?.prepMinutes ?? 0;
		const cook = recipe.timings?.cookMinutes ?? 0;
		return prep + cook > 0 ? prep + cook : null;
	}
</script>

<Modal bind:open size="md" title="Add to {mealLabel} — {dayLabel}" outsideclose>
	<!-- Search -->
	<div class="relative mb-4">
		<SearchOutline class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
		<input
			type="text"
			placeholder="Search recipes..."
			bind:value={searchQuery}
			oninput={handleSearch}
			class="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
		/>
	</div>

	<!-- Recipe list -->
	<div class="max-h-[400px] overflow-y-auto">
		{#if loading}
			<div class="py-8 text-center text-sm text-slate-400">Loading recipes…</div>
		{:else if recipes.length === 0}
			<div class="py-8 text-center text-sm text-slate-400">No recipes found</div>
		{:else}
			<div class="space-y-1">
				{#each recipes as recipe}
					<button
						class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-primary-50"
						onclick={() => handleSelectRecipe(recipe.id)}
					>
						{#if recipe.imageUrl}
							<img
								src={recipe.imageUrl}
								alt=""
								class="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
							/>
						{:else}
							<div class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-lg">
								🍽️
							</div>
						{/if}
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-medium text-slate-800">{recipe.title}</div>
							<div class="text-xs text-slate-400">
								{#if totalTime(recipe)}
									{totalTime(recipe)} min
								{/if}
								{#if recipe.tags.length > 0}
									{totalTime(recipe) ? ' · ' : ''}{recipe.tags.slice(0, 3).join(', ')}
								{/if}
							</div>
						</div>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Custom note section -->
	<div class="mt-4 border-t border-slate-100 pt-4">
		{#if showCustomNote}
			<div class="flex gap-2">
				<input
					type="text"
					placeholder="e.g. Eat out, Leftovers..."
					bind:value={customNoteText}
					class="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100"
					onkeydown={(e) => {
						if (e.key === 'Enter') handleCustomNote();
					}}
				/>
				<Button size="sm" color="primary" onclick={handleCustomNote} disabled={!customNoteText.trim()}>
					Add
				</Button>
			</div>
		{:else}
			<button
				class="w-full rounded-xl border-2 border-dashed border-slate-200 px-3 py-2.5 text-sm text-slate-500 transition-colors hover:border-primary-300 hover:text-primary-600"
				onclick={() => (showCustomNote = true)}
			>
				+ Add Custom Note
			</button>
		{/if}
	</div>
</Modal>
