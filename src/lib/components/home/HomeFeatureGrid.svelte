<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import {
		AdjustmentsHorizontalOutline,
		CalendarWeekOutline,
		CartPlusOutline
	} from 'flowbite-svelte-icons';

	const features = [
		{
			title: 'Granular Filtering',
			description:
				'Filter recipes by texture, colour, temperature and more — designed for picky eaters with strong preferences.',
			icon: AdjustmentsHorizontalOutline,
			iconLabel: 'Granular filtering'
		},
		{
			title: 'Stress-Free Planning',
			description:
				'Drag and drop meals onto a weekly calendar so dinner decisions are made once, not every night.',
			icon: CalendarWeekOutline,
			iconLabel: 'Stress-free planning'
		},
		{
			title: 'Smart Shopping Lists',
			description:
				'Auto-generated, allergen-aware shopping lists organised by aisle — no more forgotten ingredients.',
			icon: CartPlusOutline,
			iconLabel: 'Smart shopping lists'
		}
	];
</script>

<section id="how-it-works" class="space-y-12">
	<div class="text-center">
		<h2 class="text-3xl font-bold text-slate-900">How It Works</h2>
		<p class="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
			Three simple steps to take the stress out of mealtimes for fussy eaters and their families.
		</p>
	</div>

	<div class="grid gap-8 md:grid-cols-3">
		{#each features as feature (feature.title)}
			<Card class="border-slate-200/60 bg-white shadow-sm transition-shadow hover:shadow-md">
				<div class="flex flex-col items-center space-y-4 p-6 text-center">
					<div class="rounded-full bg-primary-100 p-3">
						<feature.icon class="h-10 w-10 text-primary-600" aria-label={feature.iconLabel} />
					</div>
					<h3 class="text-lg font-semibold text-slate-900">{feature.title}</h3>
					<p class="text-base text-slate-600">{feature.description}</p>
				</div>
			</Card>
		{/each}
	</div>
</section>
