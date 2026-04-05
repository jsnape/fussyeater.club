<script lang="ts">
    import { apiFetch, ApiError } from '$lib/api';
    import { goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    let email = $state('');
    let password = $state('');
    let inviteCode = $derived(data.inviteCode ?? '');
    let loginError = $state('');
    let isSubmitting = $state(false);

    function getCookieValue(name: string): string | null {
        const token = document.cookie
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith(`${name}=`))
            ?.slice(name.length + 1);
        return token ? decodeURIComponent(token) : null;
    }

    async function submitLogin(event: SubmitEvent): Promise<void> {
        event.preventDefault();
        loginError = '';
        isSubmitting = true;
        try {
            const csrfToken = getCookieValue('csrf-token');
            await apiFetch('/api/auth/login', {
                method: 'POST',
                headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
                body: JSON.stringify({ email, password })
            });
            await invalidate('auth:session');
            await goto(resolve('/'));
        } catch (error) {
            if (error instanceof ApiError) {
                loginError =
                    error.status === 401
                        ? 'Invalid credentials.'
                        : error.status === 403
                          ? 'Security check failed. Refresh and try again.'
                          : 'Unable to sign in right now.';
                return;
            }
            loginError = 'Unable to sign in right now.';
        } finally {
            isSubmitting = false;
        }
    }
</script>

<main class="min-h-dvh bg-primary-50 px-6 py-8 md:px-10 md:py-12">
    <section class="mx-auto max-w-md rounded-lg border border-primary-200 bg-white p-6 shadow-sm">
        <h1 class="text-2xl font-semibold text-primary-900">Log in</h1>
        <p class="mt-2 text-sm text-primary-700">Use your email and password to continue.</p>

        {#if inviteCode}
            <div
                class="mt-4 rounded-md border border-primary-200 bg-primary-50 p-3 text-sm text-primary-800"
            >
                <p class="font-medium">Invite detected: {inviteCode}</p>
                <label class="mt-2 block text-xs font-medium text-primary-700" for="invite-code"
                    >Invite code</label
                >
                <input
                    id="invite-code"
                    class="mt-1 w-full rounded-md border border-primary-300 bg-white px-3 py-2 font-mono text-sm uppercase"
                    type="text"
                    value={inviteCode}
                    readonly
                />
                <p class="mt-1">
                    Need an account?
                    <button
                        type="button"
                        class="text-primary-900 underline"
                        onclick={() => {
                            if (inviteCode) {
                                const url = new URL(resolve('/register'), window.location.origin);
                                url.searchParams.set('invite', inviteCode);
                                window.location.href = `${url.pathname}${url.search}`;
                                return;
                            }

                            void goto(resolve('/register'));
                        }}>Register with this invite</button
                    >
                </p>
            </div>
        {/if}

        <form class="mt-6 space-y-4" onsubmit={submitLogin}>
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
                    required
                />
            </div>

            <div>
                <label class="mb-1 block text-sm font-medium text-primary-900" for="password"
                    >Password</label
                >
                <input
                    id="password"
                    class="w-full rounded-md border border-primary-300 px-3 py-2"
                    type="password"
                    autocomplete="current-password"
                    bind:value={password}
                    required
                />
            </div>

            <button
                type="submit"
                class="w-full rounded-md bg-primary-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Signing in…' : 'Log in'}
            </button>
            {#if loginError}
                <p class="text-sm text-red-700">{loginError}</p>
            {/if}
        </form>

        {#if data.microsoftOAuthEnabled}
            <div class="mt-4 border-t border-primary-200 pt-4">
                <button
                    type="button"
                    class="w-full rounded-md border border-primary-300 px-4 py-2 text-sm font-medium text-primary-900"
                    disabled
                    aria-disabled="true"
                    title="Microsoft sign-in is coming soon"
                    aria-label="Continue with Microsoft (coming soon)"
                >
                    Continue with Microsoft
                </button>
            </div>
        {/if}
    </section>
</main>
