<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import SiteNavbar from '$lib/components/layout/SiteNavbar.svelte';
    import type { LayoutData } from './$types';

    let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
    let signedInLabel = $derived(data.sessionUser?.name ?? data.sessionUser?.email ?? null);
    let canManageHousehold = $derived(Boolean(data.canManageHousehold));
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-dvh bg-slate-50">
    <SiteNavbar
        isAuthenticated={Boolean(data.sessionUser)}
        userLabel={signedInLabel}
        {canManageHousehold}
    />

    <main>
        {@render children()}
    </main>
</div>
