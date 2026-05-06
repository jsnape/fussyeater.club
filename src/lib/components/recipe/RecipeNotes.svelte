<script lang="ts">
    import { Textarea } from 'flowbite-svelte';

    let {
        mode,
        notes = $bindable()
    }: {
        mode: 'view' | 'edit';
        notes: string;
    } = $props();
</script>

{#if mode === 'edit'}
    <Textarea
        id="notes"
        bind:value={notes}
        placeholder="Any additional notes"
        rows={3}
        maxlength={2000}
        class="w-full"
    />
{:else if notes}
    <div class="prose-primary prose max-w-none">
        <p>{notes}</p>
    </div>
{/if}
