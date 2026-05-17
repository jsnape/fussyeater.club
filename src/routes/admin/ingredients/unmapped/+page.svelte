<script lang="ts">
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

	let { data } = $props();

	let items = $derived(data.unmapped.items);
	let total = $derived(data.unmapped.total);
</script>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
	<!-- Header -->
	<div class="mb-6">
		<div class="flex items-center gap-3">
			<h1 class="text-2xl font-bold text-slate-900">Unmapped Ingredients</h1>
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
		<div class="overflow-x-auto rounded-2xl bg-white shadow-sm">
			<Table striped={true}>
				<TableHead class="bg-slate-50">
					<TableHeadCell class="text-slate-600">Name</TableHeadCell>
					<TableHeadCell class="text-slate-600">Used In</TableHeadCell>
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
