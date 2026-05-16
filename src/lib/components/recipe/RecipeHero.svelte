<script lang="ts">
    import { Input, Label } from 'flowbite-svelte';

    let {
        mode,
        imageUrl = $bindable(),
        title
    }: {
        mode: 'view' | 'edit';
        imageUrl: string;
        title: string;
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
    <div class="overflow-hidden rounded-xl">
        <img
            src={imageUrl || '/images/recipe-no-image.jpg'}
            alt={title}
            class="aspect-video w-full object-cover"
        />
    </div>
{/if}
