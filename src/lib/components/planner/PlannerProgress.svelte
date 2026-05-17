<script lang="ts">
	import type { components } from '$lib/api-types';

	type PlantStats = components['schemas']['PlantStats'];

	const PLANT_GOAL = 30;

	const RAINBOW_COLOURS = [
		{ key: 'red', label: 'Red', bg: 'bg-red-500', ring: 'ring-red-200', text: 'text-red-700', light: 'bg-red-50' },
		{ key: 'orange', label: 'Orange', bg: 'bg-orange-500', ring: 'ring-orange-200', text: 'text-orange-700', light: 'bg-orange-50' },
		{ key: 'yellow', label: 'Yellow', bg: 'bg-yellow-400', ring: 'ring-yellow-200', text: 'text-yellow-700', light: 'bg-yellow-50' },
		{ key: 'green', label: 'Green', bg: 'bg-green-500', ring: 'ring-green-200', text: 'text-green-700', light: 'bg-green-50' },
		{ key: 'blue-purple', label: 'Blue / purple', bg: 'bg-purple-500', ring: 'ring-purple-200', text: 'text-purple-700', light: 'bg-purple-50' },
		{ key: 'white-brown', label: 'White / brown', bg: 'bg-amber-200', ring: 'ring-amber-100', text: 'text-amber-800', light: 'bg-amber-50' }
	] as const;

	let {
		planned,
		total,
		withAlerts,
		plantStats
	}: {
		planned: number;
		total: number;
		withAlerts: number;
		plantStats: PlantStats;
	} = $props();

	let percentage = $derived(total > 0 ? Math.round((planned / total) * 100) : 0);
	let goalReached = $derived(planned >= 15);

	// Plant diversity
	let plantPercentage = $derived(Math.min(100, Math.round((plantStats.uniquePlants / PLANT_GOAL) * 100)));
	let plantGoalReached = $derived(plantStats.uniquePlants >= PLANT_GOAL);

	// Colour map for quick lookup
	let colourMap = $derived.by(() => {
		const map: Record<string, { count: number; plants: string[] }> = {};
		for (const c of plantStats.colourCounts) {
			map[c.colour] = { count: c.count, plants: c.plants };
		}
		return map;
	});

	let coloursHit = $derived(RAINBOW_COLOURS.filter((c) => (colourMap[c.key]?.count ?? 0) > 0).length);
	let allColoursHit = $derived(coloursHit === RAINBOW_COLOURS.length);

	// Title-case a plant name for display
	function titleCase(s: string): string {
		return s.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	// Full plant list tooltip for the diversity bar
	let allPlantsTooltip = $derived(
		plantStats.plantNames.length > 0
			? plantStats.plantNames.map(titleCase).join(', ')
			: 'No plants found yet'
	);

	function plantBarColour(pct: number): string {
		if (pct >= 100) return 'bg-emerald-500';
		if (pct >= 60) return 'bg-lime-500';
		if (pct >= 30) return 'bg-amber-400';
		return 'bg-red-400';
	}
</script>

<div class="space-y-4">
	<!-- Meal planning progress -->
	<div class="rounded-2xl bg-white p-5 shadow-sm">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold text-slate-700">Weekly progress</h3>
			{#if goalReached}
				<span class="text-sm">🎉 Goal reached!</span>
			{/if}
		</div>

		<div class="mt-3">
			<div class="flex items-center justify-between text-xs text-slate-500">
				<span>{planned} of {total} slots planned</span>
				<span>{percentage}%</span>
			</div>
			<div class="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
				<div
					class="h-full rounded-full bg-primary-500 transition-all duration-500"
					style="width: {percentage}%"
				></div>
			</div>
		</div>

		<div class="mt-4 grid grid-cols-3 gap-3 text-center">
			<div>
				<div class="text-lg font-bold text-slate-900">{planned}</div>
				<div class="text-xs text-slate-500">Planned</div>
			</div>
			<div>
				<div class="text-lg font-bold text-slate-900">{total - planned}</div>
				<div class="text-xs text-slate-500">Remaining</div>
			</div>
			<div>
				<div class="text-lg font-bold" class:text-amber-600={withAlerts > 0} class:text-emerald-600={withAlerts === 0}>
					{withAlerts}
				</div>
				<div class="text-xs text-slate-500">Alerts</div>
			</div>
		</div>
	</div>

	<!-- Plant diversity progress -->
	<div class="rounded-2xl bg-white p-5 shadow-sm">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold text-slate-700">🌱 Plant diversity</h3>
			{#if plantGoalReached}
				<span class="text-sm">🎉 30+ plants!</span>
			{/if}
		</div>

		<div class="mt-3" title={allPlantsTooltip}>
			<div class="flex items-center justify-between text-xs text-slate-500">
				<span>{plantStats.uniquePlants} of {PLANT_GOAL} different plants</span>
				<span>{plantPercentage}%</span>
			</div>
			<div class="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
				<div
					class="h-full rounded-full {plantBarColour(plantPercentage)} transition-all duration-500"
					style="width: {plantPercentage}%"
				></div>
			</div>
			{#if plantStats.uniquePlants > 0 && plantStats.uniquePlants < PLANT_GOAL}
				<p class="mt-1.5 text-xs text-slate-400">
					{PLANT_GOAL - plantStats.uniquePlants} more to go — try adding different fruits, vegetables, herbs and legumes
				</p>
			{/if}
		</div>
	</div>

	<!-- Rainbow colour tracker -->
	<div class="rounded-2xl bg-white p-5 shadow-sm">
		<div class="flex items-center justify-between">
			<h3 class="text-sm font-semibold text-slate-700">🌈 Eat the rainbow</h3>
			{#if allColoursHit}
				<span class="text-sm">🌈 All colours!</span>
			{:else}
				<span class="text-xs text-slate-400">{coloursHit} of {RAINBOW_COLOURS.length} colours</span>
			{/if}
		</div>

		<div class="mt-4 flex gap-1.5">
			{#each RAINBOW_COLOURS as colour (colour.key)}
				{@const entry = colourMap[colour.key]}
				{@const count = entry?.count ?? 0}
				{@const active = count > 0}
				{@const tooltip = active
					? `${colour.label}: ${(entry?.plants ?? []).map(titleCase).join(', ')}`
					: `${colour.label}: none yet`}
				<div class="flex flex-1 flex-col items-center gap-1.5" title={tooltip}>
					<!-- Colour arc segment -->
					<div
						class="flex h-12 w-full items-center justify-center rounded-xl transition-all duration-500 {active ? `${colour.bg} shadow-sm ring-2 ${colour.ring}` : 'bg-slate-100 ring-1 ring-slate-200'}"
					>
						{#if active}
							<span class="text-sm font-bold text-white drop-shadow-sm">{count}</span>
						{:else}
							<span class="text-lg text-slate-300">✕</span>
						{/if}
					</div>
					<!-- Label -->
					<span class="text-center text-[10px] leading-tight {active ? colour.text + ' font-medium' : 'text-slate-400'}">
						{colour.label}
					</span>
				</div>
			{/each}
		</div>

		{#if !allColoursHit && plantStats.uniquePlants > 0}
			{@const missing = RAINBOW_COLOURS.filter((c) => (colourMap[c.key]?.count ?? 0) === 0)}
			<p class="mt-3 text-xs text-slate-400">
				Missing: {missing.map((c) => c.label.toLowerCase()).join(', ')}
			</p>
		{/if}
	</div>
</div>
