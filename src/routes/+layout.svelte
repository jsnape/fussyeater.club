<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<div class="min-h-dvh bg-primary-50">
	<header class="border-b border-primary-200 bg-white/90 backdrop-blur">
		<nav class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3 md:px-10" aria-label="Main">
			<a href="/" class="text-base font-semibold text-primary-900">FussyEater Club</a>
			<div class="flex items-center gap-4 text-sm font-medium text-primary-800">
				<a href="/" class="hover:text-primary-900">Home</a>
				<a href="/design" class="hover:text-primary-900">Design</a>
			</div>
		</nav>
	</header>

	<main>
		{@render children()}
	</main>
</div>
