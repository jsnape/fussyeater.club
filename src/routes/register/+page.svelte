<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { apiFetch, ApiError } from '$lib/api';
    import { getCookieValue } from '$lib/browser/cookies';
    import type { components } from '$lib/api-types';
    import type { PageData } from './$types';

    type HouseholdAction = 'create' | 'join';

    type InviteRedeemResponse = components['schemas']['InviteRedeemResponse'];

    let { data }: { data: PageData } = $props();
    let name = $state('');
    let email = $state('');
    let password = $state('');
    let confirmPassword = $state('');
    let householdAction = $state<HouseholdAction>('create');
    let householdName = $state('');
    let inviteCode = $state('');
    let joinIntentToken = $state('');
    let redeemedHouseholdName = $state('');
    let idempotencyKey = $state(crypto.randomUUID());

    let isRedeeming = $state(false);
    let isSubmitting = $state(false);
    let inviteMessage = $state('');
    let inviteError = $state('');
    let submitMessage = $state('');
    let submitError = $state('');

    const isJoinMode = $derived(householdAction === 'join');
    const cleanedInviteCode = $derived(inviteCode.trim().toUpperCase());

    function inviteErrorMessage(status: number): string {
        switch (status) {
            case 409:
                return 'You are already part of a household.';
            case 410:
                return 'This invite is no longer valid. Ask for a new one.';
            case 429:
                return 'Too many invite attempts. Please wait and try again.';
            case 503:
                return 'Invite service is temporarily unavailable. Try again shortly.';
            default:
                return 'Unable to redeem invite right now.';
        }
    }

    function submitErrorMessage(status: number): string {
        switch (status) {
            case 409:
                return 'This account is already in a household.';
            case 410:
                return 'Your join invitation has expired. Redeem the invite again.';
            case 429:
                return 'Too many registration attempts. Please wait and retry.';
            case 503:
                return 'Registration is temporarily unavailable. Please try again.';
            default:
                return 'Could not complete registration right now.';
        }
    }

    function cleanupInviteFromUrl(): void {
        const url = new URL(window.location.href);
        if (!url.searchParams.has('invite')) {
            return;
        }
        url.searchParams.delete('invite');

        // This is a URL cleanup, not a route navigation.
        history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
    }

    async function redeemInvite(auto = false): Promise<void> {
        if (!cleanedInviteCode) {
            inviteError = 'Enter an invite code to continue.';
            return;
        }

        inviteMessage = '';
        inviteError = '';
        submitError = '';
        isRedeeming = true;
        try {
            const result = await apiFetch<InviteRedeemResponse>('/api/invites/redeem', {
                method: 'POST',
                body: JSON.stringify({ code: cleanedInviteCode })
            });
            householdAction = 'join';
            joinIntentToken = result.joinIntentToken;
            redeemedHouseholdName = result.household.name;
            inviteMessage = auto
                ? `Invite applied for ${result.household.name}.`
                : `Joined invite for ${result.household.name}.`;
            cleanupInviteFromUrl();
        } catch (error) {
            if (error instanceof ApiError) {
                inviteError = inviteErrorMessage(error.status);
                return;
            }
            inviteError = 'Network error while redeeming invite.';
        } finally {
            isRedeeming = false;
        }
    }

    async function submitRegistration(event: SubmitEvent): Promise<void> {
        event.preventDefault();
        submitMessage = '';
        submitError = '';

        if (isJoinMode && !joinIntentToken) {
            submitError = 'Redeem your invite before completing registration.';
            return;
        }

        if (!data.socialContinuation && password !== confirmPassword) {
            submitError = 'Passwords do not match.';
            return;
        }

        isSubmitting = true;
        try {
            const csrfToken = getCookieValue('csrf-token');
            await apiFetch('/api/register/complete', {
                method: 'POST',
                headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
                body: JSON.stringify({
                    name,
                    email,
                    password: data.socialContinuation ? undefined : password,
                    confirmPassword: data.socialContinuation ? undefined : confirmPassword,
                    householdAction,
                    householdName: isJoinMode ? undefined : householdName,
                    joinIntentToken: isJoinMode ? joinIntentToken : undefined,
                    idempotencyKey
                })
            });
            submitMessage = 'Registration complete. Please log in to continue.';
            await goto(resolve('/login'));
            idempotencyKey = crypto.randomUUID();
        } catch (error) {
            if (error instanceof ApiError) {
                submitError = submitErrorMessage(error.status);
                return;
            }
            submitError = 'Network error while completing registration.';
        } finally {
            isSubmitting = false;
        }
    }

    onMount(() => {
        email = data.socialEmail ?? '';
        inviteCode = data.inviteCode ?? '';
        householdAction = data.inviteCode ? 'join' : 'create';
        if (
            data.inviteCode &&
            !sessionStorage.getItem(`register:auto-redeemed:${data.inviteCode}`)
        ) {
            sessionStorage.setItem(`register:auto-redeemed:${data.inviteCode}`, '1');
            void redeemInvite(true);
        }
    });
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
    <section class="mx-auto max-w-xl rounded-lg border border-primary-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-semibold text-primary-900">Create your account</h1>
        <p class="mt-2 text-sm text-primary-700">
            Choose whether to create a new household or join with an invite.
        </p>

        {#if data.socialContinuation}
            <p class="mt-3 rounded-md bg-primary-100 px-3 py-2 text-sm text-primary-800">
                Continuing with Microsoft. Password is not required.
            </p>
        {/if}

        <form class="mt-6 space-y-4" onsubmit={submitRegistration}>
            <div>
                <label class="mb-1 block text-sm font-medium text-primary-900" for="name"
                    >Full name</label
                >
                <input
                    id="name"
                    class="w-full rounded-md border border-primary-300 px-3 py-2"
                    type="text"
                    autocomplete="name"
                    bind:value={name}
                    required
                />
            </div>

            <div>
                <label class="mb-1 block text-sm font-medium text-primary-900" for="email"
                    >Email</label
                >
                <input
                    id="email"
                    class="w-full rounded-md border border-primary-300 px-3 py-2"
                    type="email"
                    autocomplete="email"
                    bind:value={email}
                    readonly={data.socialContinuation && Boolean(data.socialEmail)}
                    required
                />
            </div>

            {#if !data.socialContinuation}
                <div>
                    <label class="mb-1 block text-sm font-medium text-primary-900" for="password"
                        >Password</label
                    >
                    <input
                        id="password"
                        class="w-full rounded-md border border-primary-300 px-3 py-2"
                        type="password"
                        autocomplete="new-password"
                        minlength="8"
                        bind:value={password}
                        required
                    />
                </div>

                <div>
                    <label
                        class="mb-1 block text-sm font-medium text-primary-900"
                        for="confirm-password">Confirm password</label
                    >
                    <input
                        id="confirm-password"
                        class="w-full rounded-md border border-primary-300 px-3 py-2"
                        type="password"
                        autocomplete="new-password"
                        minlength="8"
                        bind:value={confirmPassword}
                        required
                    />
                </div>
            {/if}

            <fieldset class="space-y-2">
                <legend class="text-sm font-medium text-primary-900">Household</legend>
                <label class="flex items-center gap-2 text-sm text-primary-800">
                    <input
                        type="radio"
                        name="household-action"
                        value="create"
                        bind:group={householdAction}
                    />
                    Create a new household
                </label>
                <label class="flex items-center gap-2 text-sm text-primary-800">
                    <input
                        type="radio"
                        name="household-action"
                        value="join"
                        bind:group={householdAction}
                    />
                    Join with an invite
                </label>
            </fieldset>

            {#if isJoinMode}
                <div class="space-y-3 rounded-md border border-primary-200 bg-primary-50 p-3">
                    <div>
                        <label
                            class="mb-1 block text-sm font-medium text-primary-900"
                            for="invite-code">Invite code</label
                        >
                        <input
                            id="invite-code"
                            class="w-full rounded-md border border-primary-300 px-3 py-2 uppercase"
                            type="text"
                            bind:value={inviteCode}
                            placeholder="ABC12345"
                        />
                    </div>
                    <button
                        type="button"
                        class="rounded-md bg-primary-800 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
                        onclick={() => void redeemInvite(false)}
                        disabled={isRedeeming}
                    >
                        {isRedeeming ? 'Redeeming…' : 'Redeem invite'}
                    </button>
                    {#if redeemedHouseholdName}
                        <p class="text-sm text-green-700">
                            Invite applied for: {redeemedHouseholdName}
                        </p>
                    {/if}
                    {#if inviteMessage}
                        <p class="text-sm text-green-700">{inviteMessage}</p>
                    {/if}
                    {#if inviteError}
                        <p class="text-sm text-red-700">{inviteError}</p>
                    {/if}
                </div>
            {:else}
                <div>
                    <label
                        class="mb-1 block text-sm font-medium text-primary-900"
                        for="household-name">Household name</label
                    >
                    <input
                        id="household-name"
                        class="w-full rounded-md border border-primary-300 px-3 py-2"
                        type="text"
                        bind:value={householdName}
                        required={!isJoinMode}
                    />
                </div>
            {/if}

            {#if submitMessage}
                <p class="text-sm text-green-700">{submitMessage}</p>
            {/if}
            {#if submitError}
                <p class="text-sm text-red-700">{submitError}</p>
            {/if}

            <button
                type="submit"
                class="w-full rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Completing registration…' : 'Complete registration'}
            </button>
        </form>
    </section>
</main>
