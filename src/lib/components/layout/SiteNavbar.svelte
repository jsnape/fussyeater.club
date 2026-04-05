<script lang="ts">
    import { invalidate, invalidateAll } from '$app/navigation';
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { NavBrand, NavHamburger, NavLi, Navbar, NavUl } from 'flowbite-svelte';
    import { apiFetch } from '$lib/api';
    import { siteNavLinks } from '$lib/components/layout/nav-links';

    let { isAuthenticated = false, userLabel = null } = $props();
    let activeUrl = $derived(page.url.pathname);

    function getCookieValue(name: string): string | null {
        const token = document.cookie
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith(`${name}=`))
            ?.slice(name.length + 1);
        return token ? decodeURIComponent(token) : null;
    }

    async function logout(): Promise<void> {
        const csrfToken = getCookieValue('csrf-token');
        await apiFetch<{ ok: true }>('/logout', {
            method: 'POST',
            headers: csrfToken ? { 'x-csrf-token': csrfToken } : {},
            body: JSON.stringify({})
        });
        await invalidate('auth:session');
        await invalidateAll();
    }
</script>

<header class="border-b border-primary-200 bg-white/90 backdrop-blur">
    <Navbar fluid class="mx-auto w-full max-w-6xl px-6 py-3 md:px-10" aria-label="Main">
        <NavBrand href="/" class="text-base font-semibold text-primary-900"
            >Fussy Eater Club</NavBrand
        >
        <NavHamburger />
        <NavUl {activeUrl} class="text-sm font-medium text-primary-800">
            {#each siteNavLinks as link (link.href)}
                <NavLi href={link.href}>{link.label}</NavLi>
            {/each}
            {#if isAuthenticated}
                <li
                    class="flex items-center rounded bg-primary-100 px-2 py-1 text-xs font-semibold tracking-wide text-primary-900"
                >
                    Signed in{#if userLabel}: {userLabel}{/if}
                </li>
                <li>
                    <button type="button" class="py-2" onclick={() => void logout()}>Logout</button>
                </li>
            {:else}
                <NavLi href={resolve('/login')}>Login</NavLi>
            {/if}
        </NavUl>
    </Navbar>
</header>
