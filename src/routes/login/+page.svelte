<script lang="ts">
    import { apiFetch, ApiError } from '$lib/api';
    import { goto, invalidate } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { EyeOutline, EyeSlashOutline } from 'flowbite-svelte-icons';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();

    let email = $state('');
    let password = $state('');
    let inviteCode = $derived(data.inviteCode ?? '');
    let loginError = $state('');
    let isSubmitting = $state(false);
    let showPassword = $state(false);

    let registerHref = $derived.by(() => {
        const base = resolve('/register');
        if (!inviteCode) return base;
        return `${base}?invite=${encodeURIComponent(inviteCode)}`;
    });

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

<main class="flex min-h-dvh flex-col items-center justify-center bg-slate-50 px-6 py-10 md:px-10 md:py-16">
    <a href={resolve('/')} class="mb-6 text-2xl font-bold text-primary-700">Fussy Eater Club</a>

    <section class="mx-auto w-full max-w-md rounded-2xl bg-white p-8 shadow-md">
        <h1 class="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p class="mt-2 text-base text-slate-600">Sign in to your Fussy Eater Club account</p>

        {#if inviteCode}
            <div class="mt-4 rounded-xl bg-primary-50 p-4 text-base text-slate-700">
                <p class="font-medium">Invite detected: {inviteCode}</p>
                <label class="mt-2 block text-xs font-medium text-slate-600" for="invite-code"
                    >Invite code</label
                >
                <input
                    id="invite-code"
                    class="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm uppercase"
                    type="text"
                    value={inviteCode}
                    readonly
                />
                <p class="mt-1">
                    Need an account?
                    <button
                        type="button"
                        class="text-primary-700 underline"
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

        {#if loginError}
            <div class="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {loginError}
            </div>
        {/if}

        <form class="mt-6 space-y-6" onsubmit={submitLogin}>
            <div>
                <label class="mb-1 block text-sm font-medium text-slate-900" for="email"
                    >Email</label
                >
                <input
                    id="email"
                    class="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                    type="email"
                    autocomplete="email"
                    bind:value={email}
                    required
                />
            </div>

            <div>
                <label class="mb-1 block text-sm font-medium text-slate-900" for="password"
                    >Password</label
                >
                <div class="relative">
                    <input
                        id="password"
                        class="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-10"
                        type={showPassword ? 'text' : 'password'}
                        autocomplete="current-password"
                        bind:value={password}
                        required
                    />
                    <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        onclick={() => (showPassword = !showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {#if showPassword}
                            <EyeSlashOutline class="h-5 w-5" />
                        {:else}
                            <EyeOutline class="h-5 w-5" />
                        {/if}
                    </button>
                </div>
                <div class="mt-1 text-right">
                    <!-- eslint-disable-next-line svelte/valid-compile -- placeholder until forgot-password route exists -->
                    <a href={'#'} class="text-sm text-primary-600 hover:text-primary-800"
                        >Forgot password?</a
                    >
                </div>
            </div>

            <button
                type="submit"
                class="w-full rounded-xl bg-primary-700 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
        </form>

        {#if data.microsoftOAuthEnabled}
            <div class="mt-6 flex items-center gap-4">
                <div class="h-px flex-1 bg-slate-200"></div>
                <span class="text-sm text-slate-400">or</span>
                <div class="h-px flex-1 bg-slate-200"></div>
            </div>
            <div class="mt-6">
                <button
                    type="button"
                    class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-900"
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

    <p class="mt-6 text-center text-sm text-slate-500">
        Don't have an account?
        <a
            href={registerHref}
            class="font-medium text-primary-600 hover:text-primary-800">Register</a
        >
    </p>
</main>
