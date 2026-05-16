<script lang="ts">
    import type { PageData } from './$types';
    import HouseholdMemberList from '$lib/components/household/HouseholdMemberList.svelte';
    import HouseholdInviteSection from '$lib/components/household/HouseholdInviteSection.svelte';
    import HouseholdProfileEditor from '$lib/components/household/HouseholdProfileEditor.svelte';

    let { data }: { data: PageData } = $props();
    let activeTab = $state<'family' | 'profiles'>('family');

    const members = $derived(data.members ?? []);
    const invites = $derived(data.invites ?? []);
    const profiles = $derived(data.profiles ?? []);
    const syncEnabled = $derived(data.syncEnabled ?? false);
    const loadError = $derived(data.loadError ?? '');
</script>

<main class="bg-slate-50">
    <div class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
        <h1 class="text-2xl font-semibold text-slate-900">Household</h1>
        <p class="mt-2 text-base text-slate-600">Manage members and household invites.</p>
        {#if loadError}
            <p class="mt-3 rounded-xl bg-red-50 p-4 text-sm text-red-700">{loadError}</p>
        {/if}

        <!-- Tab Navigation -->
        <div class="mt-8 border-b border-slate-200">
            <nav class="-mb-px flex gap-2" aria-label="Tabs">
                <button
                    type="button"
                    class="px-4 py-3 text-sm {activeTab === 'family'
                        ? 'border-b-2 border-primary-600 font-semibold text-primary-700'
                        : 'text-slate-500 hover:text-slate-700'}"
                    onclick={() => (activeTab = 'family')}
                >
                    Family
                </button>
                <button
                    type="button"
                    class="px-4 py-3 text-sm {activeTab === 'profiles'
                        ? 'border-b-2 border-primary-600 font-semibold text-primary-700'
                        : 'text-slate-500 hover:text-slate-700'}"
                    onclick={() => (activeTab = 'profiles')}
                >
                    Profiles
                </button>
            </nav>
        </div>

        {#if activeTab === 'family'}
            <div class="mt-8 space-y-8">
                <section>
                    <h2 class="text-lg font-semibold text-slate-900">Members</h2>
                    <div class="mt-4">
                        <HouseholdMemberList {members} />
                    </div>
                </section>

                <section>
                    <h2 class="text-lg font-semibold text-slate-900">Invite a Family Member</h2>
                    <div class="mt-4">
                        <HouseholdInviteSection initialInvites={invites} />
                    </div>
                </section>
            </div>
        {:else}
            <div class="mt-8">
                <HouseholdProfileEditor {profiles} {members} {syncEnabled} />
            </div>
        {/if}
    </div>
</main>
