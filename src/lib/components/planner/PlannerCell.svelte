<script lang="ts">
	import type { components } from '$lib/api-types';
	import CompatibilityBadge from './CompatibilityBadge.svelte';
	import AttendanceIndicator from './AttendanceIndicator.svelte';
	import AttendancePopover from './AttendancePopover.svelte';
	import { resolve } from '$app/paths';

	type MealPlanEntry = components['schemas']['MealPlanEntry'];
	type MealAttendee = components['schemas']['MealAttendee'];
	type HouseholdMemberSummary = components['schemas']['HouseholdMemberSummary'];

	let {
		entry,
		members,
		onRemove,
		onEdit,
		onAttendanceUpdate
	}: {
		entry: MealPlanEntry;
		members: HouseholdMemberSummary[];
		onRemove: (id: string) => void;
		onEdit: (entry: MealPlanEntry) => void;
		onAttendanceUpdate: (entryId: string, attendees: MealAttendee[], guestCovers: number) => void;
	} = $props();

	let menuOpen = $state(false);
	let popoverOpen = $state(false);

	function handleAttendanceSave(attendees: MealAttendee[], guestCovers: number) {
		onAttendanceUpdate(entry.id, attendees, guestCovers);
	}
</script>

{#if entry.recipe}
	<div
		class="group relative h-full rounded-xl bg-white p-2 shadow-sm transition-shadow hover:shadow-md"
		class:border-l-4={!entry.compatibility.safe}
		class:border-l-amber-400={!entry.compatibility.safe}
	>
		<!-- Compatibility badge -->
		<div class="absolute right-1 top-1">
			<CompatibilityBadge compatibility={entry.compatibility} />
		</div>

		<!-- Overflow menu -->
		<div class="absolute right-1 bottom-1">
			<button
				onclick={() => (menuOpen = !menuOpen)}
				class="rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
				aria-label="More actions"
			>
				⋮
			</button>

			{#if menuOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed inset-0 z-40"
					onclick={() => (menuOpen = false)}
				></div>
				<div
					class="absolute right-0 bottom-6 z-50 w-36 rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
				>
					<button
						class="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
						onclick={() => {
							onEdit(entry);
							menuOpen = false;
						}}
					>
						Edit entry
					</button>
					<button
						class="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
						onclick={() => {
							popoverOpen = true;
							menuOpen = false;
						}}
					>
						Manage attendance
					</button>
					<a
						href={resolve(`/recipes/${entry.recipe.id}`)}
						class="block px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
					>
						View recipe
					</a>
					<button
						class="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
						onclick={() => {
							onRemove(entry.id);
							menuOpen = false;
						}}
					>
						Remove
					</button>
				</div>
			{/if}
		</div>

		<!-- Recipe info -->
		{#if entry.recipe.imageUrl}
			<img
				src={entry.recipe.imageUrl}
				alt={entry.recipe.title}
				class="mb-1 h-10 w-full rounded-lg object-cover"
			/>
		{/if}
		<p class="line-clamp-2 text-xs font-medium text-slate-800" title={entry.recipe.title}>
			{entry.recipe.title}
		</p>
		{#if entry.recipe.timings}
			<p class="mt-0.5 text-[10px] text-slate-400">
				{#if entry.recipe.timings.prepMinutes != null && entry.recipe.timings.cookMinutes != null}
					{entry.recipe.timings.prepMinutes + entry.recipe.timings.cookMinutes} min
				{:else if entry.recipe.timings.prepMinutes != null}
					{entry.recipe.timings.prepMinutes} min prep
				{:else if entry.recipe.timings.cookMinutes != null}
					{entry.recipe.timings.cookMinutes} min cook
				{/if}
			</p>
		{/if}
		{#if entry.notes}
			<p class="mt-0.5 truncate text-[10px] italic text-slate-400" title={entry.notes}>
				{entry.notes}
			</p>
		{/if}
		<!-- Attendance indicator -->
		<div class="relative">
			<AttendanceIndicator
				attendees={entry.attendees}
				guestCovers={entry.guestCovers}
				onclick={() => (popoverOpen = !popoverOpen)}
			/>
			{#if popoverOpen}
				<AttendancePopover
					attendees={entry.attendees}
					guestCovers={entry.guestCovers}
					{members}
					onSave={handleAttendanceSave}
					onClose={() => (popoverOpen = false)}
				/>
			{/if}
		</div>
	</div>
{:else if entry.customNote}
	<div
		class="group relative h-full rounded-xl bg-slate-50 p-2"
	>
		<div class="absolute right-1 bottom-1">
			<button
				onclick={() => (menuOpen = !menuOpen)}
				class="rounded p-0.5 text-slate-400 opacity-0 transition-opacity hover:bg-slate-100 hover:text-slate-600 group-hover:opacity-100"
				aria-label="More actions"
			>
				⋮
			</button>

			{#if menuOpen}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="fixed inset-0 z-40"
					onclick={() => (menuOpen = false)}
				></div>
				<div
					class="absolute right-0 bottom-6 z-50 w-36 rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
				>
					<button
						class="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
						onclick={() => {
							onEdit(entry);
							menuOpen = false;
						}}
					>
						Edit note
					</button>
					<button
						class="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50"
						onclick={() => {
							popoverOpen = true;
							menuOpen = false;
						}}
					>
						Manage attendance
					</button>
					<button
						class="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50"
						onclick={() => {
							onRemove(entry.id);
							menuOpen = false;
						}}
					>
						Remove
					</button>
				</div>
			{/if}
		</div>

		<p class="line-clamp-2 text-xs text-slate-600" title={entry.customNote}>
			📝 {entry.customNote}
		</p>
		<!-- Attendance indicator -->
		<div class="relative">
			<AttendanceIndicator
				attendees={entry.attendees}
				guestCovers={entry.guestCovers}
				onclick={() => (popoverOpen = !popoverOpen)}
			/>
			{#if popoverOpen}
				<AttendancePopover
					attendees={entry.attendees}
					guestCovers={entry.guestCovers}
					{members}
					onSave={handleAttendanceSave}
					onClose={() => (popoverOpen = false)}
				/>
			{/if}
		</div>
	</div>
{/if}
