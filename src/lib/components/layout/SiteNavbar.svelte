<script lang="ts">
    import { invalidate, invalidateAll } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { NavBrand, NavHamburger, NavLi, Navbar, NavUl } from 'flowbite-svelte';
    import { ApiError, apiFetch } from '$lib/api';
    import { getCookieValue } from '$lib/browser/cookies';
    import { getSiteNavLinks } from '$lib/components/layout/nav-links';

    let { isAuthenticated = false, userLabel = null, canManageHousehold = false } = $props();
    let activeUrl = $derived(page.url.pathname);
    let navLinks = $derived(getSiteNavLinks({ canManageHousehold }));

    async function logout(): Promise<void> {
        const csrfToken = getCookieValue('csrf-token');
        try {
            await apiFetch<{ ok: true }>('/logout', {
                method: 'POST',
                headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
                body: JSON.stringify({})
            });
        } catch (error) {
            if (!(error instanceof ApiError) || error.status >= 500) {
                await invalidate('auth:session');
                await invalidateAll();
                return;
            }
        }
        await invalidate('auth:session');
        await invalidateAll();
    }
</script>

<header class="shadow-sm bg-white/90 backdrop-blur">
    <Navbar fluid class="mx-auto w-full max-w-6xl px-6 py-4 md:px-10" aria-label="Main">
        <NavBrand href="/" class="text-lg font-semibold text-slate-900"
            >Fussy Eater Club</NavBrand
        >
        <NavHamburger />
        <NavUl {activeUrl} class="text-base font-medium text-slate-700">
            {#each navLinks as link (link.href)}
                <NavLi href={link.href}>{link.label}</NavLi>
            {/each}
            {#if isAuthenticated}
                <li
                    class="flex items-center rounded-full bg-primary-100 px-3 py-1 text-sm font-semibold tracking-wide text-primary-800"
                >
                    Signed in{#if userLabel}: {userLabel}{/if}
                </li>
                <li>
                    <button type="button" class="py-2 text-sm text-slate-500 hover:text-slate-700" onclick={() => void logout()}>Logout</button>
                </li>
            {:else}
                <NavLi href={resolve('/login')}>Login</NavLi>
            {/if}
        </NavUl>
    </Navbar>
</header>
