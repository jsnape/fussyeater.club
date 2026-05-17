<script lang="ts">
	import type { components } from '$lib/api-types';
	import PlannerCell from './PlannerCell.svelte';
	import { PlusOutline } from 'flowbite-svelte-icons';

	type MealPlanEntry = components['schemas']['MealPlanEntry'];

	let {
		weekStart,
		entries,
		onAddClick,
		onRemoveEntry,
		onEditEntry
	}: {
		weekStart: string;
		entries: MealPlanEntry[];
		onAddClick: (date: string, mealType: string) => void;
		onRemoveEntry: (id: string) => void;
		onEditEntry: (entry: MealPlanEntry) => void;
	} = $props();

	const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'] as const;
	const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	let weekDates = $derived.by(() => {
		const dates: string[] = [];
		const start = new Date(weekStart + 'T00:00:00Z');
		for (let i = 0; i < 7; i++) {
			const d = new Date(start);
			d.setUTCDate(start.getUTCDate() + i);
			dates.push(d.toISOString().slice(0, 10));
		}
		return dates;
	});

	let todayStr = $derived(new Date().toISOString().slice(0, 10));

	function getEntry(date: string, mealType: string): MealPlanEntry | undefined {
		return entries.find((e) => e.entryDate === date && e.mealType === mealType);
	}

	function formatDayNumber(dateStr: string): number {
		return new Date(dateStr + 'T00:00:00Z').getUTCDate();
	}
</script>

<div class="overflow-x-auto">
	<div class="min-w-[700px]">
		<!-- Day headers -->
		<div class="mb-1 grid grid-cols-[60px_repeat(7,1fr)] gap-1">
			<div></div>
			{#each weekDates as date, i}
				<div
					class="rounded-lg px-2 py-1.5 text-center text-xs font-medium"
					class:bg-primary-50={date === todayStr}
					class:text-primary-700={date === todayStr}
					class:text-slate-500={date !== todayStr}
				>
					<div>{DAY_NAMES[i]}</div>
					<div class="text-base font-bold" class:text-primary-700={date === todayStr} class:text-slate-800={date !== todayStr}>
						{formatDayNumber(date)}
					</div>
				</div>
			{/each}
		</div>

		<!-- Meal rows -->
		{#each MEAL_TYPES as mealType}
			<div class="mb-1 grid grid-cols-[60px_repeat(7,1fr)] gap-1">
				<!-- Row label -->
				<div class="flex items-center justify-center">
					<span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
						{mealType.slice(0, 1).toUpperCase() + mealType.slice(1)}
					</span>
				</div>

				<!-- Cells -->
				{#each weekDates as date}
					{@const entry = getEntry(date, mealType)}
					<div class="min-h-[80px]">
						{#if entry}
							<PlannerCell
								{entry}
								onRemove={onRemoveEntry}
								onEdit={onEditEntry}
							/>
						{:else}
							<button
								onclick={() => onAddClick(date, mealType)}
								class="flex h-full w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 text-slate-300 transition-colors hover:border-primary-300 hover:bg-primary-50/50 hover:text-primary-400"
								aria-label="Add {mealType} for {DAY_NAMES[weekDates.indexOf(date)]}"
							>
								<PlusOutline class="h-4 w-4" />
							</button>
						{/if}
					</div>
				{/each}
			</div>
		{/each}
	</div>
</div>
