<script lang="ts">
    import { Input, Label } from 'flowbite-svelte';
    import { LinkOutline } from 'flowbite-svelte-icons';
    import { resolve } from '$app/paths';

    let {
        mode,
        imageUrl = $bindable(),
        title,
        recipeType = 'full'
    }: {
        mode: 'view' | 'edit';
        imageUrl: string;
        title: string;
        recipeType?: 'full' | 'reference';
    } = $props();
</script>

{#if mode === 'edit'}
    <div>
        <Label for="image-url" class="mb-1 text-sm font-medium text-slate-700">Image URL</Label>
        <Input
            id="image-url"
            type="url"
            bind:value={imageUrl}
            placeholder="https://example.com/image.jpg"
        />
    </div>
{:else}
    <div class="relative overflow-hidden rounded-2xl">
        <img
            src={imageUrl || '/images/recipe-no-image.jpg'}
            alt={title}
            class="aspect-[21/9] w-full object-cover"
        />
        <!-- Gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
        </div>
        <!-- Back breadcrumb -->
        <a
            href={resolve('/recipes')}
            class="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white"
        >
            ← Recipes
        </a>
        <!-- Recipe type badge (reference only) -->
        {#if recipeType === 'reference'}
            <span
                class="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm"
            >
                <LinkOutline class="h-3.5 w-3.5" />
                External Recipe
            </span>
        {/if}
    </div>
{/if}
