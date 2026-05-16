<script lang="ts">
	import EmptyState from '$lib/components/ui/EmptyState.svelte';
	import { UsersGroupOutline } from 'flowbite-svelte-icons';
	import type { components } from '$lib/api-types';

	type HouseholdMember = components['schemas']['HouseholdMember'];

	let { members }: { members: HouseholdMember[] } = $props();
</script>

{#if members.length === 0}
	<EmptyState heading="No members yet" description="Invite your family to get started.">
		{#snippet icon()}
			<UsersGroupOutline class="h-12 w-12 text-primary-400" />
		{/snippet}
	</EmptyState>
{:else}
	<div class="space-y-3">
		{#each members as member (member.userId)}
			<div class="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700"
				>
					{member.name.charAt(0).toUpperCase()}
				</div>
				<div class="min-w-0 flex-1">
					<p class="font-medium text-slate-900">{member.name}</p>
					<p class="text-sm text-slate-500">{member.email}</p>
				</div>
				<span
					class="rounded-full px-3 py-0.5 text-xs font-medium capitalize {member.role === 'owner'
						? 'bg-amber-100 text-amber-800'
						: member.role === 'admin'
							? 'bg-primary-100 text-primary-800'
							: member.role === 'viewer'
								? 'bg-slate-100 text-slate-500'
								: 'bg-slate-100 text-slate-700'}"
				>
					{member.role}
				</span>
			</div>
		{/each}
	</div>
{/if}
