<script lang="ts">
	let {
		planned,
		total,
		withAlerts
	}: {
		planned: number;
		total: number;
		withAlerts: number;
	} = $props();

	let percentage = $derived(total > 0 ? Math.round((planned / total) * 100) : 0);
	let goalReached = $derived(planned >= 15);
</script>

<div class="rounded-2xl bg-white p-5 shadow-sm">
	<div class="flex items-center justify-between">
		<h3 class="text-sm font-semibold text-slate-700">Weekly Progress</h3>
		{#if goalReached}
			<span class="text-sm">🎉 Goal reached!</span>
		{/if}
	</div>

	<!-- Progress bar -->
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

	<!-- Stats row -->
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
