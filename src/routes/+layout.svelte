<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import SiteNavbar from '$lib/components/layout/SiteNavbar.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-dvh bg-primary-50">
	<SiteNavbar />

	<main>
		{@render children()}
	</main>
</div>
