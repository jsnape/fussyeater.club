<script lang="ts">
    import { Badge } from 'flowbite-svelte';
    import { resolve } from '$app/paths';
    import type { components } from '$lib/api-types';

    type RecipeSummary = components['schemas']['RecipeSummary'];

    let { recipe }: { recipe: RecipeSummary } = $props();

    function stripMarkdown(text: string): string {
        return text
            .replace(/[#*_~`>[\]()!|-]/g, '')
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

    let timeLabel = $derived(formatTotalTime(recipe.timings));
</script>

<a
    href={resolve(`/recipes/${recipe.id}`)}
    class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
>
    <div class="overflow-hidden">
        <img
            src={recipe.imageUrl ?? '/images/recipe-no-image.jpg'}
            alt={recipe.title}
            class="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
    </div>

    <div class="flex flex-1 flex-col p-6">
        <h3 class="text-lg font-semibold text-slate-900 group-hover:text-primary-600">
            {recipe.title}
        </h3>

        {#if recipe.description}
            <p class="mt-1 text-base text-slate-600">{snippet(recipe.description)}</p>
        {/if}

        <div class="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            {#if timeLabel}
                <span class="flex items-center gap-1">
                    <span>⏱</span>
                    {timeLabel}
                </span>
            {/if}
            {#if recipe.type === 'reference'}
                <Badge color="gray" class="text-xs">External source</Badge>
            {:else}
                <Badge color="primary" class="text-xs">Full recipe</Badge>
            {/if}
        </div>

        {#if recipe.tags.length > 0}
            <div class="mt-3 flex flex-wrap gap-1.5">
                {#each recipe.tags as tag (tag)}
                    <Badge color="primary" class="text-xs">{tag}</Badge>
                {/each}
            </div>
        {/if}
    </div>
</a>
