<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { apiFetch } from '$lib/api';
	import { getCookieValue } from '$lib/browser/cookies';
	import type { PageData } from './$types';
	import type { components } from '$lib/api-types';

	type CanonicalIngredient = components['schemas']['CanonicalIngredient'];

	let { data }: { data: PageData } = $props();

	// eslint-disable-next-line svelte/prefer-writable-derived -- searchQuery must be writable for bind:value
	let searchQuery = $state('');
	$effect(() => {
		searchQuery = page.url.searchParams.get('search') ?? '';
	});

	let selectedFoodGroup = $derived(page.url.searchParams.get('foodGroup') ?? '');
	let selectedAllergen = $derived(page.url.searchParams.get('allergen') ?? '');
	let selectedPlantColour = $derived(page.url.searchParams.get('plantColour') ?? '');

	let deleteTarget = $state<CanonicalIngredient | null>(null);
	let deleting = $state(false);

	let totalPages = $derived(Math.max(1, Math.ceil(data.ingredients.total / data.ingredients.pageSize)));

	const foodGroups = [
		{ value: '', name: 'All food groups' },
		{ value: 'dairy', name: 'Dairy' },
		{ value: 'meat', name: 'Meat' },
		{ value: 'poultry', name: 'Poultry' },
		{ value: 'fish', name: 'Fish' },
		{ value: 'shellfish', name: 'Shellfish' },
		{ value: 'grain', name: 'Grain' },
		{ value: 'fruit', name: 'Fruit' },
		{ value: 'vegetable', name: 'Vegetable' },
		{ value: 'herb', name: 'Herb' },
		{ value: 'spice', name: 'Spice' },
		{ value: 'legume', name: 'Legume' },
		{ value: 'nut', name: 'Nut' },
		{ value: 'seed', name: 'Seed' },
		{ value: 'oil', name: 'Oil' },
		{ value: 'condiment', name: 'Condiment' },
		{ value: 'sweetener', name: 'Sweetener' },
		{ value: 'other', name: 'Other' }
	];

	const allergenOptions = [
		{ value: '', name: 'All allergens' },
		{ value: 'milk', name: 'Milk' },
		{ value: 'eggs', name: 'Eggs' },
		{ value: 'peanuts', name: 'Peanuts' },
		{ value: 'tree-nuts', name: 'Tree nuts' },
		{ value: 'wheat', name: 'Wheat' },
		{ value: 'soy', name: 'Soy' },
		{ value: 'fish', name: 'Fish' },
		{ value: 'shellfish', name: 'Shellfish' },
		{ value: 'sesame', name: 'Sesame' },
		{ value: 'gluten', name: 'Gluten' },
		{ value: 'celery', name: 'Celery' },
		{ value: 'mustard', name: 'Mustard' },
		{ value: 'lupin', name: 'Lupin' },
		{ value: 'molluscs', name: 'Molluscs' },
		{ value: 'sulphites', name: 'Sulphites' }
	];

	const plantColours = [
		{ value: 'red', label: 'Red', dotClass: 'bg-red-500' },
		{ value: 'orange', label: 'Orange', dotClass: 'bg-orange-500' },
		{ value: 'yellow', label: 'Yellow', dotClass: 'bg-yellow-400' },
		{ value: 'green', label: 'Green', dotClass: 'bg-green-500' },
		{ value: 'blue-purple', label: 'Blue/purple', dotClass: 'bg-purple-500' },
		{ value: 'white-brown', label: 'White/brown', dotClass: 'bg-amber-200 border border-amber-400' },
		{ value: 'multicolour', label: 'Multicolour', dotClass: 'bg-gradient-to-r from-red-500 via-yellow-400 to-green-500' }
	];

	const severeAllergens = new Set(['peanuts', 'tree-nuts', 'shellfish', 'fish', 'milk', 'eggs']);

	const plantFoodGroups = new Set(['fruit', 'vegetable', 'herb', 'legume']);

	function getPlantColourDotClass(colour: string): string {
		const found = plantColours.find((c) => c.value === colour);
		return found?.dotClass ?? 'bg-slate-300';
	}

	function buildUrl(overrides: {
		search?: string;
		foodGroup?: string;
		allergen?: string;
		plantColour?: string;
		page?: number;
	} = {}): string {
		const params = new URLSearchParams();
		const search = overrides.search ?? searchQuery;
		const foodGroup = overrides.foodGroup ?? selectedFoodGroup;
		const allergen = overrides.allergen ?? selectedAllergen;
		const plantColour = overrides.plantColour ?? selectedPlantColour;
		const pg = overrides.page ?? 1;

		if (search.trim()) params.set('search', search.trim());
		if (foodGroup) params.set('foodGroup', foodGroup);
		if (allergen) params.set('allergen', allergen);
		if (plantColour) params.set('plantColour', plantColour);
		if (pg > 1) params.set('page', String(pg));

		const qs = params.toString();
		return qs ? `${resolve('/admin/ingredients')}?${qs}` : resolve('/admin/ingredients');
	}

	function handleSearch(event: SubmitEvent): void {
		event.preventDefault();
		void goto(buildUrl({ search: searchQuery }), { keepFocus: true });
	}

	function handleFoodGroupChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		void goto(buildUrl({ foodGroup: target.value }));
	}

	function handleAllergenChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		void goto(buildUrl({ allergen: target.value }));
	}

	function handlePlantColourClick(colour: string): void {
		const newColour = selectedPlantColour === colour ? '' : colour;
		void goto(buildUrl({ plantColour: newColour }));
	}

	function goToPage(pg: number): void {
		void goto(buildUrl({ page: pg }));
	}

	function confirmDelete(ingredient: CanonicalIngredient): void {
		deleteTarget = ingredient;
	}

	function cancelDelete(): void {
		deleteTarget = null;
	}

	async function executeDelete(): Promise<void> {
		if (!deleteTarget) return;
		deleting = true;
		try {
			const csrfToken = getCookieValue('csrf-token') ?? '';
			await apiFetch(`/api/admin/ingredients/${deleteTarget.id}`, {
				method: 'DELETE',
				headers: csrfToken ? { 'x-csrf-token': csrfToken } : {}
			});
			deleteTarget = null;
			void goto(buildUrl(), { invalidateAll: true });
		} catch {
			alert('Failed to delete ingredient. Please try again.');
		} finally {
			deleting = false;
		}
	}
</script>

<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
	<!-- Page header -->
	<div class="flex items-center justify-between">
		<div class="flex items-center gap-3">
			<h1 class="text-3xl font-bold text-slate-900">Ingredient database</h1>
			<span class="rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600">
				{data.ingredients.total}
			</span>
		</div>
		<a
			href={resolve('/admin/ingredients/new')}
			class="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
		>
			+ New ingredient
		</a>
	</div>

	<!-- Search bar -->
	<form class="mt-5" onsubmit={handleSearch}>
		<div class="flex gap-2">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search by name or alias…"
				class="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
			/>
			<button
				type="submit"
				class="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
			>
				Search
			</button>
		</div>
	</form>

	<!-- Filter toolbar -->
	<div class="mt-3 flex flex-wrap items-center gap-3">
		<!-- Food group -->
		<select
			value={selectedFoodGroup}
			onchange={handleFoodGroupChange}
			class="min-w-[10rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
		>
			{#each foodGroups as group (group.value)}
				<option value={group.value}>{group.name}</option>
			{/each}
		</select>

		<!-- Allergen -->
		<select
			value={selectedAllergen}
			onchange={handleAllergenChange}
			class="min-w-[9rem] rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
		>
			{#each allergenOptions as option (option.value)}
				<option value={option.value}>{option.name}</option>
			{/each}
		</select>

		<!-- Plant colour chips -->
		<div class="flex items-center gap-1.5">
			<span class="mr-1 text-xs font-medium text-slate-500">Plant colour:</span>
			{#each plantColours as colour (colour.value)}
				<button
					type="button"
					class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors {selectedPlantColour === colour.value
						? 'bg-primary-100 text-primary-700 ring-1 ring-primary-300'
						: 'bg-slate-100 text-slate-600 hover:bg-slate-200'}"
					onclick={() => handlePlantColourClick(colour.value)}
				>
					<span class="inline-block h-2.5 w-2.5 rounded-full {colour.dotClass}"></span>
					{colour.label}
				</button>
			{/each}
		</div>
	</div>

	<!-- Data table -->
	{#if data.ingredients.items.length === 0}
		<div class="mt-10 flex flex-col items-center justify-center rounded-2xl bg-slate-50 py-16">
			<div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
				<svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
				</svg>
			</div>
			<h2 class="text-lg font-semibold text-slate-900">No ingredients found</h2>
			<p class="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
		</div>
	{:else}
		<div class="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
			<table class="w-full text-left text-sm">
				<thead class="border-b border-slate-200 bg-slate-50">
					<tr>
						<th class="px-4 py-3 font-medium text-slate-600">Name</th>
						<th class="px-4 py-3 font-medium text-slate-600">Food group</th>
						<th class="px-4 py-3 font-medium text-slate-600">Allergens</th>
						<th class="px-4 py-3 font-medium text-slate-600">Plant colour</th>
						<th class="px-4 py-3 text-right font-medium text-slate-600">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-slate-100">
					{#each data.ingredients.items as ingredient (ingredient.id)}
						<tr class="transition-colors hover:bg-slate-50">
							<!-- Name -->
							<td class="px-4 py-3">
								<div class="flex items-center gap-2">
									<span class="font-medium text-slate-900">{ingredient.name}</span>
									{#if ingredient.aliases.length > 0}
										<span class="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
											+{ingredient.aliases.length}
										</span>
									{/if}
								</div>
							</td>

							<!-- Food Group -->
							<td class="px-4 py-3">
								<span class="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium capitalize text-slate-700">
									{ingredient.foodGroup}
								</span>
							</td>

							<!-- Allergens -->
							<td class="px-4 py-3">
								{#if ingredient.allergens.length > 0}
									<div class="flex flex-wrap gap-1">
										{#each ingredient.allergens as allergen (allergen)}
											<span
												class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {severeAllergens.has(allergen)
													? 'bg-red-100 text-red-700'
													: 'bg-yellow-100 text-yellow-700'}"
											>
												{allergen}
											</span>
										{/each}
									</div>
								{:else}
									<span class="text-xs text-slate-400">—</span>
								{/if}
							</td>

							<!-- Plant Colour -->
							<td class="px-4 py-3">
								{#if ingredient.plantColour && plantFoodGroups.has(ingredient.foodGroup)}
									<span class="inline-flex items-center gap-1.5">
										<span class="inline-block h-3 w-3 rounded-full {getPlantColourDotClass(ingredient.plantColour)}"></span>
										<span class="text-xs capitalize text-slate-600">{ingredient.plantColour}</span>
									</span>
								{:else}
									<span class="text-xs text-slate-400">—</span>
								{/if}
							</td>

							<!-- Actions -->
							<td class="px-4 py-3 text-right">
								<div class="flex items-center justify-end gap-2">
									<a
										href={resolve('/admin/ingredients/[id]/edit', { id: ingredient.id })}
										class="rounded-lg px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-50"
									>
										Edit
									</a>
									<button
										type="button"
										class="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
										onclick={() => confirmDelete(ingredient)}
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<nav class="mt-8 flex flex-col items-center gap-2 border-t border-slate-200 pt-6" aria-label="Pagination">
				<div class="flex items-center justify-center gap-1">
					<button
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
						disabled={data.ingredients.page <= 1}
						onclick={() => goToPage(data.ingredients.page - 1)}
					>
						← Previous
					</button>

					{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum (pageNum)}
						{#if totalPages <= 7 || pageNum === 1 || pageNum === totalPages || (pageNum >= data.ingredients.page - 2 && pageNum <= data.ingredients.page + 2)}
							<button
								class="min-w-[2rem] h-8 rounded-lg text-sm {pageNum === data.ingredients.page
									? 'bg-primary-600 font-medium text-white'
									: 'text-slate-600 hover:bg-slate-100'}"
								onclick={() => goToPage(pageNum)}
								aria-current={pageNum === data.ingredients.page ? 'page' : undefined}
							>
								{pageNum}
							</button>
						{:else if pageNum === 2 || pageNum === totalPages - 1}
							<span class="flex min-w-[2rem] h-8 items-center justify-center text-sm text-slate-400">…</span>
						{/if}
					{/each}

					<button
						class="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
						disabled={data.ingredients.page >= totalPages}
						onclick={() => goToPage(data.ingredients.page + 1)}
					>
						Next →
					</button>
				</div>

				<p class="text-sm text-slate-500">
					Showing {(data.ingredients.page - 1) * data.ingredients.pageSize + 1}–{Math.min(data.ingredients.page * data.ingredients.pageSize, data.ingredients.total)} of {data.ingredients.total} ingredients
				</p>
			</nav>
		{/if}
	{/if}
</main>

<!-- Delete confirmation dialog -->
{#if deleteTarget}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50"
		onkeydown={(e) => { if (e.key === 'Escape') cancelDelete(); }}
	>
		<div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
			<h3 id="delete-dialog-title" class="text-lg font-semibold text-slate-900">Delete Ingredient</h3>
			<p class="mt-2 text-sm text-slate-600">
				Are you sure you want to delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
			</p>
			<div class="mt-6 flex justify-end gap-3">
				<button
					type="button"
					class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
					onclick={cancelDelete}
					disabled={deleting}
				>
					Cancel
				</button>
				<button
					type="button"
					class="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
					onclick={executeDelete}
					disabled={deleting}
				>
					{deleting ? 'Deleting…' : 'Delete'}
				</button>
			</div>
		</div>
	</div>
{/if}
