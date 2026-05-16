<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Button } from 'flowbite-svelte';

    let {
        heading,
        description,
        actionLabel,
        actionHref,
        icon
    }: {
        heading: string;
        description?: string;
        actionLabel?: string;
        actionHref?: string;
        icon?: Snippet;
    } = $props();
</script>

<div class="mx-auto max-w-md py-16 text-center">
    {#if icon}
        <div class="mb-4 flex justify-center">
            <div class="inline-flex rounded-full bg-primary-50 p-4">
                {@render icon()}
            </div>
        </div>
    {/if}

    <h2 class="text-xl font-semibold text-slate-900">{heading}</h2>

    {#if description}
        <p class="mt-2 text-base text-slate-500">{description}</p>
    {/if}

    {#if actionLabel && actionHref}
        <div class="mt-6">
            <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- generic component, href already resolved by caller -->
            <Button href={actionHref} color="primary">{actionLabel}</Button>
        </div>
    {/if}
</div>
