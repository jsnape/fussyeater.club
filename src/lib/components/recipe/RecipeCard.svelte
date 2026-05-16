<script lang="ts">
    import { ClockOutline, LinkOutline } from 'flowbite-svelte-icons';
    import { resolve } from '$app/paths';
    import type { components } from '$lib/api-types';

    type RecipeSummary = components['schemas']['RecipeSummary'];

    const MAX_VISIBLE_TAGS = 3;

    let { recipe }: { recipe: RecipeSummary } = $props();

    function stripMarkdown(text: string): string {
        return text
            .replace(/[#*_~`>[\]()!|-]/g, '')
            .replace(/\n+/g, ' ')
            .trim();
    }

    function formatTotalTime(timings?: {
        prepMinutes?: number;
        cookMinutes?: number;
    }): string | null {
        if (!timings) return null;
        const total = (timings.prepMinutes ?? 0) + (timings.cookMinutes ?? 0);
        if (total <= 0) return null;

        if (total < 60) return `${total} min`;

        const hours = Math.floor(total / 60);
        const remainder = total % 60;
        return remainder > 0 ? `${hours} hr ${remainder} min` : `${hours} hr`;
    }

    let timeLabel = $derived(formatTotalTime(recipe.timings));
    let visibleTags = $derived(recipe.tags.slice(0, MAX_VISIBLE_TAGS));
    let extraTagCount = $derived(recipe.tags.length - MAX_VISIBLE_TAGS);
    let plainDescription = $derived(recipe.description ? stripMarkdown(recipe.description) : null);
</script>

<a
    href={resolve(`/recipes/${recipe.id}`)}
    class="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-md"
>
    <!-- Image area -->
    <div class="relative overflow-hidden">
        <img
            src={recipe.imageUrl ?? '/images/recipe-no-image.jpg'}
            alt={recipe.title}
            class="aspect-video w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {#if timeLabel}
            <span
                class="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white"
            >
                <ClockOutline class="h-3.5 w-3.5" />
                {timeLabel}
            </span>
        {/if}
    </div>

    <!-- Content area -->
    <div class="flex flex-1 flex-col p-5">
        <h3 class="line-clamp-2 text-lg font-semibold text-slate-900 group-hover:text-primary-600">
            {recipe.title}
        </h3>

        {#if plainDescription}
            <p class="mt-1 line-clamp-2 text-sm text-slate-600">
                {plainDescription}
            </p>
        {/if}

        {#if recipe.tags.length > 0}
            <div class="mt-3 flex flex-wrap gap-1.5">
                {#each visibleTags as tag (tag)}
                    <span
                        class="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700"
                    >
                        {tag}
                    </span>
                {/each}
                {#if extraTagCount > 0}
                    <span
                        class="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500"
                    >
                        +{extraTagCount} more
                    </span>
                {/if}
            </div>
        {/if}

        <!-- Footer -->
        {#if recipe.type === 'reference'}
            <div class="mt-auto flex items-center gap-1 pt-4 text-xs text-slate-400">
                <LinkOutline class="h-3.5 w-3.5" />
                <span>External source</span>
            </div>
        {/if}
    </div>
</a>
