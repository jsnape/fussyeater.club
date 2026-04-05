<script lang="ts">
    import { apiFetch, ApiError } from '$lib/api';
    import type { components } from '$lib/api-types';
    import type { PageData } from './$types';

    type HouseholdMember = components['schemas']['HouseholdMember'];
    type InviteStatus = components['schemas']['InviteStatus'];
    type CreateHouseholdInviteResponse = components['schemas']['CreateHouseholdInviteResponse'];

    let { data }: { data: PageData } = $props();
    const initialMembers = () => data.members ?? [];
    const initialInvites = () => data.invites ?? [];
    const initialLoadError = () => data.loadError ?? '';

    let members = $state.raw<HouseholdMember[]>(initialMembers());
    let invites = $state.raw<InviteStatus[]>(initialInvites());
    let loadError = $state(initialLoadError());

    let maxUses = $state(3);
    let expiresInDays = $state(7);
    let isSubmitting = $state(false);
    let isRevokingInviteId = $state('');
    let actionMessage = $state('');
    let actionError = $state('');
    let revealInviteCode = $state('');

    const sortedInvites = $derived([...invites].sort((a, b) => b.expiresAt.localeCompare(a.expiresAt)));

    function getCookieValue(name: string): string | null {
        const token = document.cookie
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith(`${name}=`))
            ?.slice(name.length + 1);
        return token ? decodeURIComponent(token) : null;
    }

    function mutationErrorMessage(status: number, action: 'create' | 'regenerate' | 'revoke'): string {
        if (status === 403) {
            return 'Only the household owner can manage invites.';
        }
        if (status === 409) {
            return 'Duplicate request in progress. Please wait and retry.';
        }
        if (status === 429) {
            return 'Too many requests right now. Please try again in a moment.';
        }
        if (status === 503) {
            return 'Invite service is temporarily unavailable.';
        }
        if (status === 404 && action === 'revoke') {
            return 'Invite was not found. It may already be revoked.';
        }
        return 'Could not update invites right now.';
    }

    async function refreshInvites(): Promise<void> {
        const response = await apiFetch<{ invites: InviteStatus[] }>('/api/households/invites');
        invites = response.invites;
    }

    async function createInvite(regenerate: boolean): Promise<void> {
        actionMessage = '';
        actionError = '';
        revealInviteCode = '';
        isSubmitting = true;
        const actionLabel = regenerate ? 'regenerate' : 'create';
        try {
            const csrfToken = getCookieValue('csrf-token');
            const response = await apiFetch<CreateHouseholdInviteResponse>('/api/households/invites', {
                method: 'POST',
                headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
                body: JSON.stringify({
                    maxUses,
                    expiresInDays,
                    regenerate,
                    idempotencyKey: crypto.randomUUID()
                })
            });
            revealInviteCode = response.code;
            actionMessage = regenerate ? 'Invite regenerated.' : 'Invite created.';
            await refreshInvites();
        } catch (error) {
            if (error instanceof ApiError) {
                actionError = mutationErrorMessage(error.status, actionLabel);
            } else {
                actionError = 'Could not update invites right now.';
            }
        } finally {
            isSubmitting = false;
        }
    }

    async function revokeInvite(inviteId: string): Promise<void> {
        actionMessage = '';
        actionError = '';
        revealInviteCode = '';
        isRevokingInviteId = inviteId;
        try {
            const csrfToken = getCookieValue('csrf-token');
            await apiFetch('/api/households/invites/' + inviteId, {
                method: 'DELETE',
                headers: csrfToken ? { 'x-csrf-token': csrfToken } : {}
            });
            actionMessage = 'Invite revoked.';
            await refreshInvites();
        } catch (error) {
            if (error instanceof ApiError) {
                actionError = mutationErrorMessage(error.status, 'revoke');
            } else {
                actionError = 'Could not update invites right now.';
            }
        } finally {
            isRevokingInviteId = '';
        }
    }
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
    <div class="mx-auto max-w-6xl space-y-8">
        <section class="rounded-lg border border-primary-200 bg-white p-6 shadow-sm">
            <h1 class="text-2xl font-semibold text-primary-900">Household</h1>
            <p class="mt-2 text-sm text-primary-700">Manage members and household invites.</p>
            {#if loadError}
                <p class="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>
            {/if}
        </section>

        <section class="rounded-lg border border-primary-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-primary-900">Members</h2>
            {#if members.length === 0}
                <p class="mt-3 text-sm text-primary-700">No members found.</p>
            {:else}
                <div class="mt-4 overflow-x-auto">
                    <table class="min-w-full text-left text-sm text-primary-900">
                        <thead class="border-b border-primary-200 text-xs uppercase tracking-wide text-primary-700">
                            <tr>
                                <th class="py-2 pr-4">Name</th>
                                <th class="py-2 pr-4">Email</th>
                                <th class="py-2 pr-4">Role</th>
                                <th class="py-2">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each members as member (member.userId)}
                                <tr class="border-b border-primary-100">
                                    <td class="py-2 pr-4">{member.name}</td>
                                    <td class="py-2 pr-4">{member.email}</td>
                                    <td class="py-2 pr-4 capitalize">{member.role}</td>
                                    <td class="py-2">{new Date(member.joinedAt).toLocaleDateString()}</td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </section>

        <section class="rounded-lg border border-primary-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-primary-900">Invites</h2>

            <div class="mt-4 grid gap-3 md:grid-cols-3">
                <label class="text-sm text-primary-800" for="max-uses">
                    Max uses
                    <input
                        id="max-uses"
                        class="mt-1 w-full rounded-md border border-primary-300 px-3 py-2"
                        type="number"
                        min="1"
                        bind:value={maxUses}
                    />
                </label>
                <label class="text-sm text-primary-800" for="expires-in-days">
                    Expires in days
                    <input
                        id="expires-in-days"
                        class="mt-1 w-full rounded-md border border-primary-300 px-3 py-2"
                        type="number"
                        min="1"
                        bind:value={expiresInDays}
                    />
                </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
                <button
                    type="button"
                    class="rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    onclick={() => void createInvite(false)}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Saving…' : 'Create invite'}
                </button>
                <button
                    type="button"
                    class="rounded-md border border-primary-300 bg-white px-4 py-2 text-sm font-semibold text-primary-900 disabled:opacity-60"
                    onclick={() => void createInvite(true)}
                    disabled={isSubmitting}
                >
                    Regenerate invite
                </button>
            </div>

            {#if revealInviteCode}
                <p class="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
                    New invite code: <span class="font-semibold">{revealInviteCode}</span>
                </p>
            {/if}
            {#if actionMessage}
                <p class="mt-3 text-sm text-green-700">{actionMessage}</p>
            {/if}
            {#if actionError}
                <p class="mt-3 text-sm text-red-700">{actionError}</p>
            {/if}

            {#if sortedInvites.length === 0}
                <p class="mt-4 text-sm text-primary-700">No invites yet.</p>
            {:else}
                <div class="mt-4 overflow-x-auto">
                    <table class="min-w-full text-left text-sm text-primary-900">
                        <thead class="border-b border-primary-200 text-xs uppercase tracking-wide text-primary-700">
                            <tr>
                                <th class="py-2 pr-4">Code</th>
                                <th class="py-2 pr-4">Status</th>
                                <th class="py-2 pr-4">Uses</th>
                                <th class="py-2 pr-4">Expires</th>
                                <th class="py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each sortedInvites as invite (invite.id)}
                                <tr class="border-b border-primary-100">
                                    <td class="py-2 pr-4">{invite.codeMasked}</td>
                                    <td class="py-2 pr-4 capitalize">{invite.status}</td>
                                    <td class="py-2 pr-4">{invite.remainingUses}/{invite.maxUses}</td>
                                    <td class="py-2 pr-4">{new Date(invite.expiresAt).toLocaleDateString()}</td>
                                    <td class="py-2">
                                        <button
                                            type="button"
                                            class="text-sm font-medium text-primary-900 underline disabled:opacity-50"
                                            onclick={() => void revokeInvite(invite.id)}
                                            disabled={isRevokingInviteId === invite.id || invite.status === 'revoked'}
                                        >
                                            {isRevokingInviteId === invite.id ? 'Revoking…' : 'Revoke'}
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </section>
    </div>
</main>
