<script lang="ts">
	import type { components } from '$lib/api-types';
	import type { PlannerPageData } from './+page';
	import { apiFetch } from '$lib/api';
	import { getCookieValue } from '$lib/browser/cookies';
	import PlannerUtilityBar from '$lib/components/planner/PlannerUtilityBar.svelte';
	import PlannerGrid from '$lib/components/planner/PlannerGrid.svelte';
	import PlannerAddModal from '$lib/components/planner/PlannerAddModal.svelte';
	import PlannerSidebar from '$lib/components/planner/PlannerSidebar.svelte';
	import PlannerProgress from '$lib/components/planner/PlannerProgress.svelte';
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { CalendarWeekOutline } from 'flowbite-svelte-icons';
	import { resolve } from '$app/paths';
	import { untrack } from 'svelte';

	type MealPlanResponse = components['schemas']['MealPlanResponse'];
	type MealPlanEntry = components['schemas']['MealPlanEntry'];
	type MealAttendee = components['schemas']['MealAttendee'];
	type RecipeSummary = components['schemas']['RecipeSummary'];
	type PlantStats = components['schemas']['PlantStats'];
	type HouseholdMemberSummary = components['schemas']['HouseholdMemberSummary'];

	let { data }: { data: PlannerPageData } = $props();

	let weekStart = $state(untrack(() => data.plan?.weekStart ?? data.initialWeek));
	let entries = $state<MealPlanEntry[]>(untrack(() => data.plan?.entries ?? []));
	let stats = $state(untrack(() => data.plan?.stats ?? { planned: 0, total: 21, withAlerts: 0 }));
	let plantStats = $state<PlantStats>(untrack(() => data.plan?.plantStats ?? { uniquePlants: 0, plantNames: [], colourCounts: [] }));
	let members = $state<HouseholdMemberSummary[]>(untrack(() => data.plan?.members ?? []));
	let allRecipes = $state<RecipeSummary[]>(untrack(() => data.recipes?.items ?? []));
	let sidebarRecipes = $state<RecipeSummary[]>(untrack(() => data.recipes?.items ?? []));
	let isLoading = $state(false);
	let isRepeating = $state(false);

	// Modal state
	let modalOpen = $state(false);
	let modalDate = $state('');
	let modalMealType = $state('');
	let modalRecipes = $state<RecipeSummary[]>([]);
	let modalLoading = $state(false);

	async function loadWeek(week: string) {
		isLoading = true;
		try {
			const plan = await apiFetch<MealPlanResponse>(`/api/planner?week=${week}`);
			weekStart = plan.weekStart;
			entries = plan.entries;
			stats = plan.stats;
			plantStats = plan.plantStats;
			members = plan.members;
		} catch {
			// Keep current state on error
		} finally {
			isLoading = false;
		}
	}

	function navigatePreviousWeek() {
		const d = new Date(weekStart + 'T00:00:00Z');
		d.setUTCDate(d.getUTCDate() - 7);
		loadWeek(d.toISOString().slice(0, 10));
	}

	function navigateNextWeek() {
		const d = new Date(weekStart + 'T00:00:00Z');
		d.setUTCDate(d.getUTCDate() + 7);
		loadWeek(d.toISOString().slice(0, 10));
	}

	function navigateToday() {
		const now = new Date();
		const day = now.getDay();
		const diff = day === 0 ? -6 : 1 - day;
		const monday = new Date(now);
		monday.setDate(now.getDate() + diff);
		loadWeek(monday.toISOString().slice(0, 10));
	}

	async function handleRepeatLastWeek() {
		isRepeating = true;
		try {
			const csrf = getCookieValue('csrf-token');
			await apiFetch<{ copied: number; weekStart: string }>('/api/planner/repeat', {
				method: 'POST',
				headers: csrf ? { 'x-csrf-token': csrf } : {},
				body: JSON.stringify({ targetWeekStart: weekStart })
			});
			await loadWeek(weekStart);
		} catch {
			// Silently fail for now
		} finally {
			isRepeating = false;
		}
	}

	function handleAddClick(date: string, mealType: string) {
		modalDate = date;
		modalMealType = mealType;
		modalRecipes = allRecipes;
		modalOpen = true;
	}

	function handleModalSearch(query: string) {
		const q = query.toLowerCase().trim();
		if (!q) {
			modalRecipes = allRecipes;
			return;
		}
		modalRecipes = allRecipes.filter(
			(r) =>
				r.title.toLowerCase().includes(q) ||
				r.tags.some((t) => t.toLowerCase().includes(q))
		);
	}

	function handleSidebarSearch(query: string) {
		const q = query.toLowerCase().trim();
		if (!q) {
			sidebarRecipes = allRecipes;
			return;
		}
		sidebarRecipes = allRecipes.filter(
			(r) =>
				r.title.toLowerCase().includes(q) ||
				r.tags.some((t) => t.toLowerCase().includes(q))
		);
	}

	async function handleSelectRecipe(recipeId: string) {
		const csrf = getCookieValue('csrf-token');
		try {
			await apiFetch<MealPlanEntry>('/api/planner/entries', {
				method: 'POST',
				headers: csrf ? { 'x-csrf-token': csrf } : {},
				body: JSON.stringify({
					weekStart,
					entryDate: modalDate,
					mealType: modalMealType,
					recipeId
				})
			});
			await loadWeek(weekStart);
		} catch {
			// Silently fail
		}
	}

	async function handleCustomNote(note: string) {
		const csrf = getCookieValue('csrf-token');
		try {
			await apiFetch<MealPlanEntry>('/api/planner/entries', {
				method: 'POST',
				headers: csrf ? { 'x-csrf-token': csrf } : {},
				body: JSON.stringify({
					weekStart,
					entryDate: modalDate,
					mealType: modalMealType,
					customNote: note
				})
			});
			await loadWeek(weekStart);
		} catch {
			// Silently fail
		}
	}

	async function handleRemoveEntry(entryId: string) {
		const csrf = getCookieValue('csrf-token');
		try {
			await apiFetch<undefined>(`/api/planner/entries/${entryId}`, {
				method: 'DELETE',
				headers: csrf ? { 'x-csrf-token': csrf } : {}
			});
			entries = entries.filter((e) => e.id !== entryId);
			stats = {
				...stats,
				planned: entries.length,
				withAlerts: entries.filter((e) => !e.compatibility.safe).length
			};
			// Reload to get accurate plant stats
			await loadWeek(weekStart);
		} catch {
			// Silently fail
		}
	}

	async function handleAttendanceUpdate(entryId: string, attendees: MealAttendee[], guestCovers: number) {
		// Optimistic update
		entries = entries.map((e) =>
			e.id === entryId
				? { ...e, attendees, guestCovers, servings: attendees.filter((a) => a.isAttending).length + guestCovers }
				: e
		);

		const csrf = getCookieValue('csrf-token');
		try {
			const entry = entries.find((e) => e.id === entryId);
			if (!entry) return;

			const absentMemberIds = attendees
				.filter((a) => !a.isAttending)
				.map((a) => a.memberId);

			await apiFetch<MealPlanEntry>('/api/planner/entries', {
				method: 'POST',
				headers: csrf ? { 'x-csrf-token': csrf } : {},
				body: JSON.stringify({
					weekStart,
					entryDate: entry.entryDate,
					mealType: entry.mealType,
					recipeId: entry.recipe?.id,
					customNote: entry.customNote,
					absentMemberIds,
					guestCovers
				})
			});
			await loadWeek(weekStart);
		} catch {
			// Revert on failure by reloading
			await loadWeek(weekStart);
		}
	}

	function handleEditEntry(entry: MealPlanEntry) {
		// Re-open modal for the same cell to replace
		modalDate = entry.entryDate;
		modalMealType = entry.mealType;
		modalRecipes = allRecipes;
		modalOpen = true;
	}
</script>

<svelte:head>
	<title>Meal Planner | FussyEater.club</title>
</svelte:head>

{#if data.error === 'unauthenticated'}
	<main class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
		<EmptyState
			heading="Sign in to plan meals"
			description="Log in to start planning your family's weekly meals."
			actionLabel="Log in"
			actionHref={resolve('/login')}
		>
			{#snippet icon()}
				<CalendarWeekOutline class="h-12 w-12 text-primary-400" />
			{/snippet}
		</EmptyState>
	</main>
{:else if data.error === 'no-household'}
	<main class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
		<EmptyState
			heading="Join a household first"
			description="You need to be part of a household to use the meal planner. Create or join one from your household settings."
			actionLabel="Go to Household"
			actionHref={resolve('/household')}
		>
			{#snippet icon()}
				<CalendarWeekOutline class="h-12 w-12 text-primary-400" />
			{/snippet}
		</EmptyState>
	</main>
{:else if data.error}
	<main class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
		<EmptyState
			heading="Something went wrong"
			description="We couldn't load the meal planner. Please try again."
		>
			{#snippet icon()}
				<CalendarWeekOutline class="h-12 w-12 text-slate-400" />
			{/snippet}
		</EmptyState>
	</main>
{:else}
	<PlannerUtilityBar
		{weekStart}
		onPreviousWeek={navigatePreviousWeek}
		onNextWeek={navigateNextWeek}
		onToday={navigateToday}
		onRepeatLastWeek={handleRepeatLastWeek}
		{isRepeating}
	/>

	<main class="mx-auto max-w-7xl px-4 py-6 md:px-6">
		<div class="flex gap-6">
			<!-- Main grid area -->
			<div class="min-w-0 flex-1">
				{#if isLoading}
					<div class="py-12 text-center text-slate-400">Loading week plan…</div>
				{:else}
					<PlannerGrid
						{weekStart}
						{entries}
						{members}
						onAddClick={handleAddClick}
						onRemoveEntry={handleRemoveEntry}
						onEditEntry={handleEditEntry}
						onAttendanceUpdate={handleAttendanceUpdate}
					/>

					<!-- Progress section -->
					<div class="mt-6">
						<PlannerProgress
							planned={stats.planned}
							total={stats.total}
							withAlerts={stats.withAlerts}
							{plantStats}
						/>
					</div>
				{/if}
			</div>

			<!-- Desktop sidebar -->
			<div class="hidden lg:block">
				<PlannerSidebar
					recipes={sidebarRecipes}
					onSearch={handleSidebarSearch}
					onSelectRecipe={() => {}}
				/>
			</div>
		</div>
	</main>

	<!-- Add/Edit modal -->
	<PlannerAddModal
		bind:open={modalOpen}
		date={modalDate}
		mealType={modalMealType}
		recipes={modalRecipes}
		loading={modalLoading}
		onSelect={handleSelectRecipe}
		onCustomNote={handleCustomNote}
		onSearch={handleModalSearch}
	/>
{/if}
