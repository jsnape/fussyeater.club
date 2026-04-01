<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<nav>
	<a href="/">Home</a>
	<a href="/recipes">Recipes</a>
	<a href="/meal-plan">Meal Plan</a>
	<a href="/shopping-list">Shopping List</a>
	<a href="/store-cupboard">Store Cupboard</a>
	<a href="/household">Household</a>
</nav>

<main>
	{@render children()}
</main>
