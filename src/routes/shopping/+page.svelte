<script lang="ts">
    import { CartPlusOutline } from 'flowbite-svelte-icons';
    import EmptyState from '$lib/components/ui/EmptyState.svelte';
</script>

<main class="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
    <h1 class="text-3xl font-bold text-slate-900">Shopping List</h1>
    <div class="mt-10">
        <EmptyState
            heading="No shopping list yet"
            description="Once you plan your meals for the week, we'll generate an allergen-aware shopping list sorted by aisle."
        >
            {#snippet icon()}
                <CartPlusOutline class="h-12 w-12 text-primary-400" />
            {/snippet}
        </EmptyState>
    </div>
</main>
