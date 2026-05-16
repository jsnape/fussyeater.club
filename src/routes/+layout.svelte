<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import MobileTabBar from '$lib/components/layout/MobileTabBar.svelte';
    import SiteNavbar from '$lib/components/layout/SiteNavbar.svelte';
    import type { LayoutData } from './$types';

    let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
    let isAuthenticated = $derived(Boolean(data.sessionUser));
    let signedInLabel = $derived(data.sessionUser?.name ?? data.sessionUser?.email ?? null);
    let canManageHousehold = $derived(Boolean(data.canManageHousehold));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-dvh bg-slate-50" class:pb-[calc(4rem+env(safe-area-inset-bottom))]={isAuthenticated}>
    <SiteNavbar
        {isAuthenticated}
        userLabel={signedInLabel}
        {canManageHousehold}
    />

    <main>
        {@render children()}
    </main>

    <MobileTabBar {isAuthenticated} />
</div>
