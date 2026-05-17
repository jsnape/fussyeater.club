<script lang="ts">
	import { ChevronLeftOutline, ChevronRightOutline } from 'flowbite-svelte-icons';
	import { Button } from 'flowbite-svelte';

	let {
		weekStart,
		onPreviousWeek,
		onNextWeek,
		onToday,
		onRepeatLastWeek,
		isRepeating = false
	}: {
		weekStart: string;
		onPreviousWeek: () => void;
		onNextWeek: () => void;
		onToday: () => void;
		onRepeatLastWeek: () => void;
		isRepeating?: boolean;
	} = $props();

	let weekLabel = $derived.by(() => {
		const start = new Date(weekStart + 'T00:00:00Z');
		const end = new Date(start);
		end.setUTCDate(start.getUTCDate() + 6);

		const startDay = start.getUTCDate();
		const endDay = end.getUTCDate();
		const startMonth = start.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });
		const endMonth = end.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' });

		if (startMonth === endMonth) {
			return `${startDay} – ${endDay} ${startMonth}`;
		}
		return `${startDay} ${startMonth} – ${endDay} ${endMonth}`;
	});

	let isCurrentWeek = $derived.by(() => {
		const now = new Date();
		const day = now.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		const monday = new Date(now);
		monday.setDate(now.getDate() + diff);
		return monday.toISOString().slice(0, 10) === weekStart;
	});
</script>

<div
	class="sticky top-16 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-sm md:px-6"
>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<!-- Left: heading + week nav -->
		<div class="flex items-center gap-3">
			<h1 class="text-lg font-bold text-slate-900 md:text-xl">Weekly Plan</h1>

			<div class="flex items-center gap-1">
				<button
					onclick={onPreviousWeek}
					class="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
					aria-label="Previous week"
				>
					<ChevronLeftOutline class="h-4 w-4" />
				</button>

				<span class="min-w-[140px] text-center text-sm font-medium text-slate-700">
					{weekLabel}
				</span>

				<button
					onclick={onNextWeek}
					class="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
					aria-label="Next week"
				>
					<ChevronRightOutline class="h-4 w-4" />
				</button>
			</div>

			{#if !isCurrentWeek}
				<button
					onclick={onToday}
					class="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
				>
					Today
				</button>
			{/if}
		</div>

		<!-- Right: actions -->
		<div class="flex items-center gap-2">
			<Button
				size="sm"
				color="alternative"
				onclick={onRepeatLastWeek}
				disabled={isRepeating}
			>
				{isRepeating ? 'Copying…' : 'Repeat Last Week'}
			</Button>
		</div>
	</div>
</div>
