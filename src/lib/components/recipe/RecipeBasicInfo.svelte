<script lang="ts">
    import { Input, Label, Textarea } from 'flowbite-svelte';

    let {
        mode,
        title = $bindable(),
        description = $bindable()
    }: {
        mode: 'view' | 'edit';
        title: string;
        description: string;
    } = $props();
</script>

{#if mode === 'edit'}
    <div>
        <Label for="title" class="mb-1 text-sm font-medium text-slate-700">Title</Label>
        <Input
            id="title"
            type="text"
            bind:value={title}
            placeholder="Recipe title"
            aria-required="true"
            maxlength={200}
        />
    </div>

    <div class="mt-4">
        <Label for="description" class="mb-1 text-sm font-medium text-slate-700"
            >Description</Label
        >
        <Textarea
            id="description"
            bind:value={description}
            placeholder="A short description of the recipe"
            rows={3}
            maxlength={2000}
            class="w-full"
        />
    </div>
{:else}
    <h1 class="mt-6 text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h1>

    {#if description}
        <div class="prose-primary prose mt-4 max-w-none">
            <p>{description}</p>
        </div>
    {/if}
{/if}
