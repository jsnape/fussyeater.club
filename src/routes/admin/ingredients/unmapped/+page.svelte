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
		Badge,
		Tooltip
	} from 'flowbite-svelte';
	import { apiFetch } from '$lib/api';
	import { getCookieValue } from '$lib/browser/cookies';
	import { defaultAllergensForFoodGroup } from '$lib/food-group-defaults';

	let { data } = $props();

	let items = $derived(data.unmapped.items);
	let total = $derived(data.unmapped.total);

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
	let bulkAdding = $state(false);
	let bulkError = $state('');
	let bulkResults = $state<{ added: number; failed: string[] }>({ added: 0, failed: [] });

	let anyPlantSelected = $derived(
		items.some((item) => plantFoodGroups.has(selectedGroups[item.name] ?? ''))
	);

	function isReady(itemName: string): boolean {
		const group = selectedGroups[itemName];
		if (!group) return false;
		if (plantFoodGroups.has(group) && !selectedColours[itemName]) return false;
		return true;
	}

	let readyCount = $derived(items.filter((item) => isReady(item.name)).length);

	async function bulkAdd(): Promise<void> {
		bulkError = '';
		bulkResults = { added: 0, failed: [] };
		bulkAdding = true;

		const csrfToken = getCookieValue('csrf-token');
		const headers: Record<string, string> = { 'Content-Type': 'application/json' };
		if (csrfToken) headers['x-csrf-token'] = csrfToken;

		const toAdd = items.filter((item) => isReady(item.name));

		for (const item of toAdd) {
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

		bulkAdding = false;

		if (bulkResults.added > 0) {
			await invalidateAll();
			selectedGroups = {};
			selectedColours = {};
		}
	}
</script>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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
		{#if readyCount > 0 || bulkResults.added > 0 || bulkResults.failed.length > 0}
			<div class="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
				{#if bulkResults.added > 0}
					<p class="text-sm text-green-700">
						✓ Added {bulkResults.added} ingredient{bulkResults.added === 1 ? '' : 's'}.
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
						{bulkAdding ? 'Adding…' : `Bulk add ${readyCount} ingredient${readyCount === 1 ? '' : 's'}`}
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
					<TableHeadCell class="text-slate-600">Food group</TableHeadCell>
					{#if anyPlantSelected}
						<TableHeadCell class="text-slate-600">Colour</TableHeadCell>
					{/if}
					<TableHeadCell class="text-right text-slate-600">Actions</TableHeadCell>
				</TableHead>
				<TableBody>
					{#each items as item, idx (item.name)}
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
								<select
									value={selectedGroups[item.name] ?? ''}
									onchange={(e) => {
										const target = e.target as HTMLSelectElement;
										selectedGroups[item.name] = target.value;
									}}
									class="min-w-[8rem] rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-700 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
								>
									{#each foodGroups as group (group.value)}
										<option value={group.value}>{group.name}</option>
									{/each}
								</select>
							</TableBodyCell>
							{#if anyPlantSelected}
								<TableBodyCell>
									{#if plantFoodGroups.has(selectedGroups[item.name] ?? '')}
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
									<span id="map-btn-{idx}">
										<Button size="xs" color="alternative" disabled>Map</Button>
									</span>
									<Tooltip triggeredBy="#map-btn-{idx}">Coming soon</Tooltip>
								</div>
							</TableBodyCell>
						</TableBodyRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>
