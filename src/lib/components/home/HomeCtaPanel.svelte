<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Button } from 'flowbite-svelte';

	let isAuthenticated = $derived(Boolean(page.data.sessionUser));
</script>

<section class="rounded-2xl bg-primary-700 p-12 text-center sm:p-16">
	<h2 class="text-3xl font-bold text-white sm:text-4xl">Ready to make mealtimes easier?</h2>
	<p class="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
		Start planning meals your family will actually eat — allergies, preferences, and fussy eaters
		included.
	</p>
	<p class="mt-2 text-sm text-primary-200">Join 2,000+ parents making mealtimes easier</p>

	<div class="mt-8 flex flex-wrap items-center justify-center gap-4">
		{#if isAuthenticated}
			<Button color="light" href={resolve('/household')}>Plan Your Week</Button>
			<Button outline color="light" href={resolve('/recipes')}>Browse Recipes</Button>
		{:else}
			<Button color="light" href={resolve('/register')}>Join the Club</Button>
			<Button outline color="light" href={resolve('/recipes')}>See Our Recipes</Button>
		{/if}
	</div>
</section>
