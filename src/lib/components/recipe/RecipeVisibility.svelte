<script lang="ts">
    import { Radio } from 'flowbite-svelte';

    let {
        mode,
        visibility = $bindable()
    }: {
        mode: 'view' | 'edit';
        visibility: 'public' | 'private';
    } = $props();
</script>

{#if mode === 'edit'}
    <div class="flex gap-6">
        <Radio name="visibility" value="private" bind:group={visibility}>Household</Radio>
        <Radio name="visibility" value="public" bind:group={visibility}>Everyone</Radio>
    </div>
{:else}
    <span
        class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {visibility ===
        'public'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'}"
    >
        {visibility === 'public' ? 'Public' : 'Household only'}
    </span>
{/if}
