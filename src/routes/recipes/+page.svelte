<script lang="ts">
	import { Badge, Button, Input } from 'flowbite-svelte';
	import { SearchOutline } from 'flowbite-svelte-icons';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state(data.q);

	$effect(() => {
		searchQuery = data.q;
	});

	let totalPages = $derived(Math.max(1, Math.ceil(data.total / data.pageSize)));
	let isLastPage = $derived(data.page >= totalPages);
	let isFirstPage = $derived(data.page <= 1);

	function handleSearch(event: SubmitEvent): void {
		event.preventDefault();
		const params = new URLSearchParams();
		if (searchQuery.trim()) params.set('q', searchQuery.trim());
		void goto(`${resolve('/recipes')}?${params.toString()}`, { keepFocus: true });
	}

	function goToPage(page: number): void {
		const params = new URLSearchParams();
		if (data.q) params.set('q', data.q);
		if (page > 1) params.set('page', String(page));
		void goto(`${resolve('/recipes')}?${params.toString()}`);
	}

	function stripMarkdown(text: string): string {
		return text
			.replace(/[#*_~`>\[\]()!|-]/g, '')
			.replace(/\n+/g, ' ')
			.trim();
	}

	function snippet(text: string, maxLength = 100): string {
		const plain = stripMarkdown(text);
		if (plain.length <= maxLength) return plain;
		return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…';
	}

	function formatTotalTime(timings?: {
		prepMinutes?: number;
		cookMinutes?: number;
	}): string | null {
		if (!timings) return null;
		const total = (timings.prepMinutes ?? 0) + (timings.cookMinutes ?? 0);
		if (total <= 0) return null;
		return `${total} min total`;
	}
</script>

{#snippet errorState()}
	<div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
		<h1 class="text-2xl font-semibold text-primary-900">Something went wrong</h1>
		<p class="mt-3 text-primary-700">
			We're having trouble loading recipes right now. Please try again later.
		</p>
		<div class="mt-6">
			<Button href={resolve('/recipes')} color="primary">Try again</Button>
		</div>
	</div>
{/snippet}

{#snippet emptyState()}
	<div class="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
		<h2 class="text-xl font-semibold text-primary-900">No recipes found</h2>
		<p class="mt-3 text-primary-700">
			{#if data.q}
				No results for "<span class="font-medium">{data.q}</span>". Try different search terms or
				browse all recipes.
			{:else}
				There are no recipes to show yet.
			{/if}
		</p>
		{#if data.q}
			<div class="mt-6">
				<Button href={resolve('/recipes')} color="primary">Browse all recipes</Button>
			</div>
		{/if}
	</div>
{/snippet}

{#snippet recipeCard(item: PageData['items'][number])}
	{@const timeLabel = formatTotalTime(item.timings)}
	<a
		href={resolve(`/recipes/${item.id}`)}
		class="group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
	>
		<div class="overflow-hidden">
			<img
				src={item.imageUrl ?? '/images/recipe-no-image.jpg'}
				alt={item.title}
				class="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
			/>
		</div>

		<div class="flex flex-1 flex-col p-4">
			<h3 class="text-lg font-semibold text-primary-900 group-hover:text-primary-700">
				{item.title}
			</h3>

			{#if item.description}
				<p class="mt-1 text-sm text-primary-600">{snippet(item.description)}</p>
			{/if}

			<div class="mt-3 flex flex-wrap items-center gap-2 text-xs text-primary-600">
				{#if timeLabel}
					<span class="flex items-center gap-1">
						<span>⏱</span>
						{timeLabel}
					</span>
				{/if}
				{#if item.type === 'reference'}
					<Badge color="gray" class="text-xs">External source</Badge>
				{:else}
					<Badge color="primary" class="text-xs">Full recipe</Badge>
				{/if}
			</div>

			{#if item.tags.length > 0}
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each item.tags as tag (tag)}
						<Badge color="primary" class="text-xs">{tag}</Badge>
					{/each}
				</div>
			{/if}
		</div>
	</a>
{/snippet}

{#if data.error === 'unavailable'}
	{@render errorState()}
{:else}
	<main class="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
		<h1 class="text-3xl font-bold text-primary-900">Recipes</h1>

		<!-- Search bar -->
		<form class="mt-5 flex gap-2" onsubmit={handleSearch}>
			<Input
				type="search"
				placeholder="Search recipes..."
				bind:value={searchQuery}
				class="flex-1"
			/>
			<Button type="submit" color="primary">
				<SearchOutline class="mr-1 h-4 w-4" />
				Search
			</Button>
		</form>

		{#if data.items.length === 0}
			{@render emptyState()}
		{:else}
			<!-- Results count -->
			<p class="mt-4 text-sm text-primary-600">
				{data.total} recipe{data.total === 1 ? '' : 's'} found
				{#if data.q}&mdash; showing results for "<span class="font-medium">{data.q}</span>"{/if}
			</p>

			<!-- Card grid -->
			<div class="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
				{#each data.items as item (item.id)}
					{@render recipeCard(item)}
				{/each}
			</div>

			<!-- Pagination -->
			{#if totalPages > 1}
				<nav
					class="mt-8 flex items-center justify-between border-t border-primary-200 pt-4"
					aria-label="Pagination"
				>
					<Button
						color="alternative"
						disabled={isFirstPage}
						onclick={() => goToPage(data.page - 1)}
					>
						← Previous
					</Button>
					<span class="text-sm text-primary-700">
						Page {data.page} of {totalPages}
					</span>
					<Button
						color="alternative"
						disabled={isLastPage}
						onclick={() => goToPage(data.page + 1)}
					>
						Next →
					</Button>
				</nav>
			{/if}
		{/if}
	</main>
{/if}
