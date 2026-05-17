<script lang="ts">
	import type { components } from '$lib/api-types';

	type CompatibilityResult = components['schemas']['CompatibilityResult'];

	let { compatibility }: { compatibility: CompatibilityResult } = $props();

	let tooltipVisible = $state(false);

	let hasAllergy = $derived(compatibility.hasAllergyAlert === true);
	let badgeBg = $derived(hasAllergy ? 'bg-red-50' : 'bg-amber-50');
	let badgeText = $derived(hasAllergy ? 'text-red-700' : 'text-amber-700');
</script>

{#if compatibility.safe}
	<span
		class="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700"
		title="Safe for all family members"
	>
		✓
	</span>
{:else}
	<span
		class="relative inline-flex items-center gap-0.5 rounded-full {badgeBg} px-1.5 py-0.5 text-xs font-medium {badgeText}"
		role="button"
		tabindex="0"
		onmouseenter={() => (tooltipVisible = true)}
		onmouseleave={() => (tooltipVisible = false)}
		onfocus={() => (tooltipVisible = true)}
		onblur={() => (tooltipVisible = false)}
	>
		⚠ {compatibility.alerts.length}

		{#if tooltipVisible}
			<div
				class="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl bg-slate-800 px-3 py-2 text-left text-xs text-white shadow-lg"
			>
				{#each compatibility.alerts as alert}
					<div class="py-0.5">
						<span class="font-semibold">{alert.memberName}</span>
						{#if alert.reason === 'allergy'}
							— allergic to <span class="text-red-300">{alert.ingredient}</span>
							{#if alert.severity}
								<span class="text-red-400">({alert.severity})</span>
							{/if}
						{:else}
							— dislikes <span class="text-amber-300">{alert.ingredient}</span>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</span>
{/if}
