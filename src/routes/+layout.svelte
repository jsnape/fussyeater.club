<script lang="ts">
    import './layout.css';
    import favicon from '$lib/assets/favicon.svg';
    import SiteNavbar from '$lib/components/layout/SiteNavbar.svelte';

    let { children, data } = $props();
    let signedInLabel = $derived(data.sessionUser?.name ?? data.sessionUser?.email ?? null);
    let canManageHousehold = $derived(
        Boolean((data as { canManageHousehold?: boolean }).canManageHousehold)
    );
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-dvh bg-primary-50">
    <SiteNavbar
        isAuthenticated={Boolean(data.sessionUser)}
        userLabel={signedInLabel}
        canManageHousehold={canManageHousehold}
    />

    <main>
        {@render children()}
    </main>
</div>
