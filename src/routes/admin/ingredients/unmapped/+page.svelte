<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import {
		Button,
		Table,
		TableHead,
		TableBody,
		TableBodyRow,
		TableBodyCell,
		TableHeadCell,
		Badge
	} from 'flowbite-svelte';
	import { apiFetch } from '$lib/api';
	import { getCookieValue } from '$lib/browser/cookies';
	import { defaultAllergensForFoodGroup } from '$lib/food-group-defaults';
	import type { components } from '$lib/api-types';

	type CanonicalIngredient = components['schemas']['CanonicalIngredient'];

	let { data } = $props();

	let items = $derived(data.unmapped.items);
	let total = $derived(data.unmapped.total);
	let allIngredients = $derived(data.allIngredients as CanonicalIngredient[]);

	const foodGroups = [
		{ value: '', name: '—' },
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

	const plantFoodGroups = new Set(['fruit', 'vegetable', 'herb', 'legume']);

	const plantColourOptions = [
		{ value: '', name: '—' },
		{ value: 'red', name: 'Red' },
		{ value: 'orange', name: 'Orange' },
		{ value: 'yellow', name: 'Yellow' },
		{ value: 'green', name: 'Green' },
		{ value: 'blue-purple', name: 'Blue / purple' },
		{ value: 'white-brown', name: 'White / brown' },
		{ value: 'multicolour', name: 'Multicolour' }
	];

	let selectedGroups = $state<Record<string, string>>({});
	let selectedColours = $state<Record<string, string>>({});
	let selectedAliasFor = $state<Record<string, { id: string; name: string } | null>>({});
	let aliasSearchTerms = $state<Record<string, string>>({});
	let openDropdown = $state<string | null>(null);
	let bulkAdding = $state(false);
	let bulkError = $state('');
	let bulkResults = $state<{ added: number; aliased: number; failed: string[] }>({
		added: 0,
		aliased: 0,
		failed: []
	});

	let anyPlantSelected = $derived(
		items.some((item) => plantFoodGroups.has(selectedGroups[item.name] ?? ''))
	);

	function filteredIngredients(searchTerm: string): CanonicalIngredient[] {
		const term = searchTerm.toLowerCase().trim();
		if (!term) return [];
		return allIngredients.filter((ing) => ing.name.toLowerCase().includes(term)).slice(0, 8);
	}

	function selectAlias(itemName: string, ingredient: CanonicalIngredient): void {
		selectedAliasFor[itemName] = { id: ingredient.id, name: ingredient.name };
		aliasSearchTerms[itemName] = '';
		openDropdown = null;
	}

	function clearAlias(itemName: string): void {
		selectedAliasFor[itemName] = null;
	}

	function handleDropdownClick(event: MouseEvent): void {
		// Close dropdown when clicking outside
		const target = event.target as HTMLElement;
		if (!target.closest('[data-alias-combobox]')) {
			openDropdown = null;
		}
	}

	function isReady(itemName: string): boolean {
		// Ready if alias-for is selected
		if (selectedAliasFor[itemName]) return true;
		// Or if food group is selected (with plant colour if needed)
		const group = selectedGroups[itemName];
		if (!group) return false;
		if (plantFoodGroups.has(group) && !selectedColours[itemName]) return false;
		return true;
	}

	let readyCount = $derived(items.filter((item) => isReady(item.name)).length);

	let newIngredientCount = $derived(
		items.filter((item) => {
			if (selectedAliasFor[item.name]) return false;
			return isReady(item.name);
		}).length
	);

	let aliasCount = $derived(
		items.filter((item) => !!selectedAliasFor[item.name]).length
	);

	function bulkButtonText(): string {
		if (bulkAdding) return 'Adding…';
		const parts: string[] = [];
		if (newIngredientCount > 0) {
			parts.push(`${newIngredientCount} ingredient${newIngredientCount === 1 ? '' : 's'}`);
		}
		if (aliasCount > 0) {
			parts.push(`${aliasCount} alias${aliasCount === 1 ? '' : 'es'}`);
		}
		if (parts.length === 0) return 'Bulk add';
		if (newIngredientCount > 0 && aliasCount > 0) {
			return `Bulk add ${parts[0]}, map ${parts[1]}`;
		}
		if (aliasCount > 0) return `Map ${parts[0]}`;
		return `Bulk add ${parts[0]}`;
	}

	async function bulkAdd(): Promise<void> {
		bulkError = '';
		bulkResults = { added: 0, aliased: 0, failed: [] };
		bulkAdding = true;

		const csrfToken = getCookieValue('csrf-token');
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (csrfToken) headers['x-csrf-token'] = csrfToken;

		const toProcess = items.filter((item) => isReady(item.name));

		for (const item of toProcess) {
			const alias = selectedAliasFor[item.name];
			if (alias) {
				// Map as alias of existing ingredient
				try {
					await apiFetch(`/api/admin/ingredients/${alias.id}`, {
						method: 'PATCH',
						headers,
						body: JSON.stringify({ alias: item.name })
					});
					bulkResults.aliased++;
				} catch {
					bulkResults.failed.push(item.name);
				}
			} else {
				// Create new ingredient
				const group = selectedGroups[item.name];
				try {
					await apiFetch('/api/admin/ingredients', {
						method: 'POST',
						headers,
						body: JSON.stringify({
							name: item.name,
							foodGroup: group,
							allergens: [...defaultAllergensForFoodGroup(group)],
							aliases: [],
							plantColour: plantFoodGroups.has(group) ? selectedColours[item.name] : null,
							description: null
						})
					});
					bulkResults.added++;
				} catch {
					bulkResults.failed.push(item.name);
				}
			}
		}

		bulkAdding = false;

		if (bulkResults.added > 0 || bulkResults.aliased > 0) {
			await invalidateAll();
			selectedGroups = {};
			selectedColours = {};
			selectedAliasFor = {};
			aliasSearchTerms = {};
		}
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div role="presentation" onclick={handleDropdownClick}>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center gap-3">
			<h1 class="text-2xl font-bold text-slate-900">Unmapped ingredients</h1>
			{#if total > 0}
				<Badge color="red">{total}</Badge>
			{/if}
		</div>
		<p class="mt-2 text-sm text-slate-500">
			These ingredient names appear in recipes but don't match any canonical ingredient by name or
			alias.
		</p>
	</div>

	<!-- Content -->
	{#if items.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl bg-white p-12 text-center shadow-sm"
		>
			<p class="text-lg font-medium text-slate-700">All recipe ingredients are mapped! 🎉</p>
		</div>
	{:else}
		<!-- Bulk add bar -->
		{#if readyCount > 0 || bulkResults.added > 0 || bulkResults.aliased > 0 || bulkResults.failed.length > 0}
			<div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
				{#if bulkResults.added > 0}
					<p class="text-sm text-green-700">
						✓ Added {bulkResults.added} ingredient{bulkResults.added === 1 ? '' : 's'}.
					</p>
				{/if}
				{#if bulkResults.aliased > 0}
					<p class="text-sm text-green-700">
						✓ Mapped {bulkResults.aliased} as alias{bulkResults.aliased === 1 ? '' : 'es'}.
					</p>
				{/if}
				{#if bulkResults.failed.length > 0}
					<p class="text-sm text-red-600">
						Failed: {bulkResults.failed.join(', ')}
					</p>
				{/if}
				{#if readyCount > 0}
					<Button
						size="sm"
						color="primary"
						disabled={bulkAdding}
						onclick={() => void bulkAdd()}
					>
						{bulkButtonText()}
					</Button>
				{/if}
			</div>
		{/if}

		{#if bulkError}
			<p class="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
				{bulkError}
			</p>
		{/if}

		<div class="overflow-x-auto rounded-2xl bg-white shadow-sm">
			<Table striped={true}>
				<TableHead class="bg-slate-50">
					<TableHeadCell class="text-slate-600">Name</TableHeadCell>
					<TableHeadCell class="text-slate-600">Used in</TableHeadCell>
					<TableHeadCell class="text-slate-600">Alias for</TableHeadCell>
					<TableHeadCell class="text-slate-600">Food group</TableHeadCell>
					{#if anyPlantSelected}
						<TableHeadCell class="text-slate-600">Colour</TableHeadCell>
					{/if}
					<TableHeadCell class="text-right text-slate-600">Actions</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each items as item (item.name)}
						{@const hasAlias = !!selectedAliasFor[item.name]}
						<TableBodyRow>
							<TableBodyCell class="font-medium text-slate-900">
								{item.name}
							</TableBodyCell>
							<TableBodyCell>
								<Badge color="primary">
									{item.recipeCount}
									{item.recipeCount === 1 ? 'recipe' : 'recipes'}
								</Badge>
							</TableBodyCell>
							<TableBodyCell>
								{#if hasAlias}
									<span class="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2.5 py-1 text-sm font-medium text-primary-800">
										{selectedAliasFor[item.name]?.name}
										<button
											type="button"
											onclick={() => clearAlias(item.name)}
											class="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-primary-600 hover:bg-primary-200 hover:text-primary-900"
											aria-label="Clear alias selection"
										>×</button>
									</span>
								{:else}
									<div class="relative" data-alias-combobox>
										<input
											type="text"
											placeholder="Search…"
											value={aliasSearchTerms[item.name] ?? ''}
											oninput={(e) => {
												const target = e.target as HTMLInputElement;
												aliasSearchTerms[item.name] = target.value;
												openDropdown = item.name;
											}}
											onfocus={() => {
												openDropdown = item.name;
											}}
											class="w-full min-w-[10rem] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
										/>
										{#if openDropdown === item.name && (aliasSearchTerms[item.name] ?? '').trim().length > 0}
											{@const matches = filteredIngredients(aliasSearchTerms[item.name] ?? '')}
											{#if matches.length > 0}
												<div class="absolute left-0 z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
													{#each matches as match (match.id)}
														<button
															type="button"
															class="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-900"
															onmousedown={(e) => { e.preventDefault(); selectAlias(item.name, match); }}
														>
															<span class="font-medium">{match.name}</span>
															<span class="ml-1 text-xs text-slate-400">{match.foodGroup}</span>
														</button>
													{/each}
												</div>
											{/if}
										{/if}
									</div>
								{/if}
							</TableBodyCell>
							<TableBodyCell>
								<select
									value={selectedGroups[item.name] ?? ''}
									disabled={hasAlias}
									onchange={(e) => {
										const target = e.target as HTMLSelectElement;
										selectedGroups[item.name] = target.value;
									}}
									class="min-w-[8rem] rounded-lg border border-slate-300 px-2 py-1.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 {hasAlias ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-700'}"
								>
									{#each foodGroups as group (group.value)}
										<option value={group.value}>{group.name}</option>
									{/each}
								</select>
							</TableBodyCell>
							{#if anyPlantSelected}
								<TableBodyCell>
									{#if plantFoodGroups.has(selectedGroups[item.name] ?? '') && !hasAlias}
										<select
											value={selectedColours[item.name] ?? ''}
											onchange={(e) => {
												const target = e.target as HTMLSelectElement;
												selectedColours[item.name] = target.value;
											}}
											class="min-w-[8rem] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
										>
											{#each plantColourOptions as colour (colour.value)}
												<option value={colour.value}>{colour.name}</option>
											{/each}
										</select>
									{/if}
								</TableBodyCell>
							{/if}
							<TableBodyCell class="text-right">
								<div class="flex items-center justify-end gap-2">
									<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() used, query params appended -->
									<Button
										size="xs"
										color="primary"
										href={`${resolve('/admin/ingredients/new')}?name=${encodeURIComponent(item.name)}`}
									>
										Create
									</Button>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>
</div>
