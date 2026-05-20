<script lang="ts">
	import type { components } from '$lib/api-types';
	import { untrack } from 'svelte';

	type MealAttendee = components['schemas']['MealAttendee'];
	type HouseholdMemberSummary = components['schemas']['HouseholdMemberSummary'];

	let {
		attendees,
		guestCovers,
		members,
		onSave,
		onClose
	}: {
		attendees: MealAttendee[];
		guestCovers: number;
		members: HouseholdMemberSummary[];
		onSave: (attendees: MealAttendee[], guestCovers: number) => void;
		onClose: () => void;
	} = $props();

	// Snapshot props into local state — the parent destroys/recreates this component
	// each time the popover opens, so capturing initial values is intentional
	let localAttendees = $state.raw(untrack(() => attendees.map((a) => ({ ...a }))));
	let localGuestCovers = $state(untrack(() => guestCovers));

	let servings = $derived(
		localAttendees.filter((a) => a.isAttending).length + localGuestCovers
	);

	// Position the popover using fixed coordinates to escape overflow clipping
	let anchorEl: HTMLElement | undefined = $state(undefined);
	let popoverStyle = $state('');

	$effect(() => {
		if (anchorEl) {
			const rect = anchorEl.getBoundingClientRect();
			const popoverWidth = 224;
			const estimatedHeight = 300;
			const left = Math.max(8, rect.right - popoverWidth);
			const spaceBelow = window.innerHeight - rect.bottom;

			if (spaceBelow >= estimatedHeight) {
				popoverStyle = `top: ${rect.bottom + 8}px; left: ${left}px;`;
			} else {
				popoverStyle = `bottom: ${window.innerHeight - rect.top + 8}px; left: ${left}px;`;
			}
		}
	});

	function toggleMember(memberId: string) {
		localAttendees = localAttendees.map((a) =>
			a.memberId === memberId ? { ...a, isAttending: !a.isAttending } : a
		);
	}

	function incrementGuests() {
		localGuestCovers++;
	}

	function decrementGuests() {
		if (localGuestCovers > 0) localGuestCovers--;
	}

	function handleDone() {
		onSave(localAttendees, localGuestCovers);
		onClose();
	}

	function handleClickOutside() {
		onSave(localAttendees, localGuestCovers);
		onClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onSave(localAttendees, localGuestCovers);
			onClose();
		}
	}


</script>

<svelte:window onkeydown={handleKeydown} />

<span bind:this={anchorEl} class="absolute bottom-0 right-0"></span>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-40"
	onclick={handleClickOutside}
></div>

<div class="fixed z-50 w-56 rounded-xl bg-white p-3 shadow-lg ring-1 ring-slate-200" style={popoverStyle}>
	<h4 class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
		Who's eating?
	</h4>

	<div class="space-y-1">
		{#each localAttendees as attendee (attendee.memberId)}
			<label class="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
				<input
					type="checkbox"
					checked={attendee.isAttending}
					onchange={() => toggleMember(attendee.memberId)}
					class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
				/>
				<span class="text-sm text-slate-700">
					{attendee.memberName}
				</span>
			</label>
		{/each}
	</div>

	<div class="mt-3 border-t border-slate-100 pt-3">
		<div class="flex items-center justify-between">
			<span class="text-sm text-slate-600">Guests</span>
			<div class="flex items-center gap-2">
				<button
					type="button"
					onclick={decrementGuests}
					disabled={localGuestCovers === 0}
					class="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-30"
					aria-label="Decrease guests"
				>
					−
				</button>
				<span class="w-4 text-center text-sm font-medium text-slate-700">
					{localGuestCovers}
				</span>
				<button
					type="button"
					onclick={incrementGuests}
					class="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-xs text-slate-600 transition-colors hover:bg-slate-100"
					aria-label="Increase guests"
				>
					+
				</button>
			</div>
		</div>
	</div>

	<div class="mt-3 border-t border-slate-100 pt-3">
		<div class="flex items-center justify-between">
			<span class="text-xs text-slate-400">🍽️ {servings} serving{servings !== 1 ? 's' : ''}</span>
			<button
				type="button"
				onclick={handleDone}
				class="rounded-lg bg-primary-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-primary-700"
			>
				Done
			</button>
		</div>
	</div>
</div>
