<script lang="ts">
	import type { components } from '$lib/api-types';

	type MealAttendee = components['schemas']['MealAttendee'];

	let {
		attendees,
		guestCovers = 0,
		onclick
	}: {
		attendees: MealAttendee[];
		guestCovers: number;
		onclick?: () => void;
	} = $props();

	const COLOURS = [
		'bg-blue-500',
		'bg-emerald-500',
		'bg-amber-500',
		'bg-rose-500',
		'bg-violet-500',
		'bg-cyan-500',
		'bg-orange-500',
		'bg-teal-500'
	];

	function colourForName(name: string): string {
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = (hash * 31 + name.charCodeAt(i)) | 0;
		}
		return COLOURS[Math.abs(hash) % COLOURS.length];
	}

	function initial(name: string): string {
		return name.charAt(0).toUpperCase();
	}

	let attendingCount = $derived(attendees.filter((a) => a.isAttending).length + guestCovers);
</script>

<button
	type="button"
	class="mt-1 flex items-center gap-0.5"
	{onclick}
	aria-label="Manage attendance ({attendingCount} eating)"
	title="{attendingCount} eating"
>
	{#each attendees as attendee (attendee.memberId)}
		<span
			class={[
				'inline-flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold leading-none text-white transition-opacity',
				attendee.isAttending ? colourForName(attendee.memberName) : 'bg-slate-300',
				{ 'opacity-40': !attendee.isAttending }
			]}
			title="{attendee.memberName}{attendee.isAttending ? '' : ' (absent)'}"
		>
			{initial(attendee.memberName)}
		</span>
	{/each}
	{#if guestCovers > 0}
		<span class="ml-0.5 inline-flex h-4 items-center rounded-full bg-slate-200 px-1.5 text-[8px] font-medium text-slate-600">
			+{guestCovers}
		</span>
	{/if}
</button>
