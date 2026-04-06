<script lang="ts">
    import { apiFetch, ApiError } from '$lib/api';
    import { getCookieValue } from '$lib/browser/cookies';
    import type { components } from '$lib/api-types';
    import type { PageData } from './$types';

    type HouseholdMember = components['schemas']['HouseholdMember'];
    type InviteStatus = components['schemas']['InviteStatus'];
    type CreateHouseholdInviteResponse = components['schemas']['CreateHouseholdInviteResponse'];
    type ListHouseholdInvitesResponse = components['schemas']['ListHouseholdInvitesResponse'];

    let { data }: { data: PageData } = $props();
    const initialMembers = () => data.members ?? [];
    const initialInvites = () => data.invites ?? [];
    const initialLoadError = () => data.loadError ?? '';

    let members = $state<HouseholdMember[]>(initialMembers());
    let invites = $state<InviteStatus[]>(initialInvites());
    let loadError = $state(initialLoadError());

    let maxUses = $state(3);
    let expiresInDays = $state(7);
    let isSubmitting = $state(false);
    let isRevokingInviteId = $state('');
    let actionMessage = $state('');
    let actionError = $state('');
    let revealInviteCode = $state('');
    let pendingCreateIdempotencyKey = $state('');
    let pendingRegenerateIdempotencyKey = $state('');

    const displayInvites = $derived([...invites]);
    const activeInvite = $derived(
        displayInvites.find((invite) => invite.status === 'active') ?? null
    );
    const expiredInvites = $derived(displayInvites.filter((invite) => invite.status !== 'active'));

    function usedInviteCount(invite: InviteStatus): number {
        const usedCount = invite.maxUses - invite.remainingUses;
        return usedCount < 0 ? 0 : usedCount;
    }

    const canCopyActiveInviteLink = $derived(Boolean(revealInviteCode.trim()));

    function mutationErrorMessage(args: {
        status: number;
        action: 'create' | 'regenerate' | 'revoke';
    }): string {
        const { status, action } = args;
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
        const response = await apiFetch<ListHouseholdInvitesResponse>('/api/households/invites');
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
            let idempotencyKey = '';
            if (regenerate) {
                if (!pendingRegenerateIdempotencyKey) {
                    pendingRegenerateIdempotencyKey = crypto.randomUUID();
                }
                idempotencyKey = pendingRegenerateIdempotencyKey;
            } else {
                if (!pendingCreateIdempotencyKey) {
                    pendingCreateIdempotencyKey = crypto.randomUUID();
                }
                idempotencyKey = pendingCreateIdempotencyKey;
            }
            const response = await apiFetch<CreateHouseholdInviteResponse>(
                '/api/households/invites',
                {
                    method: 'POST',
                    headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
                    body: JSON.stringify({
                        maxUses,
                        expiresInDays,
                        regenerate,
                        idempotencyKey
                    })
                }
            );
            revealInviteCode = response.code;
            actionMessage = regenerate ? 'Invite regenerated.' : 'Invite created.';
            if (regenerate) {
                pendingRegenerateIdempotencyKey = '';
            } else {
                pendingCreateIdempotencyKey = '';
            }
            await refreshInvites();
        } catch (error) {
            if (error instanceof ApiError) {
                actionError = mutationErrorMessage({ status: error.status, action: actionLabel });
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
                actionError = mutationErrorMessage({ status: error.status, action: 'revoke' });
            } else {
                actionError = 'Could not update invites right now.';
            }
        } finally {
            isRevokingInviteId = '';
        }
    }

    function isRevokeDisabled(invite: InviteStatus): boolean {
        return isRevokingInviteId === invite.id || invite.status === 'revoked';
    }

    function revokeInviteAriaLabel(invite: InviteStatus): string {
        if (invite.status === 'revoked') {
            return 'Invite already revoked';
        }
        if (isRevokingInviteId === invite.id) {
            return 'Revoking invite';
        }
        return 'Revoke invite';
    }

    function displayedActiveInviteCode(): string {
        if (revealInviteCode) {
            return revealInviteCode;
        }
        return activeInvite?.codeMasked ?? '';
    }

    async function copyActiveInviteLink(): Promise<void> {
        actionMessage = '';
        actionError = '';
        if (!revealInviteCode) {
            actionError =
                'Full invite code not available. Regenerate the invite to reveal and copy a new link.';
            return;
        }
        const code = revealInviteCode.trim();

        try {
            const registrationUrl = new URL('/register', window.location.origin);
            registrationUrl.searchParams.set('invite', code);
            await navigator.clipboard.writeText(registrationUrl.toString());
            actionMessage = 'Registration link copied.';
        } catch {
            actionError = 'Unable to copy invite link right now.';
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
                        <thead
                            class="border-b border-primary-200 text-xs tracking-wide text-primary-700 uppercase"
                        >
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
                                    <td class="py-2"
                                        >{new Date(member.joinedAt).toLocaleDateString()}</td
                                    >
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
                        aria-label="Max uses"
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
                        aria-label="Expires in days"
                        bind:value={expiresInDays}
                    />
                </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-3">
                {#if !activeInvite}
                    <button
                        type="button"
                        class="rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                        onclick={() => void createInvite(false)}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving…' : 'Create invite'}
                    </button>
                {/if}
            </div>
            <div aria-live="polite" role="status">
                {#if actionMessage}
                    <p class="mt-3 text-sm text-green-700">{actionMessage}</p>
                {/if}
            </div>
            <div aria-live="polite" role="status">
                {#if actionError}
                    <p class="mt-3 text-sm text-red-700">{actionError}</p>
                {/if}
            </div>

            {#if activeInvite}
                <div class="mt-4 rounded-md border border-primary-200 bg-primary-50 p-4">
                    <h3 class="text-sm font-semibold text-primary-900">Active Invite</h3>
                    <p class="mt-2 text-sm text-primary-800">
                        Code: <span class="font-semibold">{displayedActiveInviteCode()}</span>
                    </p>
                    <p class="mt-1 text-sm text-primary-800">
                        Uses: {usedInviteCount(activeInvite)} / {activeInvite.maxUses}
                    </p>
                    <p class="mt-1 text-sm text-primary-800">
                        Expires: {new Date(activeInvite.expiresAt).toLocaleDateString()}
                    </p>
                    <div class="mt-3 flex flex-wrap gap-3">
                        <button
                            type="button"
                            class="rounded-md border border-primary-300 bg-white px-3 py-1.5 text-sm font-medium text-primary-900 disabled:opacity-60"
                            onclick={() => void copyActiveInviteLink()}
                            disabled={!canCopyActiveInviteLink}
                        >
                            Copy Link
                        </button>
                        <button
                            type="button"
                            class="rounded-md border border-primary-300 bg-white px-3 py-1.5 text-sm font-medium text-primary-900 disabled:opacity-60"
                            onclick={() => void createInvite(true)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Regenerating…' : 'Regenerate invite'}
                        </button>
                        <button
                            type="button"
                            class="rounded-md border border-primary-300 bg-white px-3 py-1.5 text-sm font-medium text-primary-900 disabled:opacity-50"
                            onclick={() => void revokeInvite(activeInvite.id)}
                            disabled={isRevokeDisabled(activeInvite)}
                            aria-label={`Revoke active invite ${displayedActiveInviteCode()}`}
                        >
                            {isRevokingInviteId === activeInvite.id ? 'Revoking…' : 'Revoke'}
                        </button>
                    </div>
                    {#if revealInviteCode}
                        <p class="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800">
                            New invite code: <span class="font-semibold">{revealInviteCode}</span>
                        </p>
                    {/if}
                </div>
            {/if}

            {#if expiredInvites.length === 0}
                <p class="mt-4 text-sm text-primary-700">No expired invites.</p>
            {:else}
                <div class="mt-4 overflow-x-auto">
                    <h3 class="mb-2 text-sm font-semibold text-primary-900">Expired Invites</h3>
                    <table class="min-w-full text-left text-sm text-primary-900">
                        <thead
                            class="border-b border-primary-200 text-xs tracking-wide text-primary-700 uppercase"
                        >
                            <tr>
                                <th class="py-2 pr-4">Masked Code</th>
                                <th class="py-2 pr-4">Status</th>
                                <th class="py-2 pr-4">Uses</th>
                                <th class="py-2">Expires</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each expiredInvites as invite (invite.id)}
                                <tr class="border-b border-primary-100">
                                    <td class="py-2 pr-4">{invite.codeMasked}</td>
                                    <td class="py-2 pr-4 capitalize">{invite.status}</td>
                                    <td class="py-2 pr-4">
                                        Uses: {usedInviteCount(invite)} / {invite.maxUses}
                                    </td>
                                    <td class="py-2"
                                        >{new Date(invite.expiresAt).toLocaleDateString()}</td
                                    >
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </section>
    </div>
</main>
